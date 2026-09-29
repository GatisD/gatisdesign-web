import { beforeEach, describe, expect, it } from "vitest";
import { RATE_LIMIT, resetRateLimit, type ContactConfig } from "./contact-core.js";
import type { EmailMessage } from "./contact-emails.js";
import { handleSeoAnketa, resetAnketaRateLimit } from "./seo-anketa-core.js";
import {
  ACCESS_TOOLS,
  ANKETA_BODY_BYTES_MAX,
  ANKETA_HONEYPOT_FIELD,
  TEXT_FIELDS,
  accessField,
} from "./seo-anketa-fields.js";
import { anketaSchema } from "./seo-anketa-schema.js";

const config: ContactConfig = {
  from: "Gatis Design <forma@send.gatisdesign.com>",
  to: "gatis.design@gmail.com",
  replyTo: "gatis.design@gmail.com",
  apiKey: "re_tests_nav_istas_atslegas", // secgate:allow - viltota testu vērtība
};

const allAccess = Object.fromEntries(ACCESS_TOOLS.map((t) => [accessField(t), "izdarits"]));

/** Minimālais derīgais: tikai obligātie lauki. */
const validPayload: Record<string, unknown> = {
  uznemums: "Testa Koks",
  majaslapa: "testakoks.lv",
  kontaktsVards: "Anna Testa",
  kontaktsEpasts: "anna@testakoks.lv",
  tirgi: "Latvija, tad Igaunija",
  ...allAccess,
  piekrisana: true,
};

function recorder() {
  const sent: EmailMessage[] = [];
  return {
    sent,
    send: async (message: EmailMessage) => {
      sent.push(message);
      return { id: `test-${sent.length}` };
    },
  };
}

let ipCounter = 0;
function freshIp(): string {
  ipCounter += 1;
  return `10.1.0.${ipCounter}`;
}

const fieldsOf = (body: unknown) => (body as { fields: Record<string, string> }).fields;

beforeEach(() => {
  resetAnketaRateLimit();
  resetRateLimit();
});

