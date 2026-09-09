import { useState } from "react";
import { useLocale } from "@/i18n/LocaleContext";
import PicturePortfolio from "@/components/PicturePortfolio";
import Label from "@/components/ui/Label";
import { clientLogos, clientLogoPath } from "@/data/clients";

/**
 * Klientu logotipu josla.
 *
 * Kustība ir CSS, ne JS: divi identiski saraksti cits aiz cita, un celiņš
 * pārvietojas tieši par pusi sava platuma - brīdī, kad otrā saraksta pirmais
 * logotips stāv tur, kur sākumā stāvēja pirmā saraksta pirmais, animācija sākas
 * no gala, un šuve nav redzama. Otrais saraksts ir `aria-hidden`, jo ekrāna
 * lasītājam tie ir tie paši četrpadsmit klienti, ne divdesmit astoņi.
 *
 * Apturēšana ir trijos veidos, un pirmais no tiem ir vienīgais, kas strādā bez
 * peles: **poga**. Kursors un fokuss joslu aptur arī, bet uz to paļauties nedrīkst
 * - joslā nav neviena fokusējama elementa, tāpēc `:focus-within` pats par sevi
 * neiedegtos nekad, un skāriena ekrānā hover nav vispār. Kustība ilgst 40 s,
 * tātad krietni virs piecām sekundēm, un WCAG 2.2.2 prasa mehānismu, ne kursoru.
 *
 * `prefers-reduced-motion: reduce` gadījumā celiņš kļūst par režģi un stāv uz
 * vietas (sk. `.marquee` iekš index.css); dublikāts tur ir paslēpts, lai neviens
 * logotips neparādās divreiz, un poga ir paslēpta, jo apturēt nav ko.
 */
export default function ClientMarquee({ headingId, heading }: { headingId: string; heading: string }) {
  const [paused, setPaused] = useState(false);
  const { locale } = useLocale();
  const lv = locale === "lv";

  const list = (duplicate: boolean) => (
    <ul
      className="marquee-list flex shrink-0 items-center gap-x-[clamp(28px,4vw,56px)] gap-y-6 pe-[clamp(28px,4vw,56px)]"
      aria-hidden={duplicate || undefined}
    >
      {clientLogos.map((client) => (
        <li key={client.slug} className="shrink-0">
          <PicturePortfolio
            src={clientLogoPath(client.slug)}
            alt={duplicate ? "" : client.name}
            width={client.width}
            height={client.height}
            loading="lazy"
            priority="low"
            decoding="async"
            className="h-7 w-auto md:h-9 max-w-[140px] object-contain opacity-70 transition-opacity duration-500 ease-dir hover:opacity-100 motion-reduce:transition-none"
            style={{ aspectRatio: `${client.width} / ${client.height}` }}
          />
        </li>
      ))}
    </ul>
  );

  return (
    <div className="mx-auto flex max-w-wrap flex-col gap-5 px-5 py-8 sm:px-8 md:flex-row md:items-start md:gap-10 lg:px-10">
      {/* Virsraksts un poga vienā kolonnā. `items-start`, ne `items-center`:
          pie trīs rindu režģa (reduced motion) etiķete nostājās pretī vidējai
          rindai un lasījās kā tās paraksts, ne kā bloka virsraksts. */}
      <div className="flex shrink-0 flex-col items-start gap-1.5 md:pt-1">
        <h2 id={headingId}>
          <Label caps>{heading}</Label>
        </h2>
        <button
          type="button"
          onClick={() => setPaused((v) => !v)}
          aria-pressed={paused}
          // Pilnais nosaukums: sākumlapā ir arī rīku joslas poga ar to pašu
          // redzamo vārdu. Redzamais vārds paliek nosaukuma sākumā.
          aria-label={
            paused ? (lv ? "Turpināt klientu joslu" : "Resume the clients strip") : lv ? "Apturēt klientu joslu" : "Pause the clients strip"
          }
          className="font-label text-label uppercase text-paper-faint underline-offset-4 transition-colors duration-300 hover:text-amber hover:underline focus-visible:text-amber motion-reduce:hidden"
        >
          {paused ? (lv ? "Turpināt" : "Resume") : lv ? "Apturēt" : "Pause"}
        </button>
      </div>

      <div className="marquee min-w-0 flex-1" data-paused={paused || undefined}>
        <div className="marquee-track flex items-center">
          {list(false)}
          {list(true)}
        </div>
      </div>
    </div>
  );
}
