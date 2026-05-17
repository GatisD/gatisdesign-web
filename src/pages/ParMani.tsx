import { Link } from "react-router-dom";
import { Brush, Building2, Star, Languages, Sparkles, Layers, MonitorSmartphone, PenTool, Printer, ArrowUpRight } from "lucide-react";
import SEO from "@/components/SEO";
import JsonLd, { buildBreadcrumbSchema, personSchema } from "@/components/JsonLd";
import FadeInOnScroll from "@/components/animations/FadeInOnScroll";
import MagneticButton from "@/components/animations/MagneticButton";
import { CONTACT_EMAIL } from "@/lib/site";

const milestones = [
 { year: "2008", icon: Brush, title: "Sākums", text: "Pirmie grafiskā dizaina soļi un aizraušanās ar vizuālo komunikāciju." },
 { year: "2013", icon: Building2, title: "Aģentūras", text: "Darbs vadošajās Baltijas reklāmas aģentūrās, slīpējot meistarību." },
 { year: "2018", icon: Star, title: "Freelance", text: "Pāreja uz neatkarīgu darbību un starptautiskiem klientiem." },
 { year: "2021", icon: Languages, title: "Globālais tirgus", text: "Vairāk nekā 100 zīmolu portfolio, klienti dažādās valstīs." },
 { year: "2024+", icon: Sparkles, title: "Nākotne", text: "Inovācijas identitātes sistēmās un AI integrācija dizainā.", active: true },
];

const skills = [
 { icon: Layers, title: "Logo & Identity", text: "Visaptverošu zīmola vadlīniju un unikālu logotipu izstrāde, kas definē tavu tēlu." },
 { icon: MonitorSmartphone, title: "Web Design", text: "Augstas konversijas UX/UI risinājumi, kas nodrošina nevainojamu digitālo pieredzi." },
 { icon: PenTool, title: "Illustrations", text: "Pielāgotas ilustrācijas un ikonu komplekti, kas piešķir personību produktam." },
 { icon: Printer, title: "Print Design", text: "Viss no vizītkartēm līdz liela mēroga vides reklāmām un iepakojuma dizainam." },
];

const process = [
 { num: "01", title: "Izpēte", text: "Analizēju jūsu tirgu, konkurentus un mērķauditoriju, lai atrastu unikālu nišu." },
 { num: "02", title: "Koncepts", text: "Radu vairākus vizuālos virzienus, balstoties uz stratēģiskajiem secinājumiem." },
 { num: "03", title: "Izstrāde", text: "Detalizēti noslīpēju izvēlēto konceptu līdz katram pikselim un līnijai." },
 { num: "04", title: "Nodošana", text: "Sagatavoju visus nepieciešamos failus un zīmola lietošanas vadlīnijas." },
];

