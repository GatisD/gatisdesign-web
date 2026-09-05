/**
 * Enkuru identifikatori sadaļu virsrakstiem.
 *
 * Diakritika tiek pārrakstīta ar ASCII (ā -> a), lai enkurs URL joslā izskatās
 * lasāms un nesabrūk kopēšanā. Rezultāts ir deterministisks - tas pats
 * virsraksts vienmēr dod to pašu enkuru gan būvē, gan hidratācijā.
 */
const MAP: Record<string, string> = {
  ā: "a", č: "c", ē: "e", ģ: "g", ī: "i", ķ: "k", ļ: "l", ņ: "n", š: "s", ū: "u", ž: "z",
};

export function headingId(text: string): string {
  return text
    .toLowerCase()
    .replace(/[āčēģīķļņšūž]/g, (c) => MAP[c] ?? c)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
}
