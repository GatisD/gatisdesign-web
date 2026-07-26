# gatisdesign-web

Personīgā portfolio mājaslapa - `gatisdesign.com`. Brand identity un web dizains, 18 gadi pieredzes.

## Tech stack

- Vite + React 18 + TypeScript
- vite-react-ssg (per-route SSG - unikāli meta katrai lapai)
- Tailwind CSS + shadcn/ui (minimāls, tikai Tooltip + Sonner)
- Framer Motion + Lenis (smooth scroll, animation library)
- react-helmet-async v1.3 (vite-react-ssg compatible)
- react-hook-form + zod (forma)
- Vercel serverless funkcija `api/contact.ts` + Resend (formas vēstules)

## Animation pattern library

`src/components/animations/`:

- `FadeInOnScroll` - universāls scroll-triggered fade
- `RevealText` - H1 word-by-word reveal
- `CountUp` - stats animētie skaitļi
- `HoverLift` - portfolio tile hover
- `Marquee` - bezgalīgs logo josla
- `MagneticButton` - premium pogu attraction

Visi respect `prefers-reduced-motion`.

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

`CONTACT_*` un `RESEND_API_KEY` ir bez `VITE_` prefiksa apzināti - ar to prefiksu Vite tos
ieliktu pārlūka pakā.

Neaiztiekam `gatisdesign.com` sūtīšanas konfigurāciju Resend pusē - to lieto grāmatvedības
platforma rēķiniem no `info@gatisdesign.com`. Formas plūsma iet caur `send.gatisdesign.com`.

## TODO klients

- [ ] Pievienot reālus portfolio cover attēlus `public/portfolio/*.jpg`
- [x] Pievienot Resend API key (formām) - `RESEND_API_KEY` Vercel projektā
- [ ] Pievienot GA4 / GTM ID kad gatavs (sk. `index.html`)
- [ ] Pieslēgt `gatisdesign.com` pēc testa