export default function ParMani() {
 return (
 <>
 <SEO
 title="Par mani"
 description="Gatis Daugavietis - neatkarīgs brand un web dizainers ar 18 gadu pieredzi. Mans ceļš, ekspertīze un darba process."
 path="/par-mani"
 />
 <JsonLd
 data={[
 personSchema,
 buildBreadcrumbSchema([
 { name: "Sākums", path: "/" },
 { name: "Par mani", path: "/par-mani" },
 ]),
 ]}
 />

 {/* Header */}
 <section className="max-w-[1280px] mx-auto px-6 md:px-10 lg:px-16 pt-12 pb-20 md:pt-16 md:pb-32">
 <FadeInOnScroll>
 <span className="eyebrow orange-dot text-muted-foreground block mb-6">PAR MANI</span>
 <h1 className="h1-hero text-balance max-w-4xl">Gatis Daugavietis</h1>
 <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mt-8 leading-relaxed">
 Neatkarīgs brand un web dizainers ar 18 gadu pieredzi. Bāzēts Rīgā, strādāju ar
 zīmoliem Latvijā un ārpus tās.
 </p>
 </FadeInOnScroll>
 </section>

 {/* Stāsts */}
 <section className="max-w-[1280px] mx-auto px-6 md:px-10 lg:px-16 py-20 md:py-32 border-t border-border">
 <div className="flex flex-col lg:flex-row gap-10">
 <div className="lg:w-1/3">
 <h2 className="lg:sticky lg:top-32 font-mono text-sm tracking-widest text-accent uppercase">
 STĀSTS
 </h2>
 </div>
 <div className="lg:w-2/3 space-y-8 md:space-y-12">
 <FadeInOnScroll>
 <p className="font-display text-2xl md:text-[28px] lg:text-[32px] leading-snug font-medium text-foreground">
 Strādāju ar zīmoliem, lai radītu jēgpilnu dizainu. Katrs projekts ir unikāls stāsts,
 ko veidojam kopā. Mans mērķis - pārvērst tavu vīziju vizuālā valodā, kas uzrunā
 auditoriju un veicina izaugsmi.
 </p>
 </FadeInOnScroll>
 <FadeInOnScroll delay={0.1}>
 <p className="font-display text-2xl md:text-[28px] lg:text-[32px] leading-snug font-medium text-muted-foreground">
 Ar vairāk nekā 18 gadu pieredzi esmu palīdzējis 100+ zīmoliem atrast savu identitāti
 digitālajā un fiziskajā pasaulē.
 </p>
 </FadeInOnScroll>
 <FadeInOnScroll delay={0.2}>
 <p className="font-display text-2xl md:text-[28px] lg:text-[32px] leading-snug font-medium text-muted-foreground">
 Mana pieeja - stratēģiska un estētiska simbioze. Es ne tikai zīmēju logo, es radu
 sistēmu, kas elpo un aug kopā ar biznesu.
 </p>
 </FadeInOnScroll>
 </div>
 </div>
 </section>

 {/* Timeline */}
 <section className="max-w-[1280px] mx-auto px-6 md:px-10 lg:px-16 py-20 md:py-32">
 <FadeInOnScroll>
 <span className="eyebrow text-muted-foreground block mb-4">CEĻŠ</span>
 <h2 className="h2-editorial mb-12 md:mb-20">18 gadi pieredzes</h2>
 </FadeInOnScroll>
 <div className="grid grid-cols-1 md:grid-cols-5 border-t border-l md:border-l-0 border-border">
 {milestones.map((m, i) => {
 const Icon = m.icon;
 return (
 <FadeInOnScroll
 key={m.year}
 delay={i * 0.08}
 className={`p-6 md:p-8 border-b md:border-b-0 ${i < milestones.length - 1 ? "md:border-r" : ""} border-border relative`}
 >
 <span
 className={`font-mono text-xs ${m.active ? "text-accent font-bold" : "text-muted-foreground"} mb-6 block`}
 >
 {m.year}
 </span>
 <Icon
 size={28}
 className={m.active ? "text-accent mb-4" : "text-muted-foreground/60 mb-4"}
 aria-hidden="true"
 />
 <h3
 className={`font-display text-2xl font-bold mb-3 ${m.active ? "text-accent" : ""}`}
 >
 {m.title}
 </h3>
 <p className="text-muted-foreground text-sm leading-relaxed">{m.text}</p>
 </FadeInOnScroll>
 );
 })}
 </div>
 </section>

 {/* Skills */}
 <section className="max-w-[1280px] mx-auto px-6 md:px-10 lg:px-16 py-20 md:py-32">
 <FadeInOnScroll>
 <span className="eyebrow text-muted-foreground block mb-4">EKSPERTĪZE</span>
 <h2 className="h2-editorial mb-12 md:mb-20">Ko darīšu tev</h2>
 </FadeInOnScroll>
 <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-border border border-border">
 {skills.map((s, i) => {
 const Icon = s.icon;
 return (
 <FadeInOnScroll
 key={s.title}
 delay={i * 0.08}
 className="aspect-square bg-background p-8 md:p-12 flex flex-col justify-between group"
 >
 <Icon size={36} aria-hidden="true" className="text-foreground" />
 <div>
 <h3 className="font-display text-2xl md:text-3xl font-bold mb-3 relative inline-block">
 {s.title}
 <span className="absolute -bottom-1 left-0 w-0 h-1 bg-accent transition-all duration-300 group-hover:w-full" />
 </h3>
 <p className="text-muted-foreground leading-relaxed">{s.text}</p>
 </div>
 </FadeInOnScroll>
 );
 })}
 </div>
 </section>

 {/* Process */}
 <section className="max-w-[1280px] mx-auto px-6 md:px-10 lg:px-16 py-20 md:py-32">
 <FadeInOnScroll>
 <span className="eyebrow text-muted-foreground block mb-4">PROCESS</span>
 <h2 className="h2-editorial mb-12 md:mb-20">Kā strādāju</h2>
 </FadeInOnScroll>
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 md:gap-12">
 {process.map((p, i) => (
 <FadeInOnScroll key={p.num} delay={i * 0.08} className="space-y-4">
 <span className="font-display font-black text-6xl md:text-7xl lg:text-[96px] leading-none text-accent">
 {p.num}
 </span>
 <h3 className="font-display text-xl md:text-2xl font-bold">{p.title}</h3>
 <p className="text-muted-foreground leading-relaxed">{p.text}</p>
 </FadeInOnScroll>
 ))}
 </div>
 </section>

 {/* CTA */}
 <section className="bg-foreground text-background py-24 md:py-40">
 <div className="max-w-[1280px] mx-auto px-6 md:px-10 lg:px-16 text-center space-y-8">
 <FadeInOnScroll>
 <Link to="/kontakti" className="group block">
 <h2 className="font-display font-black text-4xl md:text-6xl lg:text-7xl tracking-tighter transition-all duration-500 group-hover:text-accent">
 Strādāsim kopā{" "}
 <span className="inline-block transform group-hover:translate-x-3 transition-transform text-accent">
 →
 </span>
 </h2>
 </Link>
 <div className="flex flex-col items-center gap-3 pt-4">
 <p className="font-mono text-xs tracking-widest text-background/60 uppercase">
 SAZINIES AR MANI
 </p>
 <a
 href={`mailto:${CONTACT_EMAIL}`}
 className="font-display text-xl md:text-2xl lg:text-3xl border-b-2 border-accent pb-1 hover:text-accent transition-colors"
 >
 {CONTACT_EMAIL}
 </a>
 </div>
 <div className="pt-6">
 <Link to="/portfolio">
 <MagneticButton
 className="border border-background text-background px-8 md:px-10 py-4 rounded-lg text-base font-medium hover:bg-background hover:text-foreground transition-all inline-flex items-center"
 aria-label="Apskatīt portfolio"
 >
 Apskatīt darbus
 <ArrowUpRight size={16} className="ml-2" />
 </MagneticButton>
 </Link>
 </div>
 </FadeInOnScroll>
 </div>
 </section>
 </>
 );
}
