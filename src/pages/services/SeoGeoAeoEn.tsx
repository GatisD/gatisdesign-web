import ServicePage from "@/components/content/ServicePage";
import type { ServiceContent } from "@/content";
import content from "@/content/en/seo-geo-aeo.json";

/** EN lapa: tas pats ServicePage ar EN saturu savā gabalā. */
export default function SeoGeoAeoEn() {
  return <ServicePage routeKey="services.seo" content={content as ServiceContent} />;
}
