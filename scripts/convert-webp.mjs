import sharp from "sharp";
import { readdir, stat } from "node:fs/promises";
import { join, parse } from "node:path";
const ROOT = "/Users/gatisdaugavietis/Projects/gatisdesign-web";
const PORTFOLIO_DIR = join(ROOT, "public/portfolio");
async function walk(dir) {
  const out = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...(await walk(full)));
    else if (/\.(jpe?g|png)$/i.test(entry.name)) out.push(full);
  }
  return out;
}
const files = await walk(PORTFOLIO_DIR);
console.log(`Found ${files.length}`);
let ok=0, saved=0;
await Promise.all(files.map(async (src) => {
  const { dir, name } = parse(src);
  const dest = join(dir, `${name}.webp`);
  const destStat = await stat(dest).catch(() => null);
  if (destStat && destStat.size > 1024) return;
  const origStat = await stat(src);
  await sharp(src).webp({ quality: 82, effort: 5 }).toFile(dest);
  const newStat = await stat(dest);
  saved += origStat.size - newStat.size;
  ok++;
}));
console.log(`Converted ${ok}, saved ${(saved/1024/1024).toFixed(1)}MB`);
