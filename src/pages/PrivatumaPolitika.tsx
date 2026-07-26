import type { ReactNode } from "react";
import SEO from "@/components/SEO";
import JsonLd, { buildBreadcrumbSchema } from "@/components/JsonLd";
import Kicker from "@/components/ui/Kicker";
import { CONTACT_EMAIL } from "@/lib/site";
import { useLocale } from "@/i18n/LocaleContext";

/**
 * Viena numurēta sadaļa (h2 + saturs). Astoņas sadaļas atkārto to pašu
 * iezīmējumu, tāpēc iznests lokālā komponentē - tāpat kā Kontakti.tsx dara ar Block.
 */
function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="border-t border-line pt-9 first:border-t-0 first:pt-0">
      <h2 className="text-[clamp(1.2rem,2vw,1.5rem)] font-light tracking-[-0.02em] text-paper">
        {title}
      </h2>
      <div className="mt-4 space-y-4 leading-[1.75] text-paper-2">{children}</div>
    </section>
  );
}

/** Punktu saraksts vara akcenta stilā - tas pats raksts, ko Kontakti.tsx lieto sadaļu bullet sarakstiem. */
function BulletList({ items }: { items: string[] }) {
  return (
    <ul className="border-b border-line">
      {items.map((item) => (
        <li
          key={item.slice(0, 48)}
          className="grid grid-cols-[auto_minmax(0,1fr)] items-start gap-x-4 border-t border-line py-3.5"
        >
          <span aria-hidden="true" className="mt-[0.62em] block h-[6px] w-[6px] rounded-full bg-amber" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

/** Amber pasvītrotais saites stils, kas atkārtojas visā lapā (piem. Footer.tsx, Kontakti.tsx). */
function EmailLink() {
  return (
    <a
      href={`mailto:${CONTACT_EMAIL}`}
      className="border-b border-amber/40 pb-0.5 text-paper transition-colors duration-300 hover:border-amber hover:text-amber"
    >
      {CONTACT_EMAIL}
    </a>
  );
}

export default function PrivatumaPolitika() {
  const { locale } = useLocale();
  return (
    <>
      <SEO
        routeKey="privacy"
        locale={locale}
        title={locale === "lv" ? "Privātuma politika" : "Privacy Policy"}
        description={
          locale === "lv"
            ? "Gatis Design privātuma politika - kā apstrādājam tavus datus, kādas ir tavas tiesības un kā ar mums sazināties."
            : "Gatis Design privacy policy - how we process your data, what your rights are and how to contact us."
        }
      />
      <JsonLd
        data={buildBreadcrumbSchema([
          { name: "Sākums", path: "/" },
          { name: "Privātuma politika", path: "/privatuma-politika" },
        ])}
      />

      {/* Negatīvā augšmala pavelk tumšo fonu zem fiksētās galvenes (Layout main pt-20/24). */}
      <div className="-mt-20 flex-1 bg-ink-900 pt-20 text-paper md:-mt-24 md:pt-24">
        <article className="mx-auto max-w-wrap px-[var(--pad-x)] py-[var(--sec-y)]">
          {/* Lasāmības dēļ teksta kolonna nav platāka par 70ch. */}
          <div className="max-w-[70ch]">
            <Kicker className="mb-5">PRIVĀTUMS</Kicker>
            <h1 className="max-w-[20ch] text-[clamp(2.05rem,4.6vw,3.5rem)] font-light leading-[1.06] tracking-[-0.04em] [text-wrap:balance]">
              Privātuma politika
            </h1>
            <p className="mt-5 text-sm text-paper-faint">Pēdējā atjaunošana: 2026-05-03</p>

            <div className="mt-12">
              <Section title="1. Datu pārzinis">
                <p>
                  Šīs mājaslapas pārzinis ir Gatis Daugavietis (Gatis Design), individuālā darba veicējs,
                  kas reģistrēts Latvijā. Sazināties: <EmailLink />.
                </p>
              </Section>

              <Section title="2. Kādus datus ievācu">
                <BulletList
                  items={[
                    "Vārds un uzvārds, e-pasts un projekta apraksts, ko iesniedz caur kontaktu formu.",
                    "Sīkdatnes (cookies), ja esi piekritis to izmantošanai (Google Consent Mode v2).",
                    "Tehniska informācija - IP adrese, pārlūks, lapas, ko apmeklē - anonimizētā formā.",
                  ]}
                />
              </Section>

              <Section title="3. Kāpēc apstrādāju datus">
                <BulletList
                  items={[
                    "Lai atbildētu uz tavu pieprasījumu un sagatavotu projekta piedāvājumu.",
                    "Lai uzturētu un uzlabotu mājaslapas darbību.",
                    "Anonīma analīze (kad būs aktivizēts), lai saprastu, kāds saturs ir noderīgs.",
                  ]}
                />
              </Section>

              <Section title="4. Cik ilgi glabāju datus">
                <p>
                  Kontaktu formas datus glabāju tikai tik ilgi, cik nepieciešams projekta pieprasījuma
                  apstrādei un, ja sākam sadarbību, līguma izpildei un grāmatvedības prasībām (līdz 5
                  gadiem). Pēc tam datus dzēšu vai anonimizēju.
                </p>
              </Section>

              <Section title="5. Tavas tiesības">
                <BulletList
                  items={[
                    "Pieprasīt piekļuvi saviem datiem.",
                    "Lūgt datus labot vai dzēst.",
                    "Atsaukt piekrišanu jebkurā brīdī.",
                    "Sūdzēties Datu valsts inspekcijai (dvi.gov.lv).",
                  ]}
                />
              </Section>

              <Section title="6. Sīkdatnes">
                <p>
                  Mājaslapā tiek lietotas tikai tehniski nepieciešamās sīkdatnes (sesijas pārvaldība) un, ja
                  piekrīti, anonīmas analītikas sīkdatnes. Piekrišanu jebkurā brīdī vari mainīt, izdzēšot
                  sīkdatnes pārlūkprogrammā.
                </p>
              </Section>

              <Section title="7. Datu nodošana trešajām personām">
                <p>
                  Tavus datus nenododu trešajām personām, izņemot pakalpojumu sniedzējus, kas nepieciešami
                  mājaslapas darbībai (hostings - Vercel; e-pasta sūtīšana - Resend, kad būs aktivizēts).
                  Šie partneri ir atbilstoši GDPR.
                </p>
              </Section>

              <Section title="8. Sazinies">
                <p>
                  Jautājumi par datu apstrādi: <EmailLink />.
                </p>
              </Section>
            </div>
          </div>
        </article>
      </div>
    </>
  );
}
