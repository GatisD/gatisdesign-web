# gatisdesign-web

Personīgā portfolio mājaslapa - `gatisdesign.com`. Zīmola identitāte, mājaslapu izstrāde, AI aģenti un redzamība meklētājos. LV saknē, EN zem `/en`.

## Tech stack

- Vite + React 18 + TypeScript
- vite-react-ssg (per-route SSG - unikāli meta katrai lapai)
- Tailwind CSS (bez shadcn/ui un bez Radix - tie ir izņemti)
- Lenis (gluda ritināšana; pārējā kustība ir CSS)
- react-helmet-async v1.3 (vite-react-ssg compatible)
- react-hook-form + zod (forma)
- Vercel serverless funkcija `api/contact.ts` + Resend (formas vēstules)

Fonti ir pašhostēti (`@fontsource`), tikai woff2, tikai latin un latin-ext -
sk. `src/styles/tokens.css`.

## Kustība

Framer Motion projektā NAV apzināti: vite-react-ssg maršrutu gabalus
priekšielādē katrā lapā, tāpēc bibliotēka maksāja 41,5 KB gzip arī tur, kur no
tās nekas netika lietots. Atklāsme, vilnis un mikro-interakcijas ir CSS
(`src/index.css`), magnētiskā poga un skaitītājs - viens rAF cikls.

`src/components/animations/`:

- `Reveal` - scroll-triggered fade (CSS klase, ne inline stils)
- `LineReveal` - virsraksta rindu atklāsme
- `CountUp` - skaitļi lapā "Par mani"
- `MagneticButton` - tikai pie `pointer: fine`, amplitūda <= 12 px

Slēpšana notiek tikai zem `html[data-reveal="on"]`, ko `index.html` inline
skripts NEUZLIEK pie `prefers-reduced-motion: reduce`. Tāpēc bez JS, ar
izslēgtu kustību un drukājot saturs ir redzams. Visiem efektiem ir 3 s avārijas
taimeris tīrā CSS.

## Būves vārti

`npm run build` = typecheck + API ielādes pārbaude + SSG + preload apgriešana +
`scripts/verify-build.mjs`. Vārti pārbauda visas 66 lapas: hreflang, `lang`,
og:image, mono etiķešu izmēru pa elementu, EN lapu `noindex`, unikālus
title/description/canonical, h1 rindu atstarpes, fontu preload skaitu, sitemap
un to, ka kontaktu lapā nonāk katra satura sadaļa.

`npm run verify:build` palaiž tos pašus vārtus pret bojātām dist kopijām un
prasa, lai katrs vārts noķer savu kļūdu.

## Kontaktforma

- UI: `src/components/ContactForm.tsx` (react-hook-form + zod, teksti no `src/i18n/dict.ts` sadaļas `form`)
- Serveris: `api/contact.ts` -> `api/_lib/` (validācija, slazds robotiem, ātruma ierobežojums, Resend)
- Shēma `api/_lib/contact-schema.ts` ir viena abām pusēm, tāpēc klients un serveris nevar atšķirties
- Izvēlņu uzraksti un lauku garumi: `api/_lib/contact-fields.ts` (no turienes tos ņem gan forma, gan e-pasts)
- Testi: `npm test` (`api/_lib/contact-core.test.ts` - validācija, slazds, limits, kļūdu ceļi)

Lokāla pārbaude ar reālu sūtīšanu (`npm run dev` funkcijas nepalaiž, tam vajag `vercel dev`):

```bash
export $(grep RESEND_API_KEY ~/.config/resend/gatis.env | xargs)
export CONTACT_TO=gatis.design@gmail.com
npx vercel dev --listen 4800
curl -X POST http://localhost:4800/api/contact -H "Content-Type: application/json" -d '{...}'
```

## Lokāla izstrāde

```bash
npm install
npm run dev        # http://localhost:8080 (bez /api funkcijām)
npm run typecheck  # src + vite config + api
npm test
npm run build      # vite-react-ssg build -> dist/
```

## Deploy

Vercel auto-deploy no `main` branch. Domēns `gatisdesign.com`.

### Vides mainīgie Vercel Project Settings -> Environment Variables

Uzliek visām vidēm (Production, Preview, Development):

| Mainīgais | Obligāts | Vērtība | Kāpēc |
|---|---|---|---|
| `RESEND_API_KEY` | jā | Resend atslēga (`https://resend.com/api-keys`) | Bez tās `/api/contact` atbild 500 ar kodu `config` un neviens pieteikums neaiziet |
| `CONTACT_TO` | nē | `gatis.design@gmail.com` | Saņēmējs. Noklusējums ir tas pats, bet mainīgais ļauj to nomainīt bez koda izmaiņām |
| `CONTACT_FROM` | nē | `Gatis Design <forma@send.gatisdesign.com>` | Sūtītājs. Domēnam jābūt verificētam Resend kontā |
| `CONTACT_REPLY_TO` | nē | tukšs | Uz kurieni aiziet atbilde uz automātisko vēstuli; ja tukšs, lieto `CONTACT_TO` |
| `VITE_SITE_URL` | nē | `https://gatisdesign.com` | Canonical, og:url, sitemap |
| `VITE_GTM_ID` | nē | tukšs vai `GTM-XXXXXXX` | Google Tag Manager konteiners. Kamēr tukšs, `src/components/analytics/Gtm.tsx` nerenderē neko |

`CONTACT_*` un `RESEND_API_KEY` ir bez `VITE_` prefiksa apzināti - ar to prefiksu Vite tos
ieliktu pārlūka pakā.

Neaiztiekam `gatisdesign.com` sūtīšanas konfigurāciju Resend pusē - to lieto grāmatvedības
platforma rēķiniem no `info@gatisdesign.com`. Formas plūsma iet caur `send.gatisdesign.com`.

## TODO klients

- [ ] Pieslēgt `gatisdesign.com` (Cloudflare DNS -> Vercel) - sk. `docs/go-live.md`
- [ ] Pievienot GTM/GA4 konteinera ID (`VITE_GTM_ID`) - tracking-setup
- [ ] Portrets vai 15 sekunžu video darba vidē (hero, kājene, "Par mani")
- [ ] Trīs atsauksmes ar vārdu, uzņēmumu un rezultātu -> `src/content/testimonials.ts`
- [ ] EN saturs (`src/content/en/*.json`) -> `LANGUAGE_SWITCH_VISIBLE = true`, `noindex` nost
- [ ] Piecas dziļās case study lapas (uzdevums / ko izdarīju / kas mainījās)
- [x] Resend API key (formām) - `RESEND_API_KEY` Vercel projektā
