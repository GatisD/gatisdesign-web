import { useState } from "react";
import { ArrowRight, Plus, Minus } from "lucide-react";
import SEO from "@/components/SEO";
import JsonLd, { buildBreadcrumbSchema, faqSchema, personSchema } from "@/components/JsonLd";
import FadeInOnScroll from "@/components/animations/FadeInOnScroll";
import ContactForm from "@/components/ContactForm";
import { CONTACT_EMAIL, SOCIAL } from "@/lib/site";
import { useLocale } from "@/i18n/LocaleContext";

const faqItems = [
 {
 q: "Cik maksā logo dizains?",
 a: "Katrs projekts ir unikāls. Pamata vizuālās identitātes paketes sākas no klienta budžeta un projekta apjoma - sīkāku tāmi sagatavoju pēc pirmās sarunas.",
 },
 {
 q: "Cik ilgs ir tipisks projekta process?",
 a: "Brand identity projekts vidēji aizņem 4-6 nedēļas, web dizains 6-8 nedēļas. Termiņus precizējam, kad sākam strādāt.",
 },
 {
 q: "Vai strādāju ar starptautiskiem klientiem?",
 a: "Jā. Bāzēts Rīgā, Latvijā, bet pieejams projektiem visā pasaulē. Komunikācija notiek latviski vai angliski.",
 },
 {
 q: "Kādus failus saņemšu pēc projekta?",
 a: "Logo projektos: SVG, PNG, PDF visās variācijās plus brand guidelines PDF. Web projektos: Figma fails un izstrādāta mājaslapa.",
 },
 {
 q: "Vai projekta laikā var iterēt?",
 a: "Jā. Mans process ietver 2-3 koncepta variantus un iteratīvu noslīpēšanu, balstoties uz tavu atgriezenisko saiti.",
 },
];

