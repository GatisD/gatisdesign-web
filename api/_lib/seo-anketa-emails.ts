import { escapeHtml, shell, type EmailMessage } from "./contact-emails.js";
import {
  ACCESS_STATUS_LABELS,
  ACCESS_TOOLS,
  ACCESS_TOOL_LABELS,
  CHOICES,
  CHOICE_LABELS,
  SECTIONS,
  TEXT_FIELDS,
  accessField,
  type ChoiceKey,
  type TextField,
} from "./seo-anketa-fields.js";
import type { AnketaData } from "./seo-anketa-schema.js";

/**
 * Vēstule Gatim ar visu anketu. Iekšēja - to lasa tikai viņš.
 *
 * Secība sakrīt ar lapu. Tukšs lauks ir "-", nevis izlaists: tā uzreiz redz,
 * ka jautājums bija, bet atbildes nav, un nevajag salīdzināt ar veidlapu.
 * Katra lietotāja vērtība HTML daļā iet caur escapeHtml.
 */

const EMPTY = "-";

type Row = { label: string; value: string; multiline?: boolean };

function text(data: AnketaData, key: TextField): Row {
  const spec = TEXT_FIELDS[key];
  return { label: spec.label, value: data[key]?.trim() || EMPTY, multiline: spec.multiline };
}

function choice(data: AnketaData, key: ChoiceKey, extra?: string): Row {
  const raw = data[key];
  const labels = CHOICES[key] as Record<string, string>;
  const picked = raw ? labels[raw] ?? raw : EMPTY;
  const detail = extra?.trim();
  return { label: CHOICE_LABELS[key], value: detail ? `${picked} ${detail}` : picked };
}

function sectionRows(data: AnketaData): Array<{ title: string; rows: Row[] }> {
  return [
    {
      title: SECTIONS[0].title,
      rows: [
        text(data, "uznemums"),
        text(data, "juridiskais"),
        text(data, "majaslapa"),
        text(data, "adrese"),
        text(data, "talrunis"),
        { label: "Kontaktpersona - vārds", value: data.kontaktsVards || EMPTY },
        { label: "Kontaktpersona - amats", value: data.kontaktsAmats || EMPTY },
        { label: "Kontaktpersona - e-pasts", value: data.kontaktsEpasts || EMPTY },
        choice(data, "atskaites", data.atskaites === "citur" ? data.atskaitesCitur : ""),
        choice(data, "ieviesejs", data.ieviesejs === "programmetajs" ? data.ieviesejsKontakts : ""),
        choice(data, "vide"),
      ],
    },
    {
      title: SECTIONS[1].title,
      // Piekļuvju tabula: rīks -> statuss, pēc tam CMS izvēle.
      rows: [
        ...accessRows(data).map((a) => ({ label: a.tool, value: a.status })),
        choice(data, "cms"),
        text(data, "cmsCita"),
      ],
    },
    {
      title: SECTIONS[2].title,
      rows: [
        text(data, "tirgi"),
        text(data, "valodasTagad"),
        text(data, "valodasPlano"),
        text(data, "pircejuVardi"),
        text(data, "zimolaVarianti"),
        text(data, "svarigakasLapas"),
      ],
    },
    {
      title: SECTIONS[3].title,
      rows: (["nozare1", "nozare2", "nozare3", "nozare4", "nozare5", "nozare6"] as const).map((k) => text(data, k)),
    },
    {
      title: SECTIONS[4].title,
      rows: [
        text(data, "profili"),
        text(data, "cenas"),
        choice(data, "cenasPublicet"),
        text(data, "atsauksmes"),
        text(data, "logotipi"),
      ],
    },
    {
      title: SECTIONS[5].title,
      rows: [text(data, "komentars"), { label: "Piekrišana", value: data.piekrisana ? "Jā" : "Nē" }],
    },
  ];
}

function accessRows(data: AnketaData): Array<{ tool: string; status: string }> {
  return ACCESS_TOOLS.map((tool) => ({
    tool: ACCESS_TOOL_LABELS[tool],
    status: ACCESS_STATUS_LABELS[data[accessField(tool)]] ?? EMPTY,
  }));
}

const H2 =
  '<h2 style="margin:26px 0 8px;font-size:13px;letter-spacing:0.12em;text-transform:uppercase;color:#8a8074;">';
const TD_TERM =
  '<td style="padding:7px 12px 7px 0;font-size:13px;color:#8a8074;vertical-align:top;width:42%;border-top:1px solid #efebe3;">';
const TD_VALUE =
  '<td style="padding:7px 0;font-size:14px;line-height:1.5;color:#1a1613;vertical-align:top;border-top:1px solid #efebe3;">';

function htmlValue(value: string): string {
  return escapeHtml(value).replace(/\r?\n/g, "<br />");
}

/** Tēma: `SEO anketa: <uzņēmums> (<domēns>)`. Abi lauki shēmā ir vienā rindā. */
export function anketaSubject(data: AnketaData): string {
  return `SEO anketa: ${data.uznemums} (${data.majaslapa})`;
}

export function buildAnketaEmail(
  data: AnketaData,
  opts: { from: string; to: string },
): EmailMessage {
  const sections = sectionRows(data);

  const textLines: string[] = [anketaSubject(data), ""];
  for (const section of sections) {
    textLines.push(section.title.toUpperCase());
    for (const row of section.rows) {
      textLines.push(row.multiline ? `${row.label}\n${row.value}` : `${row.label}: ${row.value}`);
    }
    textLines.push("");
  }
  textLines.push(`Atbildi tieši uz šo vēstuli - atbilde aizies uz ${data.kontaktsEpasts}.`);

  const html = shell(
    [
      '<p style="margin:0 0 4px;font-size:12px;letter-spacing:0.14em;text-transform:uppercase;color:#b0682f;">SEO anketa</p>',
      '<h1 style="margin:0 0 4px;font-size:22px;font-weight:600;color:#1a1613;">',
      escapeHtml(data.uznemums),
      "</h1>",
      '<p style="margin:0 0 8px;font-size:14px;color:#8a8074;">',
      escapeHtml(data.majaslapa),
      "</p>",
      ...sections.flatMap((section) => [
        H2,
        escapeHtml(section.title),
        "</h2>",
        '<table style="border-collapse:collapse;width:100%;">',
        ...section.rows.map(
          (row) => `<tr>${TD_TERM}${escapeHtml(row.label)}</td>${TD_VALUE}${htmlValue(row.value)}</td></tr>`,
        ),
        "</table>",
      ]),
    ].join(""),
  );

  return {
    from: opts.from,
    to: opts.to,
    replyTo: data.kontaktsEpasts,
    subject: anketaSubject(data),
    text: textLines.join("\n"),
    html,
  };
}
