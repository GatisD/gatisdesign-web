import { useLocale } from "@/i18n/LocaleContext";
import { WHATSAPP } from "@/lib/site";

/**
 * Peldoša WhatsApp poga lapas kreisajā apakšā.
 *
 * KLAUSULE, NE WHATSAPP ZAĻĀ. Zīmola zaļā ir spilgtāka par pašas lapas akcentu
 * un uz grafīta izlec vairāk nekā virsraksts - poga sāktu konkurēt ar saturu.
 * Tāpēc virsma ir tā pati stikla ripa, kas pogai "uz augšu" pretējā stūrī: abas
 * kopā izskatās kā pāris, ne kā divi svešķermeņi. Ka aiz tās ir WhatsApp,
 * pasaka nosaukums, kas atveras uz hover, un `aria-label`.
 *
 * KUSTĪBA IR VIENA, NE TRĪS. Reize pa reizei no pogas izplūst viens gaismas
 * gredzens. Tas ir pietiekami, lai acs to pamanītu perifērijā, un par maz, lai
 * traucētu lasīt. Gredzens ir `::after` uz pseidoelementa, ne otrs elements -
 * tas nekad neķer klikšķus.
 *
 * `prefers-reduced-motion` gadījumā gredzena nav vispār. Pastāvīga pulsējoša
 * animācija ir tieši tas, ko šis iestatījums izslēdz.
 *
 * VIETA. Poga ceļas virs sīkdatņu joslas tāpat kā tās kaimiņiene: joslas
 * augstumu tā publicē kā `--bottom-bar`, un, ja joslas nav, mainīgais ir 0.
 */
export default function WhatsAppPoga() {
  const { locale } = useLocale();
  const lv = locale === "lv";
  const virsraksts = lv ? "Rakstīt uz WhatsApp" : "Message on WhatsApp";

  return (
    <a
      href={WHATSAPP.href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={virsraksts}
      title={virsraksts}
      className={[
        "wa-poga group fixed left-5 z-[150] inline-flex h-11 items-center gap-0 overflow-hidden rounded-full",
        "border border-line-strong bg-ink-950/90 pe-0 ps-0 text-paper backdrop-blur",
        "transition-[background-color,color,padding] duration-300 ease-dir",
        "hover:bg-ink-900 hover:text-amber",
        "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber",
        // Uz hover ripa pārvēršas par tableti ar nosaukumu. Pieskāriena ierīcēs
        // hover nav, tāpēc tur tā vienmēr paliek ripa - un tas ir pareizi, jo
        // telefonā vieta ekrāna malā ir dārgāka.
        "[@media(hover:hover)]:hover:ps-4 [@media(hover:hover)]:hover:pe-4",
      ].join(" ")}
      style={{ bottom: "calc(1.5rem + var(--bottom-bar, 0px))" }}
    >
      <span className="grid h-11 w-11 shrink-0 place-items-center">
        {/* Klausule vienā līnijas biezumā, tāpat kā bultiņa blakus pogā. */}
        <svg width="19" height="19" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.9.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92Z"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
      <span
        className={[
          "max-w-0 whitespace-nowrap text-[15px] font-medium opacity-0",
          "transition-[max-width,opacity] duration-300 ease-dir",
          "[@media(hover:hover)]:group-hover:max-w-[132px] [@media(hover:hover)]:group-hover:opacity-100",
        ].join(" ")}
      >
        WhatsApp
      </span>
    </a>
  );
}
