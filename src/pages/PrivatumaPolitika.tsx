import SEO from "@/components/SEO";
import JsonLd, { buildBreadcrumbSchema } from "@/components/JsonLd";
import { CONTACT_EMAIL } from "@/lib/site";

export default function PrivatumaPolitika() {
 return (
 <>
 <SEO
 title="Privātuma politika"
 description="Gatis Design privātuma politika - kā apstrādājam tavus datus, kādas ir tavas tiesības un kā ar mums sazināties."
 path="/privatuma-politika"
 lastModified="2026-05-03"
 />
 <JsonLd
 data={buildBreadcrumbSchema([
 { name: "Sākums", path: "/" },
 { name: "Privātuma politika", path: "/privatuma-politika" },
 ])}
 />

 <article className="max-w-3xl mx-auto px-6 md:px-10 py-16 md:py-24 prose prose-neutral prose-headings:font-display prose-headings:tracking-tight">
 <span className="eyebrow text-muted-foreground block mb-6">PRIVĀTUMS</span>
 <h1 className="h2-editorial mb-8">Privātuma politika</h1>
 <p className="text-sm text-muted-foreground">
 Pēdējā atjaunošana: 2026-05-03
 </p>

 <h2>1. Datu pārzinis</h2>
 <p>
 Šīs mājaslapas pārzinis ir Gatis Daugavietis (Gatis Design), individuālā darba veicējs,
 kas reģistrēts Latvijā. Sazināties: {" "}
 <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
 </p>

 <h2>2. Kādus datus ievācu</h2>
 <ul>
 <li>Vārds un uzvārds, e-pasts un projekta apraksts, ko iesniedz caur kontaktu formu.</li>
 <li>Sīkdatnes (cookies), ja esi piekritis to izmantošanai (Google Consent Mode v2).</li>
 <li>Tehniska informācija - IP adrese, pārlūks, lapas, ko apmeklē - anonimizētā formā.</li>
 </ul>

 <h2>3. Kāpēc apstrādāju datus</h2>
 <ul>
 <li>Lai atbildētu uz tavu pieprasījumu un sagatavotu projekta piedāvājumu.</li>
 <li>Lai uzturētu un uzlabotu mājaslapas darbību.</li>
 <li>Anonīma analīze (kad būs aktivizēts), lai saprastu, kāds saturs ir noderīgs.</li>
 </ul>

 <h2>4. Cik ilgi glabāju datus</h2>
 <p>
 Kontaktu formas datus glabāju tikai tik ilgi, cik nepieciešams projekta pieprasījuma
 apstrādei un, ja sākam sadarbību, līguma izpildei un grāmatvedības prasībām (līdz 5
 gadiem). Pēc tam datus dzēšu vai anonimizēju.
 </p>

 <h2>5. Tavas tiesības</h2>
 <ul>
 <li>Pieprasīt piekļuvi saviem datiem.</li>
 <li>Lūgt datus labot vai dzēst.</li>
 <li>Atsaukt piekrišanu jebkurā brīdī.</li>
 <li>Sūdzēties Datu valsts inspekcijai (dvi.gov.lv).</li>
 </ul>

 <h2>6. Sīkdatnes</h2>
 <p>
 Mājaslapā tiek lietotas tikai tehniski nepieciešamās sīkdatnes (sesijas pārvaldība) un, ja
 piekrīti, anonīmas analītikas sīkdatnes. Piekrišanu jebkurā brīdī vari mainīt, izdzēšot
 sīkdatnes pārlūkprogrammā.
 </p>

 <h2>7. Datu nodošana trešajām personām</h2>
 <p>
 Tavus datus nenododu trešajām personām, izņemot pakalpojumu sniedzējus, kas nepieciešami
 mājaslapas darbībai (hostings - Vercel; e-pasta sūtīšana - Resend, kad būs aktivizēts).
 Šie partneri ir atbilstoši GDPR.
 </p>

 <h2>8. Sazinies</h2>
 <p>
 Jautājumi par datu apstrādi:{" "}
 <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
 </p>
 </article>
 </>
 );
}
