import { Link } from "react-router-dom";
import SEO from "@/components/SEO";
import { useLocale } from "@/i18n/LocaleContext";

export default function NotFound() {
  const { locale, t, path } = useLocale();
  return (
    <>
      <SEO locale={locale} noindex title={t.notFound.title} description={t.notFound.body} />
      <div className="max-w-[1280px] mx-auto px-6 md:px-10 lg:px-16 py-24 md:py-32 text-center">
        <h1>{t.notFound.title}</h1>
        <p>{t.notFound.body}</p>
        <Link to={path("home")}>{t.notFound.cta}</Link>
      </div>
    </>
  );
}
