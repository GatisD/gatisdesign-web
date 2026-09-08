import ServicePage from "@/components/content/ServicePage";
import type { ServiceContent } from "@/content";
import content from "@/content/en/ai-agenti.json";

/** EN lapa: tas pats ServicePage ar EN saturu savā gabalā. */
export default function AiAgentiEn() {
  return <ServicePage routeKey="services.ai" content={content as ServiceContent} />;
}
