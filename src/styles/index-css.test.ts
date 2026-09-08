import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

/**
 * Sargs pret pazudušām CSS sadaļām.
 *
 * 2026-09-08 slaidera CSS bloku pārrakstīja ar "aizstāj visu starp divām
 * atsauces vietām", un starp tām stāvēja visa stikla recepte (.stikls, panelis,
 * čipi). Būve bija zaļa, testi zaļi, lapa dzīvajā bez stikla - to pamanīja
 * Gatis, ne vārti. Šis tests krīt, ja kāds no lapas pamatsegmentiem index.css
 * vairs nav: tas ir apgalvojums par identitāti (šie bloki eksistē), ne par
 * formu, tāpēc tas nenoveco līdz ar katru CSS labojumu.
 */
const css = readFileSync(new URL("../index.css", import.meta.url), "utf8");

const SADALAS: Array<[string, string]> = [
  ["stikla bāze", ".stikls,\n.stikls-on {"],
  ["stikla blur modifikators", ".stikls-blur {"],
  ["stikla rāmis", ".stikls-rams {"],
  ["stikla ieslēgtie stāvokļi", ".stikls:has(:checked)"],
  ["stikla panelis", ".stikls-panelis {"],
  ["izvēlnes ienākšana", ".izvelne-in {"],
  ["rīku kartīte", ".stack-karte {"],
  ["rīku slaidera josla", ".riki-josla {"],
  ["rīku slaidera aizkari", ".riki-aizkars {"],
  ["ciparu lietus maska", ".hero-cipari {"],
  ["WhatsApp gredzens", ".wa-poga::after {"],
  ["klientu josla", ".marquee-track {"],
  ["melnbaltie foni", ".foto-melnbalts {"],
  ["navigācijas pasvītrojums", ".nav-underline::after {"],
  ["pakalpojumu kartes", ".pak-karte {"],
];

describe("index.css pamatsadaļas", () => {
  it.each(SADALAS)("%s ir failā", (_nosaukums, fragments) => {
    expect(css.includes(fragments), `trūkst: ${fragments}`).toBe(true);
  });
});
