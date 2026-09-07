/**
 * Pakalpojumu ikonas.
 *
 * Četras zīmes vienā ģeometrijā: 24x24 lauks, 1,5 px līnija, apaļi gali, bez
 * pildījuma un bez krāsas savā iekšienē - krāsu dod vecāks caur `currentColor`,
 * tāpēc uz hover tās maina toni kopā ar virsrakstu, nevis paliek stāvam.
 *
 * Katra zīme rāda darba REZULTĀTU, ne rīku: zīmols ir zīmes uzbūve uz režģa,
 * mājaslapa ir pārlūka logs, AI aģents ir savienoti mezgli, SEO ir lupa. Nekādu
 * raķešu, zobratu un spuldzīšu - tie ir dekors, ne saturs.
 *
 * `aria-hidden`: blakus katrai ikonai stāv pakalpojuma nosaukums, un ikona to
 * neatkārto ar citiem vārdiem. Ekrānlasītājam tā ir troksnis.
 */
const CELS = "/zimola-identitate";
const LAPA = "/majaslapu-izstrade";
const AGENTS = "/ai-agenti";
const MEKLE = "/seo-geo-aeo";

export default function ServiceIcon({ target, className }: { target: string; className?: string }) {
  const zime = ZIMES[target];
  if (!zime) return null;
  return (
    <svg
      viewBox="0 0 24 24"
      width="24"
      height="24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      {zime}
    </svg>
  );
}

const ZIMES: Record<string, JSX.Element> = {
  // Zīmols: aplis un kvadrāts, kas pārklājas - zīmes uzbūve uz režģa.
  [CELS]: (
    <>
      <rect x="3" y="3" width="12" height="12" rx="2.5" />
      <circle cx="15" cy="15" r="6" />
    </>
  ),
  // Mājaslapa: pārlūka logs ar galvas joslu un satura rindām.
  [LAPA]: (
    <>
      <rect x="2.5" y="4" width="19" height="16" rx="2.5" />
      <path d="M2.5 8.5h19" />
      <path d="M6 12.5h6M6 16h9" />
    </>
  ),
  // AI aģents: trīs mezgli un ceļš starp tiem - darbs, kas iet pats.
  [AGENTS]: (
    <>
      <circle cx="5" cy="18" r="2.5" />
      <circle cx="12" cy="6" r="2.5" />
      <circle cx="19" cy="15" r="2.5" />
      <path d="M6.6 15.9 10.4 8.1M14.2 7.4l3.6 5.4" />
    </>
  ),
  // SEO: lupa ar augšupejošu līniju iekšpusē - atrastība, ne tikai meklēšana.
  [MEKLE]: (
    <>
      <circle cx="10.5" cy="10.5" r="7" />
      <path d="M15.6 15.6 21 21" />
      <path d="M7.5 12.2l2.2-2.4 1.9 1.6 2.3-2.9" />
    </>
  ),
};
