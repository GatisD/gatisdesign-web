import { budgetLabel, serviceLabel } from "./contact-fields.js";
import type { ContactData } from "./contact-schema.js";

/** Vēstules saturs, ko padod sūtītājam. */
export type EmailMessage = {
  from: string;
  to: string;
  subject: string;
  text: string;
  html: string;
  replyTo?: string;
};

const SITE = "gatisdesign.com";

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** Rindkopas pārnesumi HTML vēstulē (teksts jau ir aizsargāts ar escapeHtml). */
function toHtmlParagraph(value: string): string {
  return escapeHtml(value).replace(/\r?\n/g, "<br />");
}

function shell(bodyHtml: string): string {
  return [
    '<div style="margin:0;padding:24px;background:#f5f2ec;font-family:Helvetica,Arial,sans-serif;color:#1a1613;">',
    '<div style="max-width:560px;margin:0 auto;background:#ffffff;border:1px solid #e3ddd2;border-radius:12px;padding:28px;">',
    bodyHtml,
    '<p style="margin:28px 0 0;padding-top:16px;border-top:1px solid #e9e4da;font-size:12px;color:#8a8074;">',
    escapeHtml(SITE),
    "</p>",
    "</div></div>",
  ].join("");
}

function row(term: string, value: string): string {
  return [
    '<tr><td style="padding:6px 12px 6px 0;font-size:13px;color:#8a8074;white-space:nowrap;vertical-align:top;">',
    escapeHtml(term),
    '</td><td style="padding:6px 0;font-size:14px;color:#1a1613;">',
    escapeHtml(value),
    "</td></tr>",
  ].join("");
}

/** Paziņojums Gatim. Vienmēr latviski - to lasa tikai viņš. */
export function buildNotificationEmail(
  data: ContactData,
  opts: { from: string; to: string },
): EmailMessage {
  const service = serviceLabel(data.service, "lv");
  const budget = budgetLabel(data.budget, "lv");
  const timeline = data.timeline?.trim() || "nav norādīts";
  const language = data.locale === "en" ? "EN" : "LV";

  const text = [
    `Jauns pieprasījums no ${SITE}`,
    "",
    `Vārds: ${data.name}`,
    `E-pasts: ${data.email}`,
    `Pakalpojums: ${service}`,
    `Budžets: ${budget}`,
    `Termiņš: ${timeline}`,
    `Formas valoda: ${language}`,
    "",
    "Ziņa:",
    data.message,
    "",
    `Atbildi tieši uz šo vēstuli - atbilde aizies uz ${data.email}.`,
  ].join("\n");

  const html = shell(
    [
      '<p style="margin:0 0 4px;font-size:12px;letter-spacing:0.14em;text-transform:uppercase;color:#b0682f;">Jauns pieprasījums</p>',
      '<h1 style="margin:0 0 20px;font-size:22px;font-weight:600;color:#1a1613;">',
      escapeHtml(data.name),
      "</h1>",
      '<table style="border-collapse:collapse;width:100%;">',
      row("E-pasts", data.email),
      row("Pakalpojums", service),
      row("Budžets", budget),
      row("Termiņš", timeline),
      row("Formas valoda", language),
      "</table>",
      '<p style="margin:22px 0 6px;font-size:12px;letter-spacing:0.14em;text-transform:uppercase;color:#8a8074;">Ziņa</p>',
      '<p style="margin:0;font-size:15px;line-height:1.6;color:#1a1613;">',
      toHtmlParagraph(data.message),
      "</p>",
    ].join(""),
  );

  return {
    from: opts.from,
    to: opts.to,
    replyTo: data.email,
    subject: `Jauns pieprasījums: ${service} - ${data.name}`,
    text,
    html,
  };
}

