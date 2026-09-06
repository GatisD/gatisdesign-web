import { describe, it, expect } from "vitest";
import { existsSync } from "node:fs";
import { join } from "node:path";
import {
  projects,
  draftSlugs,
  projectBySlug,
  projectNeighbours,
  relatedProjects,
  richness,
  thinSlugs,
  featured,
  SERVICE_ROUTE_KEY,
} from "./projects";
import rawJson from "../content/projects.raw.json";
import { ROUTES } from "@/i18n/routes";

const PUBLIC_DIR = join(process.cwd(), "public");
const raw = rawJson as Array<{ slug: string; yearEstimated: boolean; yearRange?: string; summaryLv: string | null }>;

describe("portfolio projekti", () => {
  it("saraksts nav tukšs", () => {
    expect(projects.length).toBeGreaterThan(10);
  });

  it("nav dublētu slug", () => {
    const slugs = projects.map((p) => p.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it("katram projektam ir vāks ar izmēriem un latvisku alt tekstu", () => {
    for (const project of projects) {
      expect(project.cover.src, project.slug).toMatch(/^\/portfolio\/.+\.(jpe?g|png)$/);
      expect(project.cover.width, project.slug).toBeGreaterThan(0);
      expect(project.cover.height, project.slug).toBeGreaterThan(0);
      expect(project.cover.alt.length, project.slug).toBeGreaterThan(3);
    }
  });

  it("vāku faili tiešām eksistē public mapē", () => {
    for (const project of projects) {
      expect(existsSync(join(PUBLIC_DIR, project.cover.src)), project.cover.src).toBe(true);
    }
  });

  it("neviens melnraksta projekts nav publicētajā sarakstā", () => {
    expect(draftSlugs.length).toBeGreaterThan(0);
    for (const slug of draftSlugs) {
      expect(projectBySlug(slug), slug).toBeUndefined();
    }
  });

  it("neviens projekts ar minētu gadu nerāda gadu", () => {
    for (const entry of raw) {
      if (!entry.yearEstimated) continue;
      const project = projectBySlug(entry.slug);
      if (!project) continue;
      expect(project.year, entry.slug).toBeUndefined();
    }
  });

  it("gads, ja tāds ir, ir gads vai gadu diapazons", () => {
    for (const project of projects) {
      if (project.year === undefined) continue;
      expect(project.year, project.slug).toMatch(/^\d{4}(-\d{4})?$/);
    }
  });

  it("apraksts nekad nav izdomāts - tukšs paliek tukšs", () => {
    for (const entry of raw) {
      const project = projectBySlug(entry.slug);
      if (!project) continue;
      expect(project.summary, entry.slug).toBe(entry.summaryLv ?? "");
    }
  });

  it("ārējā saite ir tikai dzīvām vietnēm", () => {
    for (const project of projects) {
      if (project.externalUrl) expect(project.externalStatus, project.slug).toBe("live");
      if (project.externalStatus !== "live") expect(project.externalUrl, project.slug).toBeUndefined();
    }
  });

  it("ROIS projektiem loma nosaukta godīgi", () => {
    for (const project of projects) {
      if (project.role.kind !== "rois") continue;
      expect(project.role.label, project.slug).toMatch(/ROIS komandā$/);
    }
  });

  it("pakalpojumu atslēgas sasaistās ar reāliem maršrutiem", () => {
    for (const project of projects) {
      for (const service of project.services) {
        expect(ROUTES[SERVICE_ROUTE_KEY[service]], `${project.slug}/${service}`).toBeDefined();
      }
    }
  });

  it("galerijas faili eksistē un tiem ir izmērs", () => {
    const withGallery = projects.filter((p) => p.gallery);
    expect(withGallery.length).toBe(8);
    for (const project of withGallery) {
      for (const img of project.gallery ?? []) {
        expect(img.width, img.src).toBeGreaterThan(0);
        expect(img.height, img.src).toBeGreaterThan(0);
        expect(existsSync(join(PUBLIC_DIR, img.src)), img.src).toBe(true);
      }
    }
  });

  it("galerijas alt teksts apraksta attēlu, ne tā kārtas numuru", () => {
    // Agrāk alt tika ģenerēts kā "Logo kolekcija - 7. attēls no 51". Ekrāna
    // lasītājam tas nepasaka neko, un attēlu meklētājam - vēl mazāk. Tagad
    // katrs alt ir rakstīts pēc satura, tāpēc tie ir gan gari, gan atšķirīgi.
    for (const project of projects) {
      const seen = new Set<string>();
      for (const img of project.gallery ?? []) {
        expect(img.alt.length, img.src).toBeGreaterThan(20);
        expect(img.alt, img.src).not.toMatch(/attēls no|image \d+ of/i);
        expect(seen.has(img.alt), `atkārtots alt: ${img.src}`).toBe(false);
        seen.add(img.alt);
      }
    }
  });

  it("režģa kolekcijām ir sagatavoti 400 un 640 px varianti", () => {
    // Logo kolekcijā ir 70 kadri. Bez variantiem lapa noritinot lejupielādētu
    // pilnos kadrus (2,4 MB WebP), sk. scripts/gallery-thumbs.mjs. Platumiem
    // jāsakrīt ar `widths` iekš ProjectDetail režģa zara.
    for (const project of projects.filter((p) => p.galleryLayout === "grid")) {
      for (const img of project.gallery ?? []) {
        for (const width of [400, 640]) {
          for (const ext of ["webp", "jpg"]) {
            const variant = img.src.replace(/\.jpg$/, `-${width}.${ext}`);
            expect(existsSync(join(PUBLIC_DIR, variant)), variant).toBe(true);
          }
        }
      }
    }
  });

  it("kaimiņi veido apli", () => {
    const first = projects[0];
    const last = projects[projects.length - 1];
    expect(projectNeighbours(first.slug)?.prev.slug).toBe(last.slug);
    expect(projectNeighbours(last.slug)?.next.slug).toBe(first.slug);
    expect(projectNeighbours("nav-tada-slug")).toBeNull();
  });

  it("sākumlapas izlases slugi ir publicētajā sarakstā", () => {
    expect(featured).toHaveLength(5);
    for (const slug of featured) {
      expect(projectBySlug(slug), slug).toBeDefined();
    }
  });

  it("izcelti tiek tikai darbi, par kuriem ir ko lasīt", () => {
    // Sākumlapas izlasē un saraksta priekšgalā nedrīkst nokļūt lapa bez
    // apraksta: tieši tur cilvēks klikšķina pirmo reizi.
    for (const slug of featured) {
      const project = projectBySlug(slug)!;
      expect(project.summary.length, slug).toBeGreaterThan(40);
      expect(richness(project), slug).toBeGreaterThanOrEqual(3);
    }
    for (const project of projects.slice(0, 5)) {
      expect(project.summary.length, project.slug).toBeGreaterThan(0);
    }
  });

  it("plānās lapas ir zināmas un uzskaitītas", () => {
    // Ja apraksts kādai no tām tiek uzrakstīts, šis tests krīt un atgādina
    // pārbaudīt sitemap prioritāti (vite.config.ts liek 0,5 tieši šīm).
    expect([...thinSlugs].sort()).toEqual(["cafeteria", "forevolt", "green-bay", "obsidian"]);
    for (const slug of thinSlugs) {
      expect(featured, slug).not.toContain(slug);
    }
  });

  it("saistītie darbi neatkārto ne sevi, ne nākamo projektu", () => {
    for (const project of projects) {
      const related = relatedProjects(project.slug);
      expect(related.length, project.slug).toBeLessThanOrEqual(3);
      const next = projectNeighbours(project.slug)!.next.slug;
      for (const item of related) {
        expect(item.slug, project.slug).not.toBe(project.slug);
        expect(item.slug, project.slug).not.toBe(next);
        expect(item.category, project.slug).toBe(project.category);
      }
      expect(new Set(related.map((r) => r.slug)).size).toBe(related.length);
    }
  });
});
