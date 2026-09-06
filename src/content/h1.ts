/**
 * Redzamā H1 rindas no satura `h1` lauka.
 *
 * Vārdi nāk no JSON, kodā paliek tikai tas, KUR rinda lūzt. Tāpēc `h1` ir
 * vienīgais patiesības avots, un divi virsraksti vienai lapai vairs nav
 * iespējami.
 *
 * Vēsture: `h1` bija deklarēts tipā, aizpildīts visos septiņos satura failos un
 * nelasīts nekur - redzamo virsrakstu deva cietkodēts `titleLines` masīvs.
 * Septembra meta tabulā ierakstītie H1 labojumi tāpēc lapā nekad nenonāca, un
 * tas nebija pamanāms, jo JSON izskatījās pareizs.
 */
export function h1Lines(h1: string, breakAfter: number): [string, string] {
  const words = h1.trim().split(/\s+/);
  if (!Number.isInteger(breakAfter) || breakAfter < 1 || breakAfter >= words.length) {
    throw new Error(
      `h1 rindas lūzums ir ārpus teksta: "${h1}" (${words.length} vārdi) pēc ${breakAfter}. vārda`,
    );
  }
  return [words.slice(0, breakAfter).join(" "), words.slice(breakAfter).join(" ")];
}
