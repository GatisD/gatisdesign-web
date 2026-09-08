import ServicePage from "@/components/content/ServicePage";
import type { ServiceContent } from "@/content";
import content from "@/content/en/majaslapu-izstrade.json";

/** EN lapa: tas pats ServicePage ar EN saturu savā gabalā. */
export default function MajaslapuIzstradeEn() {
  return <ServicePage routeKey="services.web" content={content as ServiceContent} />;
}