describe("SEO anketas serveris", () => {
  it("derīga anketa sūta vienu vēstuli Gatim ar pareizu tēmu un Reply-To", async () => {
    const mail = recorder();
    const result = await handleSeoAnketa({ payload: validPayload, ip: freshIp(), config, send: mail.send });

    expect(result.status).toBe(200);
    expect(result.body).toEqual({ ok: true });
    expect(mail.sent).toHaveLength(1);
    const [m] = mail.sent;
    expect(m.to).toBe("gatis.design@gmail.com");
    expect(m.from).toBe(config.from);
    expect(m.replyTo).toBe("anna@testakoks.lv");
    expect(m.subject).toBe("SEO anketa: Testa Koks (testakoks.lv)");
  });

  it("vēstulē ir visas sadaļas secībā, un tukšie lauki ir '-'", async () => {
    const mail = recorder();
    await handleSeoAnketa({ payload: validPayload, ip: freshIp(), config, send: mail.send });
    const { text, html } = mail.sent[0];

    const order = [
      "1. UZŅĒMUMS UN KONTAKTPERSONA",
      "2. PIEKĻUVES",
      "3. TIRGUS UN VALODA",
      "4. PAR NOZARI",
      "5. MATERIĀLI, KO DRĪKST IZMANTOT",
      "6. NOSŪTĪŠANA",
    ];
    const positions = order.map((title) => text.indexOf(title));
    expect(positions.every((p) => p >= 0)).toBe(true);
    expect([...positions].sort((a, b) => a - b)).toEqual(positions);

    expect(text).toContain(`${TEXT_FIELDS.juridiskais.label}: -`);
    expect(text).toContain(`${TEXT_FIELDS.nozare1.label}\n-`);
    expect(html).toContain("1. Uzņēmums un kontaktpersona");
  });

  it("piekļuvju tabula: katrs rīks ar savu statusu", async () => {
    const mail = recorder();
    await handleSeoAnketa({
      payload: { ...validPayload, piekluve_gsc: "izdarits", piekluve_gtm: "nav", piekluve_gbp: "palidziba" },
      ip: freshIp(),
      config,
      send: mail.send,
    });
    const { text, html } = mail.sent[0];
    expect(text).toContain("Google Search Console: Izdarīts");
    expect(text).toContain("Google Tag Manager: Šāda rīka nav");
    expect(text).toContain("Google Business Profile: Vajag palīdzību");
    expect(html).toContain("Vajag palīdzību");
  });

  it("trūkstošs piekļuves statuss atgriež 400 ar statusRequired katram rīkam", async () => {
    const mail = recorder();
    const payload = { ...validPayload };
    delete payload.piekluve_bing;
    const result = await handleSeoAnketa({
      payload: { ...payload, piekluve_ga4: null, piekluve_cms: "kaut-kas" },
      ip: freshIp(),
      config,
      send: mail.send,
    });
    expect(result.status).toBe(400);
    const fields = fieldsOf(result.body);
    expect(fields.piekluve_bing).toBe("statusRequired");
    expect(fields.piekluve_ga4).toBe("statusRequired");
    expect(fields.piekluve_cms).toBe("statusRequired");
    expect(mail.sent).toHaveLength(0);
  });

  it("obligātie lauki: tukši vai trūkstoši atgriež 400 un neko nesūta", async () => {
    const mail = recorder();
    const result = await handleSeoAnketa({
      payload: { ...allAccess, uznemums: "   ", majaslapa: "", piekrisana: false },
      ip: freshIp(),
      config,
      send: mail.send,
    });
    expect(result.status).toBe(400);
    expect(result.body).toMatchObject({ ok: false, error: "validation" });
    const fields = fieldsOf(result.body);
    expect(fields.uznemums).toBe("required");
    expect(fields.majaslapa).toBe("required");
    expect(fields.kontaktsVards).toBe("required");
    expect(fields.kontaktsEpasts).toBe("required");
    expect(fields.tirgi).toBe("required");
    expect(fields.piekrisana).toBe("consentRequired");
    expect(mail.sent).toHaveLength(0);
  });

  it("nederīgs e-pasts atgriež emailInvalid", async () => {
    const mail = recorder();
    const result = await handleSeoAnketa({
      payload: { ...validPayload, kontaktsEpasts: "nav-epasts" },
      ip: freshIp(),
      config,
      send: mail.send,
    });
    expect(fieldsOf(result.body).kontaktsEpasts).toBe("emailInvalid");
  });

  it("rindas pārtraukums tēmas laukos netiek pieņemts", async () => {
    const mail = recorder();
    const result = await handleSeoAnketa({
      payload: { ...validPayload, uznemums: "SIA\r\nBcc: x@y.z", majaslapa: "a.lv\nX: 1" },
      ip: freshIp(),
      config,
      send: mail.send,
    });
    expect(result.status).toBe(400);
    expect(fieldsOf(result.body).uznemums).toBe("singleLine");
    expect(fieldsOf(result.body).majaslapa).toBe("singleLine");
    expect(mail.sent).toHaveLength(0);
  });

  it("par garu lauku noraida ar tooLong", async () => {
    const mail = recorder();
    const result = await handleSeoAnketa({
      payload: { ...validPayload, nozare1: "x".repeat(TEXT_FIELDS.nozare1.max + 1) },
      ip: freshIp(),
      config,
      send: mail.send,
    });
    expect(result.status).toBe(400);
    expect(fieldsOf(result.body).nozare1).toBe("tooLong");
    expect(mail.sent).toHaveLength(0);
  });

  it("katram laukam ir max robeža shēmā", () => {
    for (const [key, spec] of Object.entries(TEXT_FIELDS)) {
      const r = anketaSchema.safeParse({ ...validPayload, [key]: "a".repeat(spec.max + 1) });
      expect(r.success, key).toBe(false);
    }
  });

  it("kopējie griesti: par lielu krava atgriež 413", async () => {
    const mail = recorder();
    const result = await handleSeoAnketa({
      payload: { ...validPayload, lieks: "ā".repeat(ANKETA_BODY_BYTES_MAX) },
      ip: freshIp(),
      config,
      send: mail.send,
    });
    expect(result.status).toBe(413);
    expect(result.body).toEqual({ ok: false, error: "payload" });
    expect(mail.sent).toHaveLength(0);
  });

  it("aizpildīti visi lauki līdz max iekļaujas griestos", () => {
    // Griesti nedrīkst nogriezt cilvēku, kurš godīgi aizpilda visu līdz galam.
    const full: Record<string, unknown> = { ...validPayload };
    for (const [key, spec] of Object.entries(TEXT_FIELDS)) full[key] = "ā".repeat(spec.max);
    full.kontaktsEpasts = "anna@testakoks.lv";
    expect(Buffer.byteLength(JSON.stringify(full), "utf8")).toBeLessThan(ANKETA_BODY_BYTES_MAX);
  });

  it("HTML vēstulē lietotāja teksts ir aizsargāts", async () => {
    const mail = recorder();
    await handleSeoAnketa({
      payload: {
        ...validPayload,
        uznemums: "Koks <script>alert(1)</script>",
        nozare3: "Nedrīkst: <b>ražotājs</b> & \"oficiālais\"",
        atskaites: "citur",
        atskaitesCitur: "<img src=x onerror=alert(1)>",
      },
      ip: freshIp(),
      config,
      send: mail.send,
    });
    const { html } = mail.sent[0];
    expect(html).not.toContain("<script>");
    expect(html).not.toContain("<img");
    expect(html).toContain("&lt;script&gt;");
    expect(html).toContain("&lt;b&gt;ražotājs&lt;/b&gt; &amp; &quot;oficiālais&quot;");
  });

  it("izvēles un to precizējumi nonāk vēstulē", async () => {
    const mail = recorder();
    await handleSeoAnketa({
      payload: {
        ...validPayload,
        ieviesejs: "programmetajs",
        ieviesejsKontakts: "Jānis, jb@agentura.lv",
        vide: "testa",
        cms: "wordpress",
        cenasPublicet: "tikaiNo",
      },
      ip: freshIp(),
      config,
      send: mail.send,
    });
    const { text } = mail.sent[0];
    expect(text).toContain("Mūsu programmētājs vai aģentūra - kontakts: Jānis, jb@agentura.lv");
    expect(text).toContain("Ir testa vide");
    expect(text).toContain("CMS sistēma: WordPress");
    expect(text).toContain("Tikai „no X EUR”");
  });

  it("nezināma izvēles vērtība tiek noraidīta", async () => {
    const mail = recorder();
    const result = await handleSeoAnketa({
      payload: { ...validPayload, cms: "joomla-2003" },
      ip: freshIp(),
      config,
      send: mail.send,
    });
    expect(result.status).toBe(400);
    expect(fieldsOf(result.body).cms).toBe("choiceInvalid");
  });

  it("aizpildīts slazds neizmet anketu - vēstule aiziet ar atzīmi", async () => {
    const mail = recorder();
    const result = await handleSeoAnketa({
      payload: { ...validPayload, [ANKETA_HONEYPOT_FIELD]: "robots" },
      ip: freshIp(),
      config,
      send: mail.send,
    });
    expect(result.status).toBe(200);
    expect(mail.sent).toHaveLength(1);
    expect(mail.sent[0].subject.startsWith("[slazds] SEO anketa:")).toBe(true);
  });

  it("slazda nosaukums nav autofill vārds un ir shēmā", () => {
    const autofillVardi = [
      "company", "organization", "organisation", "address", "address-line1",
      "phone", "tel", "url", "website", "fax", "title", "given-name",
      "family-name", "country", "city", "postal-code", "name", "email",
    ];
    expect(Object.keys(anketaSchema.shape)).toContain(ANKETA_HONEYPOT_FIELD);
    expect(autofillVardi).not.toContain(ANKETA_HONEYPOT_FIELD);
  });

  it("anketā nav neviena paroles, tokena vai atslēgas lauka", () => {
    const aizliegti = /parol|password|token|secret|atslēg|atsleg|api.?key|pin\b/i;
    for (const key of Object.keys(anketaSchema.shape)) {
      expect(aizliegti.test(key), key).toBe(false);
    }
  });

  it("cita metode atgriež 405 ar Allow", async () => {
    const mail = recorder();
    const result = await handleSeoAnketa({ method: "GET", payload: {}, ip: freshIp(), config, send: mail.send });
    expect(result.status).toBe(405);
    expect(result.headers?.Allow).toBe("POST");
  });

  it("produkcijā bez Turnstile noslēpuma atsaka ar 503 config un neko nesūta", async () => {
    const mail = recorder();
    const result = await handleSeoAnketa({
      payload: validPayload,
      ip: freshIp(),
      config: { ...config, turnstileSecret: undefined },
      send: mail.send,
      requireTurnstile: true,
    });
    expect(result.status).toBe(503);
    expect(result.body).toEqual({ ok: false, error: "config" });
    expect(mail.sent).toHaveLength(0);
  });

  it("U+2028/U+2029/U+0085 vienas rindas laukos netiek pieņemti", async () => {
    for (const sep of ["\u2028", "\u2029", "\u0085"]) {
      const mail = recorder();
      const result = await handleSeoAnketa({
        payload: { ...validPayload, uznemums: `X${sep}Bcc: e@x` },
        ip: freshIp(),
        config,
        send: mail.send,
      });
      expect(result.status).toBe(400);
      expect(fieldsOf(result.body).uznemums).toBe("singleLine");
      expect(mail.sent).toHaveLength(0);
    }
  });

  it("bez RESEND_API_KEY atgriež 500 config", async () => {
    const mail = recorder();
    const result = await handleSeoAnketa({
      payload: validPayload,
      ip: freshIp(),
      config: { ...config, apiKey: undefined },
      send: mail.send,
    });
    expect(result.status).toBe(500);
    expect(result.body).toEqual({ ok: false, error: "config" });
  });

  it("ja vēstule neaiziet, atgriež 502 bez detaļām", async () => {
    const result = await handleSeoAnketa({
      payload: validPayload,
      ip: freshIp(),
      config,
      send: async () => {
        throw new Error("Resend 403: domain not verified");
      },
    });
    expect(result.status).toBe(502);
    expect(result.body).toEqual({ ok: false, error: "send" });
  });

  it("ātruma limits: pēc max atgriež 429, un kontaktformas logs ir atsevišķs", async () => {
    const mail = recorder();
    const ip = freshIp();
    for (let i = 0; i < RATE_LIMIT.max; i += 1) {
      const ok = await handleSeoAnketa({ payload: validPayload, ip, config, send: mail.send });
      expect(ok.status).toBe(200);
    }
    const blocked = await handleSeoAnketa({ payload: validPayload, ip, config, send: mail.send });
    expect(blocked.status).toBe(429);
    expect(Number(blocked.headers?.["Retry-After"])).toBeGreaterThan(0);
  });

  it("Turnstile: bez pilnvaras 400, ar derīgu - iziet", async () => {
    const guarded = { ...config, turnstileSecret: "0x_tests" };
    const mail = recorder();
    const missing = await handleSeoAnketa({
      payload: validPayload,
      ip: freshIp(),
      config: guarded,
      send: mail.send,
      verifyTurnstile: async () => true,
    });
    expect(missing.status).toBe(400);
    expect(missing.body).toEqual({ ok: false, error: "turnstile" });

    const ok = await handleSeoAnketa({
      payload: { ...validPayload, "cf-turnstile-response": "pilnvara" },
      ip: freshIp(),
      config: guarded,
      send: mail.send,
      verifyTurnstile: async () => true,
    });
    expect(ok.status).toBe(200);

    const down = await handleSeoAnketa({
      payload: { ...validPayload, "cf-turnstile-response": "pilnvara" },
      ip: freshIp(),
      config: guarded,
      send: mail.send,
      verifyTurnstile: async () => {
        throw new Error("tīkls nost");
      },
    });
    expect(down.status).toBe(503);
    expect(mail.sent).toHaveLength(1);
  });
});
