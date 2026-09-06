import { describe, it, expect } from "vitest";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { readFileSync } from "node:fs";
import { clientLogos, clientLogoPath } from "./clients";

const PUBLIC_DIR = join(process.cwd(), "public");

/** PNG IHDR: platums un augstums 16.-24. baitā. Bez atkarības tikai testam. */
function pngSize(file: string): { width: number; height: number } {
  const buf = readFileSync(file);
  return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) };
}

describe("klientu logotipi", () => {
  it("saraksts nav tukšs un bez dublikātiem", () => {
    expect(clientLogos.length).toBeGreaterThanOrEqual(10);
    const slugs = clientLogos.map((c) => c.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it("katram ir PNG un WebP fails public mapē", () => {
    for (const client of clientLogos) {
      const png = join(PUBLIC_DIR, clientLogoPath(client.slug).replace(/^\//, ""));
      expect(existsSync(png), `${client.slug}.png`).toBe(true);
      expect(existsSync(png.replace(/\.png$/, ".webp")), `${client.slug}.webp`).toBe(true);
    }
  });

  it("deklarētie izmēri sakrīt ar failu", () => {
    for (const client of clientLogos) {
      const png = join(PUBLIC_DIR, clientLogoPath(client.slug).replace(/^\//, ""));
      const real = pngSize(png);
      expect(real.width, `${client.slug} platums`).toBe(client.width);
      expect(real.height, `${client.slug} augstums`).toBe(client.height);
    }
  });

  it("nosaukums ir cilvēka lasāms, ne slug", () => {
    for (const client of clientLogos) {
      expect(client.name.length, client.slug).toBeGreaterThan(2);
      expect(client.name, client.slug).not.toMatch(/-/);
    }
  });
});
