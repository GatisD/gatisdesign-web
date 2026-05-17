import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const STORAGE_KEY = "cookie_consent_v1";

type Consent = "all" | "necessary" | null;

declare global {
 interface Window {
 gtag?: (...args: unknown[]) => void;
 }
}

export default function CookieBanner() {
 const [consent, setConsent] = useState<Consent>(null);
 const [mounted, setMounted] = useState(false);

 useEffect(() => {
 setMounted(true);
 const stored = localStorage.getItem(STORAGE_KEY);
 if (stored === "all" || stored === "necessary") {
 setConsent(stored as Consent);
 applyConsent(stored as Consent);
 }
 }, []);

 function applyConsent(c: Consent) {
 if (c === "all" && typeof window !== "undefined" && window.gtag) {
 window.gtag("consent", "update", {
 ad_storage: "granted",
 ad_user_data: "granted",
 ad_personalization: "granted",
 analytics_storage: "granted",
 });
 }
 }

 function handleAccept() {
 localStorage.setItem(STORAGE_KEY, "all");
 setConsent("all");
 applyConsent("all");
 }

 function handleReject() {
 localStorage.setItem(STORAGE_KEY, "necessary");
 setConsent("necessary");
 }

 if (!mounted || consent !== null) return null;

 return (
 <div
 role="dialog"
 aria-label="Sīkdatņu paziņojums"
 className="fixed bottom-0 inset-x-0 z-[200] bg-background/95 backdrop-blur border-t border-border p-4 md:p-6 shadow-lg"
 >
 <div className="max-w-4xl mx-auto flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
 <p className="text-sm text-muted-foreground leading-relaxed">
 Šajā mājaslapā izmantojam sīkdatnes darbības nodrošināšanai un anonīmai analīzei. Plašāk -{" "}
 <Link to="/privatuma-politika" className="text-accent underline underline-offset-2">
 privātuma politikā
 </Link>
 .
 </p>
 <div className="flex gap-2 flex-shrink-0 w-full md:w-auto">
 <button
 type="button"
 onClick={handleReject}
 className="flex-1 md:flex-initial px-4 py-2 text-sm border border-border rounded-lg hover:bg-secondary transition-colors"
 >
 Tikai nepieciešamās
 </button>
 <button
 type="button"
 onClick={handleAccept}
 className="flex-1 md:flex-initial px-4 py-2 text-sm bg-foreground text-background rounded-lg hover:opacity-90 transition-opacity font-medium"
 >
 Pieņemt visas
 </button>
 </div>
 </div>
 </div>
 );
}
