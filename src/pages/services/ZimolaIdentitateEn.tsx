import ServicePage from "@/components/content/ServicePage";
import type { ServiceContent } from "@/content";
import content from "@/content/en/zimola-identitate.json";

/** EN lapa: tas pats ServicePage ar EN saturu savā gabalā. */
export default function ZimolaIdentitateEn() {
  return <ServicePage routeKey="services.brand" content={content as ServiceContent} />;
}
