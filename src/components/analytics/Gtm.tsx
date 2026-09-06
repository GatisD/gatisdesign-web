import { Helmet } from "react-helmet-async";

/**
 * Google Tag Manager konteinera ielāde.
 *
 * Vieta ir sagatavota, mērījums vēl nav uzstādīts. Konteinera ID nāk no
 * `VITE_GTM_ID` - tas ir publisks identifikators (tas jebkurā gadījumā ir
 * redzams lapas kodā), ne noslēpums, tāpēc VITE_ prefikss te ir vietā.
 *
 * Ja mainīgā nav vai tas neizskatās pēc īsta konteinera ID, komponente
 * NERENDERĒ NEKO. Tas ir apzināti: `GTM-XXXXXXX` vietturis dzīvā lapā nozīmē
 * 404 pieprasījumu uz googletagmanager.com katrā ielādē un tracking, kas
 * izskatās uzstādīts, bet neko nemēra.
 *
 * Secība ir svarīga: Consent Mode v2 noklusējums (viss liegts) sēž inline
 * `index.html` galvenē un nostrādā PIRMS šī skripta. Piekrišanu pārslēdz
 * CookieBanner ar `gtag('consent', 'update', ...)`.
 *
 * Kad ID būs zināms: `VITE_GTM_ID=GTM-XXXXXXX` Vercel vides mainīgajos
 * (Production un Preview atsevišķi) un jauna būve. Koda izmaiņas nav vajadzīgas.
 */
const GTM_ID = import.meta.env.VITE_GTM_ID;
const VALID = /^GTM-[A-Z0-9]{5,}$/;

export default function Gtm() {
  if (!GTM_ID || !VALID.test(GTM_ID)) return null;
  return (
    <Helmet>
      <script>{`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${GTM_ID}');`}</script>
    </Helmet>
  );
}
