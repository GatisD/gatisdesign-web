/**
 * Sīkdatnes, ko lapa uzstāda TIKAI ar piekrišanu - viens saraksts trim vietām.
 *
 * Kāpēc atsevišķs fails: prefikss `_ga` bija ierakstīts trīs vietās - tīrīšanas
 * funkcijā, privātuma politikas sarakstā un tās pašas lapas 6. sadaļā. Pievieno
 * Clarity vai Google Ads, atceries salabot tīrīšanu, aizmirsti politiku - un
 * lapa turpina solīt, ka uzstāda "divas sīkdatnes", kamēr uzstāda četras.
 * Solījums lietotājam un kods, kas to pilda, nedrīkst dzīvot atsevišķi.
 *
 * Pievienojot jaunu rīku: pieliec prefiksu šeit, un abas politikas vietas un
 * tīrīšana seko pašas. `verify-build` 18. vārti pārbauda, ka publicētajā lapā
 * parādās tieši šie nosaukumi.
 */
export const CONSENT_COOKIES = [
  { prefix: "_ga", zime: "_ga", riks: "Google Analytics 4" },
  { prefix: "_ga_", zime: "_ga_*", riks: "Google Analytics 4" },
  // Microsoft Clarity, ieslēgts 2026-09-07. GTM birka prasa `analytics_storage`,
  // tāpēc bez piekrišanas tā neielādējas vispār - pārbaudīts dzīvajā lapā.
  { prefix: "_clck", zime: "_clck", riks: "Microsoft Clarity" },
  { prefix: "_clsk", zime: "_clsk", riks: "Microsoft Clarity" },
] as const;

/** Prefiksi tīrīšanai. Dublikāti nav problēma - `startsWith` tos sedz abus. */
export const CONSENT_COOKIE_PREFIXES = [...new Set(CONSENT_COOKIES.map((c) => c.prefix))];

/** Cilvēkam lasāms uzskaitījums: "_ga un _ga_*", "_ga, _ga_* un _clck". */
export function cookieList(locale: "lv" | "en" = "lv"): string {
  const z = CONSENT_COOKIES.map((c) => c.zime);
  if (z.length === 1) return z[0];
  const saiklis = locale === "lv" ? "un" : "and";
  return `${z.slice(0, -1).join(", ")} ${saiklis} ${z[z.length - 1]}`;
}

/** Skaitlis vārdos, lai politika nesolītu "divas", kad to ir četras. */
export function cookieCount(locale: "lv" | "en" = "lv"): string {
  const n = CONSENT_COOKIES.length;
  const lv = ["nevienu", "vienu", "divas", "trīs", "četras", "piecas", "sešas"];
  const en = ["no", "one", "two", "three", "four", "five", "six"];
  const vards = locale === "lv" ? lv[n] : en[n];
  return vards ?? String(n);
}
