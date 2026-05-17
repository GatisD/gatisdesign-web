import { Link } from "react-router-dom";
import SEO from "@/components/SEO";

export default function NotFound() {
 return (
 <>
 <SEO title="404 - Lapa nav atrasta" description="Lapa nav atrasta." path="/404" />
 <section className="max-w-[1280px] mx-auto px-6 md:px-10 lg:px-16 py-32 md:py-40 text-center">
 <span className="eyebrow text-muted-foreground block mb-6">404</span>
 <h1 className="h1-hero mb-8">Šādas lapas nav</h1>
 <p className="text-lg text-muted-foreground max-w-xl mx-auto mb-12">
 Iespējams, ka pārvietoju kaut ko vai saite ir vecāka. Atgriezies sākumā vai apskaties
 portfolio.
 </p>
 <div className="flex flex-wrap justify-center gap-3">
 <Link
 to="/"
 className="bg-foreground text-background px-8 py-4 rounded-lg font-medium hover:opacity-90 transition-opacity"
 >
 Uz sākumu
 </Link>
 <Link
 to="/portfolio"
 className="border border-foreground text-foreground px-8 py-4 rounded-lg font-medium hover:bg-foreground hover:text-background transition-all"
 >
 Apskatīt darbus
 </Link>
 </div>
 </section>
 </>
 );
}
