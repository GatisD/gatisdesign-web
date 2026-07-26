import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const DIST = join(process.cwd(), "dist");
const errors = [];

function read(p) {
  const full = join(DIST, p);
  return existsSync(full) ? readFileSync(full, "utf8") : null;
}

// 1. robots.txt nedrīkst būt pārrakstīts ar noklusējumu
const robots = read("robots.txt");
if (!robots) {
  errors.push("dist/robots.txt neeksistē");
} else {
  for (const bot of ["GPTBot", "ClaudeBot", "PerplexityBot"]) {
    if (!robots.includes(bot)) errors.push(`robots.txt trūkst ${bot} sadaļas`);
  }
}

if (errors.length) {
  console.error("Būves vārti KRITA:");
  for (const e of errors) console.error("  -", e);
  process.exit(1);
}
console.log("Būves vārti: viss kārtībā");
