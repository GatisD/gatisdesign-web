import { describe, it, expect } from "vitest";
import { TESTIMONIALS_ENABLED, testimonials } from "./testimonials";

describe("atsauksmes", () => {
  it("izslēgta sadaļa ir tukša, nevis puse no sadaļas", () => {
    // Gata lēmums 2026-09-06: atsauksmes pagaidām nebūs. Ja karodziņš ir nost,
    // sarakstam jābūt tukšam - citādi lapā parādītos puse no sadaļas.
    if (!TESTIMONIALS_ENABLED) expect(testimonials).toHaveLength(0);
  });

  it("katrai atsauksmei ir vārds, uzņēmums un konkrēts rezultāts", () => {
    // Anonīma pateicība nepierāda neko. Šis tests krīt tajā brīdī, kad kāds
    // ieliek atsauksmi bez vārda vai bez iznākuma - ne mēnesi vēlāk auditā.
    for (const item of testimonials) {
      expect(item.name.trim().split(/\s+/).length, item.quote).toBeGreaterThanOrEqual(2);
      expect(item.company.length, item.name).toBeGreaterThan(1);
      expect(item.role.length, item.name).toBeGreaterThan(2);
      expect(item.result.length, item.name).toBeGreaterThan(10);
      expect(item.quote.length, item.name).toBeGreaterThan(40);
      expect(item.quote, item.name).not.toMatch(/[–—]/);
    }
  });

  it("ieslēgtai sadaļai vajag vismaz trīs atsauksmes", () => {
    // Viena atsauksme lapā izskatās pēc vienīgās, ko izdevās dabūt.
    if (TESTIMONIALS_ENABLED) expect(testimonials.length).toBeGreaterThanOrEqual(3);
  });
});
