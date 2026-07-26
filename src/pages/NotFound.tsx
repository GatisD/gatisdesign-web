import { Link } from "react-router-dom";
import { useLocale } from "@/i18n/LocaleContext";

export default function NotFound() {
  const { t, path } = useLocale();
  return (
    <main id="saturs">
      <h1>{t.notFound.title}</h1>
      <p>{t.notFound.body}</p>
      <Link to={path("home")}>{t.notFound.cta}</Link>
    </main>
  );
}