export default function Kontakti() {
 const { locale, t } = useLocale();
 const [openFaq, setOpenFaq] = useState<number | null>(0);

 return (
 <>
 <SEO
 routeKey="contact"
 locale={locale}
 title={locale === "lv" ? "Kontakti" : "Contact"}
 description={
 locale === "lv"
 ? "Pastāsti par savu projektu. Atbildu 24h laikā. Bāzēts Rīgā, pieejams projektiem visā pasaulē."
 : "Tell me about your project. I reply within 24h. Based in Riga, available for projects worldwide."
 }
 />
 <JsonLd
 data={[
 personSchema,
 faqSchema,
 buildBreadcrumbSchema([
 { name: "Sākums", path: "/" },
 { name: "Kontakti", path: "/kontakti" },
 ]),
 ]}
 />

 {/* Header */}
 <section className="max-w-[1280px] mx-auto px-6 md:px-10 lg:px-16 pt-12 pb-16 md:pt-16 md:pb-24 grid grid-cols-1 md:grid-cols-12 gap-8">
 <div className="md:col-span-9">
 <FadeInOnScroll>
 <span className="eyebrow orange-dot text-muted-foreground block mb-6">KONTAKTI</span>
 <h1 className="h1-hero text-balance">Pastāsti par savu projektu</h1>
 <p className="text-muted-foreground text-lg max-w-xl leading-relaxed mt-8">
 Atbildu 24h laikā. Bez liekām formām un standartiem - vienkārši pasaki, ko vajag.
 </p>
 </FadeInOnScroll>
 </div>
 </section>

 {/* 2-COL: Form + Direct */}
 <section className="max-w-[1280px] mx-auto px-6 md:px-10 lg:px-16 py-16 md:py-24 border-t border-border">
 <div className="flex flex-col md:flex-row gap-16 md:gap-24">
 {/* LEFT: Form */}
 <div className="w-full md:w-[60%]">
 <FadeInOnScroll>
 <span className="eyebrow orange-dot text-muted-foreground block mb-4">
 {t.form.kicker}
 </span>
 <h2 className="font-display text-2xl md:text-3xl font-semibold mb-4">
 {t.form.title}
 </h2>
 <p className="text-muted-foreground mb-8 md:mb-10 max-w-xl leading-relaxed">
 {t.form.lede}
 </p>

 <ContactForm />
 </FadeInOnScroll>
 </div>

 {/* RIGHT: Direct Contact Info */}
 <aside className="w-full md:w-[40%]">
 <div className="md:sticky md:top-32 space-y-12">
 <FadeInOnScroll>
 <span className="eyebrow text-muted-foreground block mb-4">TIEŠI</span>
 <h2 className="font-display text-2xl md:text-3xl font-semibold mb-6">
 Vai raksti tieši
 </h2>
 <a
 href={`mailto:${CONTACT_EMAIL}`}
 className="font-display text-xl md:text-2xl font-semibold hover-underline inline-block mb-4"
 >
 {CONTACT_EMAIL}
 </a>
 <div className="flex items-center space-x-3 mt-4">
 <span
 className="w-2.5 h-2.5 bg-green-500 rounded-full"
 aria-hidden="true"
 />
 <span className="eyebrow text-muted-foreground">ATBILDU 24H LAIKĀ</span>
 </div>
 </FadeInOnScroll>

 <FadeInOnScroll delay={0.1}>
 <span className="eyebrow text-muted-foreground block mb-6">SOCIĀLIE TĪKLI</span>
 <nav className="flex flex-col" aria-label="Sociālo tīklu saites">
 {[
 { name: "Dribbble", href: SOCIAL.dribbble },
 { name: "Instagram", href: SOCIAL.instagram },
 { name: "LinkedIn", href: SOCIAL.linkedin },
 { name: "Facebook", href: SOCIAL.facebook },
 ].map((s) => (
 <a
 key={s.name}
 href={s.href}
 target="_blank"
 rel="noopener noreferrer"
 className="flex justify-between items-center border-b border-border py-3 group"
 >
 <span className="font-display hover-underline">{s.name}</span>
 <ArrowRight
 size={14}
 className="rotate-[-45deg] text-muted-foreground group-hover:text-accent transition-colors"
 aria-hidden="true"
 />
 </a>
 ))}
 </nav>
 </FadeInOnScroll>

 <FadeInOnScroll delay={0.2} className="pt-8 border-t border-border">
 <p className="text-muted-foreground text-xs font-mono uppercase tracking-widest leading-loose">
 Bāzēts Rīgā, Latvijā.
 <br />
 Pieejams projektiem visā pasaulē.
 </p>
 </FadeInOnScroll>
 </div>
 </aside>
 </div>
 </section>

 {/* FAQ */}
 <section className="bg-surface py-20 md:py-32 border-t border-border">
 <div className="max-w-[1280px] mx-auto px-6 md:px-10 lg:px-16">
 <FadeInOnScroll>
 <span className="eyebrow text-muted-foreground block mb-6">FAQ</span>
 <h2 className="h2-editorial mb-12 md:mb-20 max-w-2xl">Bieži uzdoti jautājumi</h2>
 </FadeInOnScroll>
 <div className="space-y-6 max-w-3xl">
 {faqItems.map((item, i) => {
 const open = openFaq === i;
 return (
 <FadeInOnScroll key={item.q} delay={i * 0.05} className="border-b border-border pb-6">
 <button
 type="button"
 className="w-full flex justify-between items-center text-left group gap-4"
 onClick={() => setOpenFaq(open ? null : i)}
 aria-expanded={open}
 >
 <h3 className="font-display text-lg md:text-xl font-semibold pr-4">
 {item.q}
 </h3>
 {open ? (
 <Minus size={20} className="text-accent flex-shrink-0" aria-hidden="true" />
 ) : (
 <Plus
 size={20}
 className="text-foreground group-hover:text-accent transition-colors flex-shrink-0"
 aria-hidden="true"
 />
 )}
 </button>
 {open && (
 <p className="mt-5 text-muted-foreground leading-relaxed">{item.a}</p>
 )}
 </FadeInOnScroll>
 );
 })}
 </div>
 </div>
 </section>

 {/* CTA */}
 <section className="bg-foreground py-20 md:py-32">
 <div className="max-w-[1280px] mx-auto px-6 md:px-10 lg:px-16 flex flex-col md:flex-row justify-between items-center gap-8 text-center md:text-left">
 <h3 className="font-display text-2xl md:text-3xl lg:text-4xl font-semibold text-background">
 Vēl nav skaidrs? Uzraksti.
 </h3>
 <a
 href={`mailto:${CONTACT_EMAIL}`}
 className="font-display text-2xl md:text-3xl lg:text-4xl font-semibold text-accent hover:opacity-80 transition-opacity"
 >
 {CONTACT_EMAIL}
 </a>
 </div>
 </section>
 </>
 );
}

// Window.dataLayer ir deklarēts src/vite-env.d.ts (viens avots, lai izvairītos no konfliktējošām deklarācijām)
