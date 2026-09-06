import ServicePage from "@/components/content/ServicePage";
import type { ServiceContent } from "@/content";
import content from "@/content/lv/majaslapu-izstrade.json";

/**
 * Saturs tiek ievilkts šeit, ne ServicePage komponentē: tā katrs maršruta
 * gabals nes tikai savu tekstu, nevis visu četru lapu JSON.
 */
export default function MajaslapuIzstrade() {
  return <ServicePage routeKey="services.web" content={content as ServiceContent} />;
}
