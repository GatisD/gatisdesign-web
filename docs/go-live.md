# gatisdesign.com go-live: precīzā secība

Sagatavots 2026-09-06. Domēna pārslēgšanu veic Gatis; šis dokuments ir soļu
saraksts ar komandām, ko izpildīt katrā solī, un ar to, kas skaitās "izdevās".

**Sākuma stāvoklis (nomērīts 2026-09-05):**

```
dig +short gatisdesign.com A     -> 151.101.0.119, 151.101.64.119   (Fastly)
dig +short gatisdesign.com NS    -> rayden.ns.cloudflare.com, melina.ns.cloudflare.com
curl -sI https://gatisdesign.com/ -> HTTP/2 404, server: Varnish
curl -s  https://gatisdesign.com/ -> vecā angļu lapa (Adobe Portfolio)
```

Tātad: NS ir Cloudflare, ieraksti rāda uz Adobe/Fastly. Vercel projekts dzīvo
atsevišķi un šobrīd atbild tikai uz `*.vercel.app` adresēm.

---

## 0. Pirms sāc (5 minūtes)

- [ ] **Vercel Firewall.** Project -> Firewall: pārliecinies, ka **Attack
      Challenge Mode ir OFF**. Preview atbild `403` ar
      `x-vercel-mitigated: challenge` uz katru nekešotu pieprasījumu, arī uz
      `/robots.txt`. Ja tas ir projekta, ne tikai preview līmenī, pēc
      pārslēgšanas Googlebot un OAI-SearchBot saņems 403 lapu, un viss
      robots.txt/llms.txt/sitemap darbs nestrādās.
      Preview aizsardzībai lieto Deployment Protection (401), ne challenge.
- [ ] **Vides mainīgie.** Project -> Settings -> Environment Variables:
      `RESEND_API_KEY` ir uzstādīts **Production** videi (ne tikai Preview).
      `VITE_SITE_URL=https://gatisdesign.com`.
- [ ] **Zars.** `redizains-2026` ir samerdžēts `main` (Vercel auto-deploy iet no
      `main`).
- [ ] **Pieteikuma tests.** Pirms domēna maiņas nosūti vienu īstu pieteikumu no
      preview un pārliecinies, ka vēstule pienāk un `Reply-To` ir tavs e-pasts.
      To neviens audits nevar pārbaudīt tavā vietā.

---

## 1. Vercel: pievieno domēnu

1. Vercel -> Project -> Settings -> Domains -> **Add** `gatisdesign.com`.
2. Turpat pievieno `www.gatisdesign.com` un uzstādi to kā **Redirect to
   `gatisdesign.com`** (308).
3. Vercel parādīs, kādu ierakstu tas gaida. Pieraksti to - tas ir nākamā soļa
   ievade.

Pēc šī soļa Vercel domēnu rādīs kā "Invalid Configuration" - tas ir gaidīts,
kamēr DNS vēl rāda uz Adobe.

---

## 2. Cloudflare DNS: pārslēdz ierakstus

Cloudflare -> gatisdesign.com -> DNS -> Records.

| Tips | Vārds | Vērtība | Proxy |
|---|---|---|---|
| A | `@` | `76.76.21.21` | **DNS only** (pelēks mākonis) |
| CNAME | `www` | `cname.vercel-dns.com` | **DNS only** |

- Vecos A/AAAA/CNAME ierakstus uz Adobe/Fastly **dzēs**, nevis atstāj blakus.
- **Proxy OBLIGĀTI izslēgts.** Ar oranžo mākoni HSTS, pāradresācijas un keša
  galvenes dzīvo divos slāņos, un tad neviens vairs nezina, kurš atbild.
- **NEAIZTIEC** MX ierakstus un `send.gatisdesign.com` - tur iet Resend formu
  vēstules un grāmatvedības platformas rēķini no `info@gatisdesign.com`.

Pārbaude (TTL dēļ var paiet līdz 5 minūtēm):

```bash
dig +short gatisdesign.com A            # jādod 76.76.21.21
dig +short www.gatisdesign.com CNAME    # jādod cname.vercel-dns.com
```

---

## 3. Kad Vercel domēnu rāda kā derīgu

