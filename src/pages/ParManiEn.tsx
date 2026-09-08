import ParMani from "./ParMani";
import { buildHome, factsFrom } from "@/content/home";
import type { ServiceContent } from "@/content";
import type { PageContent } from "@/content/types";
import content from "@/content/en/par-mani.json";
import homeJson from "@/content/en/home.json";

/** Skaitļu josla nāk no EN sākumlapas satura - tas pats avots, kas LV. */
const stats = factsFrom(buildHome(homeJson as ServiceContent).statItems);

export default function ParManiEn() {
  return <ParMani content={content as PageContent} stats={stats} />;
}
