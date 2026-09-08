import Index from "./Index";
import { buildHome } from "@/content/home";
import type { ServiceContent } from "@/content";
import homeJson from "@/content/en/home.json";

/** EN sākumlapa: tas pats Index ar EN saturu. Savs gabals, lai LV pakotnē nav EN teksta. */
const home = buildHome(homeJson as ServiceContent);

export default function IndexEn() {
  return <Index home={home} />;
}
