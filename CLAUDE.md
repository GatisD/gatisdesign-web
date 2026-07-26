# gatisdesign.com - projekta instrukcijas

Personīgā portfolio lapa. LV saknē, EN zem /en. Statiski ģenerēta ar vite-react-ssg, hostēta Vercel.

## Valoda un stils
- Visos LV tekstos tikai īsā defise `-` (U+002D). Nekādu em-dash vai en-dash.
- EUR pēc skaitļa: `500 EUR`. Procenti bez atstarpes: `15%`.
- Pirms jebkura LV teksta commit - gramatikas pārbaude (`lv-grammar-strict-rules`).
- EN teksti tiek rakstīti, nevis tulkoti automātiski.

## Tehniskie noteikumi
- Locale tiek padots kā props, nekad nelasa no useLocation - citādi SSR un klients atšķiras.
- hreflang pāri nāk no `src/i18n/routes.ts`, nekad no string manipulācijas pār URL.
- Nekādu `new Date()`, `Math.random()` vai izkārtojuma mērījumu render laikā (hidratācijas neatbilstības).
- `npm run build` ietver typecheck un `scripts/verify-build.mjs`. Ja vārti krīt, deploy nenotiek.

## Deploy
Vercel auto-deploy no `main`. Domēns gatisdesign.com. Git commit autors: Gatis Daugavietis <gatis.design@gmail.com>.