```bash
H=https://gatisdesign.com

# 1. Sākumlapa atbild un tā ir JAUNĀ lapa
curl -sI  $H/ | head -3
curl -sL  $H/ | grep -o '<title>[^<]*</title>'
#   gaidīts: 200 un "Gatis Daugavietis - web dizainers ... | Gatis Design"

# 2. Vecās adreses pāriet uz jaunajām ar 308 (pastāvīgi)
for p in /about-me /about /contact /home /work; do
  printf '%-12s ' "$p"; curl -sI "$H$p" | awk '/^HTTP|^location/ {printf "%s ", $0}'; echo
done
#   gaidīts: 308 + location uz /par-mani /par-mani /kontakti / /portfolio

# 3. Neesoša lapa ir īsts 404, ne 200 ar sākumlapu
curl -sI $H/nav-tadas-lapas | head -1     # gaidīts: 404

# 4. Roboti tiek iekšā - ŠIS IR TAS, KAS PIRMS TAM KRITA
curl -sI -A "Googlebot/2.1 (+http://www.google.com/bot.html)" $H/robots.txt | head -1
curl -sI -A "Mozilla/5.0 (compatible; OAI-SearchBot/1.0; +https://openai.com/searchbot)" $H/ | head -1
curl -sI -A "Mozilla/5.0 (compatible; ClaudeBot/1.0)" $H/llms.txt | head -1
curl -sI -A "Mozilla/5.0 (compatible; PerplexityBot/1.0)" $H/sitemap.xml | head -1
#   gaidīts: visiem 200. Ja kāds dod 403 vai satur "Vercel Security
#   Checkpoint" - atgriezies pie 0. soļa, Attack Challenge Mode ir ieslēgts.

# 5. Drošības galvenes (7 no 7)
curl -sI $H/ | grep -iE 'strict-transport|content-security|x-frame|x-content-type|referrer-policy|permissions-policy|cross-origin-opener'

# 6. Sitemap un lapas, uz kurām tas norāda
curl -s $H/sitemap.xml | grep -c '<loc>'          # gaidīts: 32
for u in $(curl -s $H/sitemap.xml | sed -n 's/.*<loc>\(.*\)<\/loc>.*/\1/p'); do
  printf '%-58s %s\n' "$u" "$(curl -o /dev/null -s -w '%{http_code}' "$u")"
done
#   gaidīts: 200 visām 32

# 7. Forma dzīvajā (nesūtot pieteikumu)
curl -s -o /dev/null -w '%{http_code}\n' -X GET  $H/api/contact          # 405
curl -s -X POST -H 'Content-Type: application/json' --data 'nav json' $H/api/contact   # 400 {"error":"json"}
```

---

## 4. Adobe Portfolio atslēgšana

Tikai **pēc** tam, kad 3. soļa pārbaudes iet cauri.

1. Adobe Portfolio -> Settings -> Domains: noņem `gatisdesign.com` piesaisti.
2. Pārliecinies, ka Adobe pusē nepaliek aktīva pāradresācija uz veco lapu.
3. Ja Adobe abonements vairs nav vajadzīgs nekam citam - atcel to.

Secība ir svarīga: ja Adobe atslēdz pirms DNS pārslēgšanas, domēns kādu laiku
neatbild vispār.

---

## 5. Google Search Console

1. Property `https://gatisdesign.com` (URL prefix). Verifikācija ar DNS TXT
   ierakstu Cloudflare pusē - to var uzlikt jau pirms pārslēgšanas.
2. Sitemaps -> pievieno `https://gatisdesign.com/sitemap.xml`.
3. URL Inspection -> `https://gatisdesign.com/` -> **Test live URL** ->
   *View tested page* -> *Screenshot*. Skaties, vai Google redz lapu, nevis
   drošības pārbaudes ekrānu. Tad **Request indexing**.
4. To pašu vismaz šīm četrām: `/majaslapu-izstrade`, `/zimola-identitate`,
   `/ai-agenti`, `/seo-geo-aeo`.
5. Pirmajā nedēļā: Pages -> pārbaudi, vai neparādās "Duplicate without
   user-selected canonical" un vai EN lapas ir "Excluded by noindex tag" (tā ir
   pareizā atbilde, kamēr EN saturs nav uzrakstīts).

---

## 6. Pēc pārslēgšanas, tajā pašā dienā

- [ ] Nosūti vienu īstu pieteikumu no dzīvās lapas. Pārbaudi, ka vēstule pienāk
      un ka `Reply-To` ir sūtītāja adrese.
- [ ] Pievieno `gatisdesign.com` Site Watchdog un Hacker Watchdog sarakstiem
      (šobrīd tā tur nav).