/** Automātiskā atbilde iesniedzējam viņa valodā. */
export function buildAutoReplyEmail(
  data: ContactData,
  opts: { from: string; replyTo: string },
): EmailMessage {
  const locale = data.locale === "en" ? "en" : "lv";
  const service = serviceLabel(data.service, locale);
  const budget = budgetLabel(data.budget, locale);
  const timeline = data.timeline?.trim();

  if (locale === "en") {
    const text = [
      `Hi ${data.name},`,
      "",
      "Thank you for your request. It has reached me and I reply within 24 hours on business days.",
      "",
      "What you sent:",
      `Service: ${service}`,
      `Budget: ${budget}`,
      ...(timeline ? [`Timeline: ${timeline}`] : []),
      "",
      data.message,
      "",
      "If you want to add anything, just reply to this email.",
      "",
      "Gatis Daugavietis",
      SITE,
      "",
      "This is an automatic confirmation.",
    ].join("\n");

    const html = shell(
      [
        '<h1 style="margin:0 0 16px;font-size:22px;font-weight:600;color:#1a1613;">Thank you, ',
        escapeHtml(data.name),
        "</h1>",
        '<p style="margin:0 0 18px;font-size:15px;line-height:1.6;color:#1a1613;">Your request has reached me. I reply within 24 hours on business days.</p>',
        '<table style="border-collapse:collapse;width:100%;">',
        row("Service", service),
        row("Budget", budget),
        ...(timeline ? [row("Timeline", timeline)] : []),
        "</table>",
        '<p style="margin:22px 0 6px;font-size:12px;letter-spacing:0.14em;text-transform:uppercase;color:#8a8074;">Your message</p>',
        '<p style="margin:0 0 20px;font-size:15px;line-height:1.6;color:#1a1613;">',
        toHtmlParagraph(data.message),
        "</p>",
        '<p style="margin:0;font-size:15px;line-height:1.6;color:#1a1613;">If you want to add anything, just reply to this email.<br />Gatis Daugavietis</p>',
      ].join(""),
    );

    return {
      from: opts.from,
      to: data.email,
      replyTo: opts.replyTo,
      subject: "Thank you for your request - Gatis Design",
      text,
      html,
    };
  }

  const text = [
    `Sveiki, ${data.name}!`,
    "",
    "Paldies par pieprasījumu. Tas ir saņemts, un darba dienās atbildu 24 stundu laikā.",
    "",
    "Ko nosūtīji:",
    `Pakalpojums: ${service}`,
    `Budžets: ${budget}`,
    ...(timeline ? [`Termiņš: ${timeline}`] : []),
    "",
    data.message,
    "",
    "Ja kaut ko gribi piebilst, vienkārši atbildi uz šo vēstuli.",
    "",
    "Gatis Daugavietis",
    SITE,
    "",
    "Šī vēstule ir nosūtīta automātiski.",
  ].join("\n");

  const html = shell(
    [
      '<h1 style="margin:0 0 16px;font-size:22px;font-weight:600;color:#1a1613;">Paldies, ',
      escapeHtml(data.name),
      "</h1>",
      '<p style="margin:0 0 18px;font-size:15px;line-height:1.6;color:#1a1613;">Tavs pieprasījums ir saņemts. Darba dienās atbildu 24 stundu laikā.</p>',
      '<table style="border-collapse:collapse;width:100%;">',
      row("Pakalpojums", service),
      row("Budžets", budget),
      ...(timeline ? [row("Termiņš", timeline)] : []),
      "</table>",
      '<p style="margin:22px 0 6px;font-size:12px;letter-spacing:0.14em;text-transform:uppercase;color:#8a8074;">Tava ziņa</p>',
      '<p style="margin:0 0 20px;font-size:15px;line-height:1.6;color:#1a1613;">',
      toHtmlParagraph(data.message),
      "</p>",
      '<p style="margin:0;font-size:15px;line-height:1.6;color:#1a1613;">Ja kaut ko gribi piebilst, vienkārši atbildi uz šo vēstuli.<br />Gatis Daugavietis</p>',
    ].join(""),
  );

  return {
    from: opts.from,
    to: data.email,
    replyTo: opts.replyTo,
    subject: "Paldies par pieprasījumu - Gatis Design",
    text,
    html,
  };
}
