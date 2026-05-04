# gatisdesign-web

Personīgā portfolio mājaslapa — `gatisdesign.com`. Brand identity un web dizains, 18 gadi pieredzes.

## Tech stack

- Vite + React 18 + TypeScript
- vite-react-ssg (per-route SSG → unikāli meta katrai lapai)
- Tailwind CSS + shadcn/ui (minimāls, tikai Tooltip + Sonner)
- Framer Motion + Lenis (smooth scroll, animation library)
- react-helmet-async v1.3 (vite-react-ssg compatible)
- react-hook-form + zod (forma)

## Animation pattern library

`src/components/animations/`:

- `FadeInOnScroll` — universāls scroll-triggered fade
- `RevealText` — H1 word-by-word reveal
- `CountUp` — stats animētie skaitļi
- `HoverLift` — portfolio tile hover
- `Marquee` — bezgalīgs logo josla
- `MagneticButton` — premium pogu attraction

Visi respect `prefers-reduced-motion`.

## Lokāla izstrāde

```bash
npm install
npm run dev    # http://localhost:8080
npm run build  # vite-react-ssg build → dist/
```

## Deploy

Vercel auto-deploy no `main` branch. Custom domain `gatisdesign.com` pieslēdzams pēc testa Vercel
dashboard.

## Environment variables

Sk. `.env.example`. Production secrets uzliek Vercel Project Settings → Environment.

## TODO klients

- [ ] Pievienot reālus portfolio cover attēlus `public/portfolio/*.jpg`
- [ ] Pievienot Resend API key (formām)
- [ ] Reģistrēt reCAPTCHA v3 priekš `gatisdesign.com`
- [ ] Pievienot GA4 / GTM ID kad gatavs (sk. `index.html`)
- [ ] Pieslēgt `gatisdesign.com` pēc testa
