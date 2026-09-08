import Pakalpojumi, { type PakalpojumiContent } from "./Pakalpojumi";
import content from "@/content/en/pakalpojumi.json";

export default function PakalpojumiEn() {
  return <Pakalpojumi content={content as PakalpojumiContent} />;
}
