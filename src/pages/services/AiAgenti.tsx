import ServicePage from "@/components/content/ServicePage";
import type { ServiceContent } from "@/content";
import content from "@/content/lv/ai-agenti.json";

/**
 * Saturs tiek ievilkts šeit, ne ServicePage komponentē: tā katrs maršruta
 * gabals nes tikai savu tekstu, nevis visu četru lapu JSON.
 */
export default function AiAgenti() {
  return <ServicePage routeKey="services.ai" content={content as ServiceContent} />;
}
