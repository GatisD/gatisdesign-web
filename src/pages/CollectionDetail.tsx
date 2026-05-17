import { useEffect, useState, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, ArrowRight, ArrowUpRight, X } from "lucide-react";
import SEO from "@/components/SEO";
import JsonLd, { buildBreadcrumbSchema } from "@/components/JsonLd";
import FadeInOnScroll from "@/components/animations/FadeInOnScroll";
import { findWork, neighbours } from "@/data/portfolio";
import NotFound from "./NotFound";
import PicturePortfolio from "@/components/PicturePortfolio";

export default function CollectionDetail() {
 const { slug = "" } = useParams<{ slug: string }>();
 const work = findWork(slug);
 const nav = neighbours(slug);
 const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);

 const closeLightbox = useCallback(() => setLightboxIdx(null), []);
 const showPrev = useCallback(() => {
 setLightboxIdx((cur) => {
 if (cur === null || !work) return cur;
 return (cur - 1 + work.gallery.length) % work.gallery.length;
 });
 }, [work]);
 const showNext = useCallback(() => {
 setLightboxIdx((cur) => {
 if (cur === null || !work) return cur;
 return (cur + 1) % work.gallery.length;
 });
 }, [work]);

 useEffect(() => {
 if (lightboxIdx === null) return;
 const onKey = (e: KeyboardEvent) => {
 if (e.key === "Escape") closeLightbox();
 else if (e.key === "ArrowLeft") showPrev();
 else if (e.key === "ArrowRight") showNext();
 };
 document.body.style.overflow = "hidden";
 window.addEventListener("keydown", onKey);
 return () => {
 document.body.style.overflow = "";
 window.removeEventListener("keydown", onKey);
 };
 }, [lightboxIdx, closeLightbox, showPrev, showNext]);

 if (!work) return <NotFound />;

 return (
 <>
 <SEO
 title={work.name}
 description={work.caption ?? work.name}
 path={`/portfolio/${work.slug}`}
 ogImage={work.cover}
 />
 <JsonLd
 data={buildBreadcrumbSchema([
 { name: "Sākums", path: "/" },
 { name: "Portfolio", path: "/portfolio" },
 { name: work.name, path: `/portfolio/${work.slug}` },
 ])}
 />

 {/* HERO */}
 <section className="max-w-[1280px] mx-auto px-6 md:px-10 lg:px-16 pt-12 md:pt-16 pb-12 md:pb-16">
 <FadeInOnScroll>
 <Link
 to="/portfolio"
 className="eyebrow text-muted-foreground hover:text-foreground inline-flex items-center gap-2 mb-8 transition-colors"
 >
 <ArrowLeft size={14} aria-hidden="true" />
 Atpakaļ uz portfolio
 </Link>
 <span className="eyebrow orange-dot text-muted-foreground block mb-6">
 {work.category}
 {work.year ? ` · ${work.year}` : ""}
 </span>
 <h1 className="h1-hero text-balance max-w-4xl">{work.name}</h1>
 {work.description && (
 <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mt-8 leading-relaxed">
 {work.description}
 </p>
 )}
 {work.tags && work.tags.length > 0 && (
 <ul className="flex flex-wrap gap-2 mt-8" aria-label="Darba kategorijas">
 {work.tags.map((tag) => (
 <li
 key={tag}
 className="font-mono text-[11px] uppercase tracking-widest px-3 py-1 border border-border rounded-full text-muted-foreground"
 >
 {tag}
 </li>
 ))}
 </ul>
 )}
 </FadeInOnScroll>
 </section>

 {/* GALLERY */}
 <section className="max-w-[1280px] mx-auto px-6 md:px-10 lg:px-16 mb-24 md:mb-32">
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
 {work.gallery.map((src, i) => {
 // Larger feature image every 4 slots for visual rhythm
 const feature = i % 4 === 0;
 return (
 <FadeInOnScroll
 key={src}
 delay={(i % 4) * 0.06}
 className={feature ? "md:col-span-2" : ""}
 >
 <button
 type="button"
 onClick={() => setLightboxIdx(i)}
 className="group block w-full overflow-hidden bg-secondary border border-border focus-visible:outline focus-visible:outline-2 focus-visible:outline-foreground"
 aria-label={`Atvērt attēlu ${i + 1} no ${work.gallery.length}`}
 >
 <PicturePortfolio
 src={src}
 alt={`${work.name} - ${i + 1} no ${work.gallery.length}`}
 className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-[1.02]"
 loading={i < 2 ? "eager" : "lazy"}
 decoding="async"
 />
 </button>
 </FadeInOnScroll>
 );
 })}
 </div>

 <FadeInOnScroll className="mt-12 flex justify-center">
 <p className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
 {work.gallery.length}{" "}
 {work.gallery.length === 1 ? "attēls" : work.gallery.length < 10 ? "attēli" : "attēlu"}
 </p>
 </FadeInOnScroll>
 </section>

 {/* PREV / NEXT */}
 {nav && (
 <section className="max-w-[1280px] mx-auto px-6 md:px-10 lg:px-16 pb-24 md:pb-32 grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10 border-t border-border pt-16">
 <Link to={`/portfolio/${nav.prev.slug}`} className="group block">
 <span className="eyebrow text-muted-foreground inline-flex items-center gap-2">
 <ArrowLeft size={14} aria-hidden="true" />
 Iepriekšējais
 </span>
 <h3 className="font-display text-2xl md:text-3xl font-semibold mt-3 group-hover:text-accent transition-colors">
 {nav.prev.name}
 </h3>
 <span className="text-sm text-muted-foreground mt-1 block">{nav.prev.category}</span>
 </Link>
 <Link
 to={`/portfolio/${nav.next.slug}`}
 className="group block md:text-right md:items-end md:flex md:flex-col"
 >
 <span className="eyebrow text-muted-foreground inline-flex items-center gap-2">
 Nākamais
 <ArrowRight size={14} aria-hidden="true" />
 </span>
 <h3 className="font-display text-2xl md:text-3xl font-semibold mt-3 group-hover:text-accent transition-colors">
 {nav.next.name}
 </h3>
 <span className="text-sm text-muted-foreground mt-1 block">{nav.next.category}</span>
 </Link>
 </section>
 )}

 {/* CTA */}
 <section className="bg-foreground text-background py-20 md:py-28">
 <div className="max-w-[1280px] mx-auto px-6 md:px-10 lg:px-16 text-center">
 <FadeInOnScroll>
 <h2 className="h2-editorial mb-6 text-balance">Patīk redzētais?</h2>
 <p className="text-lg text-background/70 mb-10 max-w-xl mx-auto">
 Sāksim sarunu par Tava zīmola dizainu.
 </p>
 <Link
 to="/kontakti"
 className="inline-flex items-center gap-2 border border-background px-10 py-4 rounded-lg text-base font-medium hover:bg-background hover:text-foreground transition-colors"
 >
 Rakstīt <ArrowUpRight size={16} aria-hidden="true" />
 </Link>
 </FadeInOnScroll>
 </div>
 </section>

 {/* LIGHTBOX */}
 {lightboxIdx !== null && (
 <div
 role="dialog"
 aria-modal="true"
 aria-label={`Attēls ${lightboxIdx + 1} no ${work.gallery.length}`}
 className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
 onClick={closeLightbox}
 >
 <button
 type="button"
 onClick={(e) => {
 e.stopPropagation();
 closeLightbox();
 }}
 className="absolute top-4 right-4 md:top-6 md:right-6 text-white/80 hover:text-white p-2"
 aria-label="Aizvērt"
 >
 <X size={28} />
 </button>
 <button
 type="button"
 onClick={(e) => {
 e.stopPropagation();
 showPrev();
 }}
 className="absolute left-2 md:left-6 top-1/2 -translate-y-1/2 text-white/80 hover:text-white p-3"
 aria-label="Iepriekšējais attēls"
 >
 <ArrowLeft size={28} />
 </button>
 <button
 type="button"
 onClick={(e) => {
 e.stopPropagation();
 showNext();
 }}
 className="absolute right-2 md:right-6 top-1/2 -translate-y-1/2 text-white/80 hover:text-white p-3"
 aria-label="Nākamais attēls"
 >
 <ArrowRight size={28} />
 </button>
 <PicturePortfolio
 src={work.gallery[lightboxIdx]}
 alt={`${work.name} - ${lightboxIdx + 1} no ${work.gallery.length}`}
 className="max-w-[92vw] max-h-[88vh] object-contain"
 onClick={(e) => e.stopPropagation()}
 />
 <span className="absolute bottom-6 left-1/2 -translate-x-1/2 font-mono text-[11px] uppercase tracking-widest text-white/60">
 {lightboxIdx + 1} / {work.gallery.length}
 </span>
 </div>
 )}
 </>
 );
}
