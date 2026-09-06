import ServicePage from "@/components/content/ServicePage";
import type { ServiceContent } from "@/content";
import content from "@/content/lv/seo-geo-aeo.json";

/**
 * Saturs tiek ievilkts šeit, ne ServicePage komponentē: tā katrs maršruta
 * gabals nes tikai savu tekstu, nevis visu četru lapu JSON.
 */
export default function SeoGeoAeo() {
  return <ServicePage routeKey="services.seo" content={content as ServiceContent} />;
}
