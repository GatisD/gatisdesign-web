#!/usr/bin/env python3
"""Search Console stāvoklis vienā skatā: vai Google jau ir ieraudzījis lapu.

Kāpēc tas vajadzīgs: pēc redizaina 2026-09-06 Google sākumlapu pēdējoreiz bija
rāpojis 23. augustā, un tā kanoniskā versija tam joprojām bija mirusī Adobe
lapa (gatisdesign.myportfolio.com, kas jau dod 404). Tas pats sakārtojas pēc
pārrāpošanas, bet tikai tad, ja kāds pamana, ka tas ir noticis. Šis skripts to
pamana.

Palaišana:
    python3 scripts/gsc-status.py                # cilvēkam lasāms
    python3 scripts/gsc-status.py --json         # mašīnai

Piekļuve: gspread service account ar Full tiesībām uz sc-domain:gatisdesign.com.
Atsevišķa OAuth nav vajadzīga.
"""
import json
import sys
import urllib.parse
from datetime import date, timedelta

from google.oauth2 import service_account
from google.auth.transport.requests import AuthorizedSession

SA = "/Users/gatisdaugavietis/.config/gspread/service_account.json"
SITE = "sc-domain:gatisdesign.com"
# Lapas, kas nes lielāko daļu nozīmes. Pilnu sarakstu dod sitemap; te ir tās,
# kuru indeksācija ir svarīga pirmā.
SVARIGAS = [
    "https://gatisdesign.com/",
    "https://gatisdesign.com/portfolio",
    "https://gatisdesign.com/pakalpojumi",
    "https://gatisdesign.com/majaslapu-izstrade",
    "https://gatisdesign.com/zimola-identitate",
    "https://gatisdesign.com/seo-geo-aeo",
    "https://gatisdesign.com/ai-agenti",
    "https://gatisdesign.com/kontakti",
]
# Kanoniskā, kurai NEDRĪKST būt neviena lapa. Ja te vēl kāda parādās, redizains
# Google acīs vēl nav noticis.
MIRUSAIS_HOSTS = "myportfolio.com"


def sesija():
    creds = service_account.Credentials.from_service_account_file(
        SA, scopes=["https://www.googleapis.com/auth/webmasters"]
    )
    return AuthorizedSession(creds)


def sitemap(s):
    site = urllib.parse.quote(SITE, safe="")
    sm = urllib.parse.quote("https://gatisdesign.com/sitemap.xml", safe="")
    r = s.get(f"https://www.googleapis.com/webmasters/v3/sites/{site}/sitemaps/{sm}")
    if r.status_code != 200:
        return {"kluda": f"HTTP {r.status_code}"}
    d = r.json()
    return {
        "iesniegts": d.get("lastSubmitted"),
        "lejupieladets": d.get("lastDownloaded"),
        "kludas": int(d.get("errors", 0)),
        "bridinajumi": int(d.get("warnings", 0)),
        "adreses": next((int(c.get("submitted", 0)) for c in d.get("contents", [])), 0),
    }


def indekss(s):
    out = []
    for u in SVARIGAS:
        r = s.post(
            "https://searchconsole.googleapis.com/v1/urlInspection/index:inspect",
            json={"inspectionUrl": u, "siteUrl": SITE, "languageCode": "lv"},
        )
        if r.status_code != 200:
            out.append({"url": u, "kluda": f"HTTP {r.status_code}"})
            continue
        i = r.json().get("inspectionResult", {}).get("indexStatusResult", {})
        kan = i.get("googleCanonical", "")
        out.append({
            "url": u,
            "verdikts": i.get("verdict"),
            "segums": i.get("coverageState"),
            "rapots": i.get("lastCrawlTime"),
            "kanoniska": kan,
            "svesa_kanoniska": MIRUSAIS_HOSTS in kan,
        })
    return out


