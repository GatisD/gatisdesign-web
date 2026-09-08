import Kontakti from "./Kontakti";
import type { PageContent } from "@/content/types";
import content from "@/content/en/kontakti.json";

export default function KontaktiEn() {
  return <Kontakti content={content as PageContent} />;
}
