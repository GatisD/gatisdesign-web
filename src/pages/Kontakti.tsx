import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link } from "react-router-dom";
import { ArrowRight, Plus, Minus } from "lucide-react";
import { toast } from "sonner";
import SEO from "@/components/SEO";
import JsonLd, { buildBreadcrumbSchema, faqSchema, personSchema } from "@/components/JsonLd";
import FadeInOnScroll from "@/components/animations/FadeInOnScroll";
import { CONTACT_EMAIL, SOCIAL } from "@/lib/site";

const contactSchema = z.object({
  name: z.string().min(2, "Ievadi vārdu"),
  email: z.string().email("Ievadi derīgu e-pastu"),
  projectType: z.string().min(1, "Izvēlies projekta veidu"),
  message: z.string().min(10, "Apraksti projektu vismaz 10 simbolos"),
  consent: z.boolean().refine((v) => v === true, {
    message: "Jāpiekrīt datu apstrādei",
  }),
});

type ContactValues = z.infer<typeof contactSchema>;

const faqItems = [
  {
    q: "Cik maksā logo dizains?",
    a: "Katrs projekts ir unikāls. Pamata vizuālās identitātes paketes sākas no klienta budžeta un projekta apjoma — sīkāku tāmi sagatavoju pēc pirmās sarunas.",
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
  const [submitted, setSubmitted] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<ContactValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: { consent: false },
  });

  async function onSubmit(values: ContactValues) {
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      if (!res.ok) throw new Error("Send failed");
      const data = (await res.json().catch(() => ({}))) as { ok?: boolean };
      if (data.ok === false) throw new Error("Send failed");
      toast.success("Paldies! Sazināsimies 24h laikā.");
      setSubmitted(true);
      reset();
      // GTM event (no-op kamēr GTM nav uzstādīts)
      if (typeof window !== "undefined" && window.dataLayer) {
        window.dataLayer.push({
          event: "generate_lead",
          form_name: "contact",
        });
      }
    } catch {
      // Graceful fallback — RESEND_API_KEY vēl nav, parādam mailto fallback
      toast.message("Forma vēl nav savienota — uzraksti tieši uz e-pastu", {
        description: CONTACT_EMAIL,
        action: {
          label: "Atvērt e-pastu",
          onClick: () =>
            window.location.assign(
              `mailto:${CONTACT_EMAIL}?subject=Projekta pieprasījums no ${values.name}&body=${encodeURIComponent(values.message)}`,
            ),
        },
      });
    }
  }

  return (
    <>
      <SEO
        title="Kontakti"
        description="Pastāsti par savu projektu. Atbildu 24h laikā. Bāzēts Rīgā, pieejams projektiem visā pasaulē."
        path="/kontakti"
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
              Atbildu 24h laikā. Bez liekām formām un standartiem — vienkārši pasaki, ko vajag.
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
                PROJEKTA PIEPRASĪJUMS
              </span>
              <h2 className="font-display text-2xl md:text-3xl font-semibold mb-10 md:mb-12">
                Aizpildi formu
              </h2>

              {submitted ? (
                <div className="border border-border rounded-lg p-8 text-center">
                  <p className="font-display text-xl md:text-2xl text-foreground mb-4">
                    Paldies! Pieprasījums saņemts.
                  </p>
                  <p className="text-muted-foreground">
                    Atbildēšu pēc iespējas ātrāk — parasti 24h laikā.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-10" noValidate>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <div className="flex flex-col space-y-2">
                      <label
                        htmlFor="name"
                        className="font-mono text-[10px] tracking-widest text-muted-foreground uppercase"
                      >
                        Vārds, Uzvārds
                      </label>
                      <input
                        id="name"
                        type="text"
                        placeholder="Jānis Bērziņš"
                        className="input-underline"
                        autoComplete="name"
                        {...register("name")}
                      />
                      {errors.name && (
                        <span className="text-xs text-destructive">{errors.name.message}</span>
                      )}
                    </div>
                    <div className="flex flex-col space-y-2">
                      <label
                        htmlFor="email"
                        className="font-mono text-[10px] tracking-widest text-muted-foreground uppercase"
                      >
                        E-pasts
                      </label>
                      <input
                        id="email"
                        type="email"
                        placeholder="janis@uznemums.lv"
                        className="input-underline"
                        autoComplete="email"
                        {...register("email")}
                      />
                      {errors.email && (
                        <span className="text-xs text-destructive">{errors.email.message}</span>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col space-y-2">
                    <label
                      htmlFor="projectType"
                      className="font-mono text-[10px] tracking-widest text-muted-foreground uppercase"
                    >
                      Projekta veids
                    </label>
                    <select
                      id="projectType"
                      className="input-underline appearance-none cursor-pointer"
                      defaultValue=""
                      {...register("projectType")}
                    >
                      <option value="" disabled>
                        Izvēlies...
                      </option>
                      <option value="brand-identity">Zīmola identitāte</option>
                      <option value="web-design">Web dizains</option>
                      <option value="logo">Logo izstrāde</option>
                      <option value="print">Drukas dizains / iepakojums</option>
                      <option value="illustration">Ilustrācijas</option>
                      <option value="other">Cits</option>
                    </select>
                    {errors.projectType && (
                      <span className="text-xs text-destructive">
                        {errors.projectType.message}
                      </span>
                    )}
                  </div>

                  <div className="flex flex-col space-y-2">
                    <label
                      htmlFor="message"
                      className="font-mono text-[10px] tracking-widest text-muted-foreground uppercase"
                    >
                      Projekta apraksts
                    </label>
                    <textarea
                      id="message"
                      rows={4}
                      placeholder="Pastāsti par vēlmēm, mērķiem un termiņiem..."
                      className="input-underline resize-none"
                      {...register("message")}
                    />
                    {errors.message && (
                      <span className="text-xs text-destructive">{errors.message.message}</span>
                    )}
                  </div>

                  <div className="flex items-start space-x-3 group cursor-pointer">
                    <input
                      id="consent"
                      type="checkbox"
                      className="w-4 h-4 mt-1 rounded-sm border-border text-foreground focus:ring-accent"
                      {...register("consent")}
                    />
                    <label
                      htmlFor="consent"
                      className="text-xs text-muted-foreground leading-relaxed cursor-pointer group-hover:text-foreground transition-colors"
                    >
                      Piekrītu personas datu apstrādei saskaņā ar{" "}
                      <Link
                        to="/privatuma-politika"
                        className="text-accent underline underline-offset-2"
                      >
                        privātuma politiku
                      </Link>
                      .
                    </label>
                  </div>
                  {errors.consent && (
                    <span className="text-xs text-destructive block">{errors.consent.message}</span>
                  )}

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-foreground text-background py-5 px-8 font-display font-semibold text-lg flex justify-between items-center group hover:bg-accent hover:text-accent-foreground transition-all duration-500 rounded-lg disabled:opacity-60"
                  >
                    <span>{isSubmitting ? "Sūta..." : "Sūtīt pieprasījumu"}</span>
                    <ArrowRight
                      size={20}
                      className="transition-transform duration-300 group-hover:translate-x-2"
                    />
                  </button>

                  <p className="text-[11px] text-muted-foreground leading-relaxed pt-4">
                    Forma aizsargāta ar reCAPTCHA v3 (kad būs aktivizēts) — sk. Google{" "}
                    <a
                      href="https://policies.google.com/privacy"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline"
                    >
                      Privacy Policy
                    </a>{" "}
                    un{" "}
                    <a
                      href="https://policies.google.com/terms"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline"
                    >
                      Terms of Service
                    </a>
                    .
                  </p>
                </form>
              )}
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

declare global {
  interface Window {
    dataLayer?: Array<Record<string, unknown>>;
  }
}