def veiktspeja(s, dienas=7):
    site = urllib.parse.quote(SITE, safe="")
    beigas = date.today()
    sakums = beigas - timedelta(days=dienas)
    r = s.post(
        f"https://www.googleapis.com/webmasters/v3/sites/{site}/searchAnalytics/query",
        json={"startDate": str(sakums), "endDate": str(beigas), "rowLimit": 1},
    )
    rows = r.json().get("rows", [{}])
    x = rows[0] if rows else {}
    return {"dienas": dienas, "klikski": x.get("clicks", 0), "paradisanas": x.get("impressions", 0)}


def main():
    s = sesija()
    dati = {"sitemap": sitemap(s), "indekss": indekss(s), "veiktspeja": veiktspeja(s)}

    # Trīs stāvokļi, ne divi. Iepriekš kopsavilkums skaitīja "rāpotas" un
    # atsevišķi atzīmēja ar OK tikai tās bez svešas kanoniskās - divi dažādi
    # skaitļi par vienu un to pašu rindu izskatījās pēc kļūdas.
    def stavoklis(x):
        if x.get("svesa_kanoniska"):
            return "svesa"
        seg = (x.get("segums") or "").lower()
        if "indeks" in seg and "nav" not in seg:
            return "indekseta"
        return "rapota" if x.get("rapots") else "nezina"

    for x in dati["indekss"]:
        x["stavoklis"] = stavoklis(x)
    skaits = {k: sum(1 for x in dati["indekss"] if x["stavoklis"] == k)
              for k in ("indekseta", "rapota", "nezina", "svesa")}
    svesas = [x for x in dati["indekss"] if x["stavoklis"] == "svesa"]
    rapoti = skaits["indekseta"] + skaits["rapota"]
    dati["kopsavilkums"] = {
        **skaits,
        "no": len(SVARIGAS),
        "viss_kartiba": skaits["indekseta"] == len(SVARIGAS) and dati["sitemap"].get("kludas") == 0,
    }

    if "--json" in sys.argv:
        print(json.dumps(dati, ensure_ascii=False, indent=2))
        return 0

    sm = dati["sitemap"]
    print(f"Sitemap: {sm.get('adreses')} adreses, {sm.get('kludas')} kļūdas, "
          f"lejupielādēts {sm.get('lejupieladets')}")
    v = dati["veiktspeja"]
    print(f"Pēdējās {v['dienas']} dienas: {v['klikski']:.0f} klikšķi, {v['paradisanas']:.0f} parādīšanās")
    print(f"\nNo {len(SVARIGAS)} svarīgajām lapām: {skaits['indekseta']} indeksētas, "
          f"{skaits['rapota']} rāpotas bet vēl ne indeksā, {skaits['nezina']} Google nezina, "
          f"{skaits['svesa']} ar svešu kanonisko")
    ZIME = {"indekseta": "[+]", "rapota": "[~]", "nezina": "[ ]", "svesa": "[!]"}
    for x in dati["indekss"]:
        if x.get("kluda"):
            print(f"  ?   {x['url']:52s} {x['kluda']}")
            continue
        celzs = x["url"].replace("https://gatisdesign.com", "") or "/"
        print(f"  {ZIME[x['stavoklis']]} {celzs:26s} {str(x['segums'])[:44]}")
        if x["stavoklis"] == "svesa":
            print(f"      !! Google kanoniskā joprojām: {x['kanoniska']}")
    if dati["kopsavilkums"]["viss_kartiba"]:
        print("\nViss kārtībā: visas svarīgās lapas rāpotas, sveša kanoniskā nav nevienai.")
    else:
        atlicis = len(SVARIGAS) - skaits["indekseta"]
        print(f"\nVēl nav pabeigts: {atlicis} no {len(SVARIGAS)} nav indeksā.")
        if svesas:
            print("Sākumlapas kanoniskā pārslēgsies pati pēc pārrāpošanas - tas ir gaidīšanas jautājums.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
