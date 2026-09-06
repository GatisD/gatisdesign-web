import ServicePage from "@/components/content/ServicePage";
import type { ServiceContent } from "@/content";
import content from "@/content/lv/zimola-identitate.json";

/**
 * Saturs tiek ievilkts šeit, ne ServicePage komponentē: tā katrs maršruta
 * gabals nes tikai savu tekstu, nevis visu četru lapu JSON.
 */
export default function ZimolaIdentitate() {
  return <ServicePage routeKey="services.brand" content={content as ServiceContent} />;
}
