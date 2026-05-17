#!/usr/bin/env node
/**
 * Generate aspect-appropriate cover variants from high-res source images.
 * Uses sharp `position: 'attention'` to keep visually salient content centred.
 *
 * Outputs alongside the original cover:
 *   <slug>-cover-43.{jpg,webp}   – 4:3 landscape (1600x1200)
 *   <slug>-cover-sq.{jpg,webp}   – square       (1400x1400)
 *   <slug>-cover-45.{jpg,webp}   – 4:5 portrait (1280x1600)
 *   <slug>-cover-169.{jpg,webp}  – 16:9 wide    (1920x1080)
 */
import sharp from "sharp";
import { stat } from "node:fs/promises";
import { join } from "node:path";
import os from "node:os";

const ROOT = "/Users/gatisdaugavietis/Projects/gatisdesign-web/public/portfolio";
const SRC_DIR = "/Users/gatisdaugavietis/Downloads/gatisdesign-scrape/images";

const VARIANTS = [
  { key: "43", w: 1600, h: 1200 },
  { key: "sq", w: 1400, h: 1400 },
  { key: "45", w: 1280, h: 1600 },
  { key: "169", w: 1920, h: 1080 },
];

// Map repo slug → source folder slug
const SRC_SLUG = {
  "box-latvia": "box-latvia-branding",
  "apmekle": "apmeklelv-branding",
  "digitalaisdzintars": "digitalaisdzintarslv-branding",
  "logo-branding": "logobranding",
  "illustrations": "illustrations",
  "print": "print",
  "web-design": "web-design",
};

const SLUGS = Object.keys(SRC_SLUG);

async function pickBestSource(slug) {
  // Source folder has many images; pick the one whose name starts with 01 (first/cover)
  // — typically the brand cover shot.
  const srcSlug = SRC_SLUG[slug];
  const dir = join(SRC_DIR, srcSlug);
  // Try several candidates: 01, 02 (some sources have a hero shot at 02)
  for (const idx of ["01", "02", "03"]) {
    for (const ext of ["png", "jpeg", "jpg"]) {
      // Note: files are like 01_<uuid>_<width>.<ext>
      const files = await import("node:fs/promises").then((m) =>
        m.readdir(dir)
      );
      const match = files.find(
        (f) => f.startsWith(`${idx}_`) && f.toLowerCase().endsWith(`.${ext}`)
      );
      if (match) return join(dir, match);
    }
  }
  return null;
}

let ok = 0;
let fail = 0;

for (const slug of SLUGS) {
  const src = await pickBestSource(slug);
  if (!src) {
    console.error(`SKIP ${slug}: no source found`);
    fail++;
    continue;
  }
  for (const v of VARIANTS) {
    const baseName = `${slug}-cover-${v.key}`;
    const jpgDest = join(ROOT, `${baseName}.jpg`);
    const webpDest = join(ROOT, `${baseName}.webp`);

    try {
      await sharp(src)
        .resize({
          width: v.w,
          height: v.h,
          fit: "cover",
          position: sharp.strategy.attention,
        })
        .jpeg({ quality: 84, progressive: true })
        .toFile(jpgDest);
      await sharp(src)
        .resize({
          width: v.w,
          height: v.h,
          fit: "cover",
          position: sharp.strategy.attention,
        })
        .webp({ quality: 82, effort: 5 })
        .toFile(webpDest);
      ok++;
    } catch (e) {
      console.error(`FAIL ${slug}/${v.key}: ${e.message}`);
      fail++;
    }
  }
  console.log(`OK ${slug}`);
}

console.log(`\nGenerated ${ok}, failed ${fail}`);
