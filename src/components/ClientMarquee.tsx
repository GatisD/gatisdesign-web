import PicturePortfolio from "@/components/PicturePortfolio";
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
 * Kursors joslu aptur (`animation-play-state`), un tas pats notiek, kad iekšā
 * ieiet fokuss ar tabulatoru - citādi ar tastatūru joslu nevar apskatīt.
 *
 * `prefers-reduced-motion: reduce` gadījumā celiņš vienkārši aplaužas rindās un
 * stāv uz vietas (sk. `.marquee` iekš index.css); dublikāts tur ir paslēpts, lai
 * neviens logotips neparādās divreiz.
 */
export default function ClientMarquee() {
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
            className="h-[clamp(28px,3.2vw,36px)] w-auto max-w-[140px] object-contain opacity-70 transition-opacity duration-500 ease-dir hover:opacity-100 motion-reduce:transition-none"
          />
        </li>
      ))}
    </ul>
  );

  return (
    <div className="marquee min-w-0 flex-1">
      <div className="marquee-track flex items-center">
        {list(false)}
        {list(true)}
      </div>
    </div>
  );
}