- [ ] PageSpeed Insights uz dzīvā domēna (mobilais un dators) - preview cipari
      ir ar Vercel preview galvenēm, ne ar produkcijas kešu.
- [ ] HSTS `preload` iesniegšana (`hstspreload.org`) - **tikai tad**, kad esi
      drošs, ka neviens apakšdomēns (`send.gatisdesign.com` un citi) nekad
      netiks apkalpots pa HTTP. `includeSubDomains` pēc preload ir praktiski
      neatgriezenisks.

---

## 7. Kas paliek atvērts un kāpēc

| Punkts | Kas jādara | Kas notiek līdz tam |
|---|---|---|
| GTM/GA4 | `VITE_GTM_ID = GTM-MR2Q6KF2` ir Vercel Preview un Production vidē; atlicis publicēt GA4 tagus konteinerī | Konteiners ielādējas, bet tajā vēl nav neviena taga, tāpēc lapa nemēra neko. **Pirms domēna pārslēgšanas pārbaudi, ka konteinerī tiešām ir publicēts `Google tag - GA4`** - sīkdatņu joslas un privātuma politikas teksts jāsaskaņo ar to, kas reāli darbojas |
| EN saturs | `src/content/en/*.json`, tad `LANGUAGE_SWITCH_VISIBLE = true`, `noindex` nost, EN atpakaļ sitemapā | LV/EN pārslēgs ir paslēpts, EN lapas ir noindex un ārpus sitemap |
| Atsauksmes | 3 atsauksmes ar vārdu, uzņēmumu, amatu un rezultātu -> `src/content/testimonials.ts`, `TESTIMONIALS_ENABLED = true` | Sadaļa nerenderējas |
| Portrets un video | Faili -> `public/media/` | Vietturi produkcijā nerenderējas |
| 5 dziļās case study lapas | Uzdevums / ko izdarīju / kas mainījās, 250-400 vārdi | 5 lapām nav apraksta, tām sitemap prioritāte ir 0,5 |
| CSP `script-src` | Nonce caur edge middleware | `'unsafe-inline'` - vite-react-ssg katrā lapā ieraksta savu hidratācijas skriptu ar atšķirīgu saturu, tāpēc jaucējsummas statiskā galvenē nav iespējamas. No ārējiem skriptu avotiem atļauts tikai `googletagmanager.com` |

### CSP un mērījumu rīki

`vercel.json` CSP atļauj tieši tos avotus, kas tiešām strādā. Katram jaunam
mērījumu rīkam avoti jāpieliek ATSEVIŠĶI - citādi skripts tiek klusi bloķēts un
izskatās, ka tags ir salauzts:

| Rīks | Kas jāpieliek |
|---|---|
| Google Tag Manager, GA4 | jau ir: `script-src`, `img-src`, `connect-src` |
| Meta Pixel | `script-src https://connect.facebook.net`, `img-src https://www.facebook.com`, `connect-src https://www.facebook.com` |
| Microsoft Clarity | `script-src https://www.clarity.ms`, `connect-src https://*.clarity.ms https://*.bing.com` |

GTM Preview (Tag Assistant) šo CSP neiztur - tā pārklājumam vajag
`tagmanager.google.com` skriptus, stilus un iframe. Tas ir apzināti: tagu
pārbaudei lieto headless zondi, ne Preview.
| react-router 7 | Migrācija | Divas `npm audit` moderate rindas, kas šajā kodā nav izmantojamas |

---

## 8. Ja kaut kas noiet greizi

- **Lapa neatbild pēc DNS maiņas.** Pārbaudi `dig +short gatisdesign.com A`.
  Ja tur vēl ir Fastly IP, gaidi TTL. Ja tur ir Cloudflare IP (104.x, 172.67.x),
  proxy ir ieslēgts - izslēdz to.
- **Roboti dabū 403.** Attack Challenge Mode. Vercel -> Firewall -> OFF.
- **Vecās saites dod 404, ne 308.** `vercel.json` `redirects` bloks netika
  izvietots - pārbaudi, ka deploy nāca no `main` ar jaunāko commitu.
- **Atgriešanās ceļš.** Vercel deploy ir nemainīgi: Deployments -> vecais
  deploy -> Promote to Production. DNS atgriešanai Cloudflare glabā DNS
  momentuzņēmumus (DNS -> Records -> Snapshots).
