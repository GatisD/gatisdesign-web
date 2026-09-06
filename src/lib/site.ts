export const SITE_URL = (
  import.meta.env.VITE_SITE_URL || "https://gatisdesign.com"
).replace(/\/$/, "");

export const SITE_NAME = "Gatis Design";
export const SITE_TAGLINE = "Brand identity ar 18 gadu pieredzi";
export const CONTACT_EMAIL = "connect@gatisdesign.com";

export const SOCIAL = {
  dribbble: "https://dribbble.com/gdesign90",
  facebook: "https://facebook.com/GatisDesign",
  instagram: "https://instagram.com/gatisdesign",
  linkedin: "https://www.linkedin.com/in/gatis-daugavietis-bb5566193",
};

/**
 * Satura pēdējās redakcijas datums strukturētajiem datiem.
 *
 * Konstante, ne `new Date()`: būvē un hidratācijā tam jābūt vienam un tam
 * pašam, un "šodien" nozīmētu, ka lapa katru dienu apgalvo, ka saturs ir
 * atjaunots. Dzīvo šeit, ne schema modulī, lai sākumlapa un "Par mani" to
 * varētu paņemt, neievelkot bundlē visu četru pakalpojumu lapu saturu.
 */
export const CONTENT_MODIFIED = "2026-09-06";

/**
 * Gads kājenes kolofonā. Konstante, ne `new Date().getFullYear()` render laikā:
 * projekta noteikums aizliedz `new Date()` renderā, un izņēmums "gads mainās
 * reizi gadā" nozīmē, ka reizi gadā serverī izrenderētais HTML un pārlūkā
 * hidratētais koks 31. decembra vakarā atšķiras. Atjauno kopā ar
 * CONTENT_MODIFIED.
 */
export const BUILD_YEAR = Number(CONTENT_MODIFIED.slice(0, 4));
