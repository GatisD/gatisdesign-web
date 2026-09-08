import type { ReactNode } from "react";
import { cookieList, cookieCount } from "@/lib/consent-cookies";
import SEO from "@/components/SEO";
import JsonLd, { buildBreadcrumbSchema } from "@/components/JsonLd";
import Label from "@/components/ui/Label";
import { CONTACT_EMAIL, CONTENT_MODIFIED } from "@/lib/site";
import { useLocale } from "@/i18n/LocaleContext";
import { pathFor } from "@/i18n/routes";

/**
 * Viena numurēta sadaļa (h2 + saturs). Astoņas sadaļas atkārto to pašu
 * iezīmējumu, tāpēc iznests lokālā komponentē - tāpat kā Kontakti.tsx dara ar Block.
 */
function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="border-t border-line pt-9 first:border-t-0 first:pt-0">
      <h2 className="text-[clamp(1.25rem,2.2vw,1.65rem)] font-medium tracking-[-0.025em] text-paper">
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
      className="border-b border-line-amber pb-0.5 text-paper transition-colors duration-300 hover:text-amber"
    >
      {CONTACT_EMAIL}
    </a>
  );
}

export default function PrivatumaPolitika() {
  const { locale, t } = useLocale();
  const isLv = locale === "lv";
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
          { name: isLv ? "Sākums" : "Home", path: pathFor("home", locale) },
          { name: t.footer.privacy, path: pathFor("privacy", locale) },
        ])}
      />

      <div className="flex-1 bg-ink-900 pb-14 md:pb-32 pt-[clamp(104px,15vw,180px)] text-paper">
        <article className="mx-auto max-w-wrap px-5 sm:px-8 lg:px-10">
          {/* Lasāmības dēļ teksta kolonna nav platāka par 70ch. */}
          <div className="max-w-[70ch]">
            <h1 className="max-w-[20ch] text-display-2 font-bold uppercase">{isLv ? "Privātuma politika" : "Privacy policy"}</h1>
            <p className="mt-6">
              <Label>{isLv ? "Pēdējoreiz atjaunināts" : "Last updated"}: {CONTENT_MODIFIED}</Label>
            </p>

            {isLv ? (
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
                    "Kontaktformā: vārds un uzvārds, e-pasts, izvēlētais pakalpojums, budžeta diapazons, vēlamais termiņš un projekta apraksts.",
                    "Tehniskie dati, ko fiksē hostings (Vercel) - IP adrese un pieprasījuma laiks. Tos lieto tikai lapas darbībai un formas ātruma ierobežojumam.",
                    `Ja piekrīti analītikai - Google Analytics 4 un Microsoft Clarity sīkdatnes (${cookieList("lv")}). Tās glabā nejaušu apmeklētāja identifikatoru, nevis vārdu vai e-pastu. Bez piekrišanas tās netiek uzstādītas.`,
                  ]}
                />
              </Section>

              <Section title="3. Kāpēc apstrādāju datus">
                <BulletList
                  items={[
                    "Lai atbildētu uz tavu pieprasījumu un sagatavotu projekta piedāvājumu.",
                    "Lai uzturētu un uzlabotu mājaslapas darbību.",
                    "Ja piekrīti analītikai - lai saprastu, kuras lapas noder un kur cilvēki apstājas.",
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

              <Section title="6. Sīkdatnes un piekrišana">
                <p>
                  Bez tavas piekrišanas mājaslapa neuzstāda nevienu sīkdatni. Ja piekrīti, caur Google
                  Tag Manager ielādējas Google Analytics 4 un Microsoft Clarity, un tie uzstāda{" "}
                  {cookieCount("lv")} sīkdatnes - <code>{cookieList("lv")}</code>. Tās satur nejaušu
                  identifikatoru, nevis tavus datus, un glabājas līdz 14 mēnešiem. IP adresi Google
                  Analytics neglabā - to izmanto tikai, lai noteiktu aptuveno atrašanās vietu, un pēc
                  tam atmet.
                </p>
                <p>
                  Microsoft Clarity papildus fiksē, kā lapa tiek lietota: ritināšanu, klikšķus un
                  peles kustību. Ievadītos formas laukus un maksājumu datus tas neieraksta. To lietoju,
                  lai redzētu, kur cilvēki apstājas, nevis lai atpazītu konkrētu cilvēku.
                </p>
                <p>
                  Tava izvēle glabājas pārlūka lokālajā krātuvē (localStorage) ar nosaukumu{" "}
                  <code>cookie_consent_v1</code> - šis ieraksts nav sīkdatne un netiek sūtīts serverim.
                  Piekrišanas noklusējums lapā ir „liegts” (Google Consent Mode v2). Pirms tavas
                  izvēles Google saņem anonīmu signālu bez sīkdatnēm un bez identifikatora, pēc kura
                  tevi varētu atpazīt nākamreiz. Statistiku, ko var sasaistīt ar tavu apmeklējumu,
                  sāku vākt tikai pēc tavas piekrišanas.
                </p>
                <p>
                  Piekrišanu jebkurā brīdī vari mainīt kājenes saitē „Sīkdatņu iestatījumi” - tā atver
                  paziņojumu no jauna. Ja izvēlies „Tikai vajadzīgās” vai atsauc jau doto piekrišanu,
                  sīkdatnes, ko izvietoja Google Analytics, tiek izdzēstas uzreiz. Sīkdatņu dzēšana
                  pārlūkā pašu izvēli neatiestata.
                </p>
              </Section>

              <Section title="7. Datu nodošana trešajām personām">
                <p>
                  Tavus datus nenododu trešajām personām, izņemot trīs pakalpojumu sniedzējus, kas
                  nepieciešami mājaslapas darbībai: hostings - Vercel Inc.; kontaktformas vēstuļu piegāde -
                  Resend; apmeklējuma statistika (ar tavu piekrišanu) - Google Ireland Limited. Visi trīs
                  apstrādā šos datus manā uzdevumā un atbilst GDPR prasībām. Pieprasījums netiek glabāts
                  nevienā datubāzē - tas nonāk manā e-pastā un paliek tur.
                </p>
              </Section>

              <Section title="8. Sazinies">
                <p>
                  Jautājumi par datu apstrādi: <EmailLink />.
                </p>
              </Section>
            </div>
            ) : (
              <div className="mt-12">
              <Section title="1. Data controller">
                <p>
                  The controller of this website is Gatis Daugavietis (Gatis Design), a self-employed person registered
                  in Latvia. Contact: <EmailLink />.
                </p>
              </Section>
              <Section title="2. What data I collect">
                <BulletList
                  items={[
                    "In the contact form: first and last name, email, the selected service, the budget range, the desired deadline and the project description.",
                    "Technical data recorded by the hosting (Vercel) - IP address and request time. Used only for the site's operation and the form's rate limiting.",
                    `If you consent to analytics - Google Analytics 4 and Microsoft Clarity cookies (${cookieList("en")}). They store a random visitor identifier, not a name or an email. Without consent they are not set.`,
                  ]}
                />
              </Section>
              <Section title="3. Why I process data">
                <BulletList
                  items={[
                    "To reply to your request and prepare a project proposal.",
                    "To maintain and improve the website's operation.",
                    "If you consent to analytics - to understand which pages are useful and where people stop.",
                  ]}
                />
              </Section>
              <Section title="4. How long I keep data">
                <p>
                  I keep contact form data only as long as needed to process the project request and, if we start
                  working together, to fulfil the contract and accounting requirements (up to 5 years). After that I
                  delete or anonymize the data.
                </p>
              </Section>
              <Section title="5. Your rights">
                <BulletList
                  items={[
                    "Request access to your data.",
                    "Ask for data to be corrected or deleted.",
                    "Withdraw consent at any time.",
                    "Complain to the Data State Inspectorate of Latvia (dvi.gov.lv).",
                  ]}
                />
              </Section>
              <Section title="6. Cookies and consent">
                <p>
                  Without your consent the website sets no cookies at all. If you consent, Google Analytics 4 and
                  Microsoft Clarity load through Google Tag Manager and set {cookieCount("en")} cookies -{" "}
                  <code>{cookieList("en")}</code>. They contain a random identifier, not your data, and are kept for up
                  to 14 months. Google Analytics does not store the IP address - it is used only to determine the
                  approximate location and then discarded.
                </p>
                <p>
                  Microsoft Clarity additionally records how the page is used: scrolling, clicks and mouse movement. It
                  does not record typed form fields or payment data. I use it to see where people stop, not to identify
                  a specific person.
                </p>
                <p>
                  Your choice is stored in the browser's local storage (localStorage) under the name{" "}
                  <code>cookie_consent_v1</code> - this entry is not a cookie and is not sent to the server. The consent
                  default on the site is "denied" (Google Consent Mode v2). Before your choice Google receives an
                  anonymous signal without cookies and without an identifier that could recognize you next time. I start
                  collecting statistics that can be linked to your visit only after your consent.
                </p>
                <p>
                  You can change your consent at any time through the footer link "Cookie settings" - it opens the notice
                  again. If you choose "Only necessary" or withdraw consent you have already given, the cookies placed by
                  Google Analytics are deleted immediately. Deleting cookies in the browser does not reset the choice
                  itself.
                </p>
              </Section>
              <Section title="7. Sharing data with third parties">
                <p>
                  I do not share your data with third parties, except three service providers needed for the website to
                  work: hosting - Vercel Inc.; delivery of contact form emails - Resend; visit statistics (with your
                  consent) - Google Ireland Limited. All three process this data on my behalf and comply with GDPR. The
                  request is not stored in any database - it lands in my inbox and stays there.
                </p>
              </Section>
              <Section title="8. Contact">
                <p>
                  Questions about data processing: <EmailLink />.
                </p>
              </Section>
            </div>
            )}
          </div>
        </article>
      </div>
    </>
  );
}
