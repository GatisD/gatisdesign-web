import { describe, it, expect } from "vitest";
import { existsSync } from "node:fs";
import { join } from "node:path";
import {
  projects,
  draftSlugs,
  projectBySlug,
  projectNeighbours,
  featuredSlugs,
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

  it("galerijas ir tikai kolekcijām un visi faili eksistē", () => {
    const withGallery = projects.filter((p) => p.gallery);
    expect(withGallery.length).toBe(7);
    for (const project of withGallery) {
      for (const img of project.gallery ?? []) {
        expect(img.width, img.src).toBeGreaterThan(0);
        expect(img.alt, img.src).toContain(project.title);
        expect(existsSync(join(PUBLIC_DIR, img.src)), img.src).toBe(true);
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
    for (const slug of [...featuredSlugs.columnA, ...featuredSlugs.columnB]) {
      expect(projectBySlug(slug), slug).toBeDefined();
    }
  });
});
