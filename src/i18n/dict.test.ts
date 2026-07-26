import { describe, it, expect } from "vitest";
import { dict } from "./dict";

function keysOf(obj: Record<string, unknown>, prefix = ""): string[] {
  return Object.entries(obj).flatMap(([k, v]) =>
    typeof v === "object" && v !== null
      ? keysOf(v as Record<string, unknown>, `${prefix}${k}.`)
      : [`${prefix}${k}`],
  );
}

function flatten(obj: Record<string, unknown>, prefix = ""): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(obj)) {
    if (typeof v === "object" && v !== null) Object.assign(out, flatten(v as Record<string, unknown>, `${prefix}${k}.`));
    else out[`${prefix}${k}`] = String(v);
  }
  return out;
}

describe("vārdnīcas", () => {
  it("EN satur visas LV atslēgas", () => {
    expect(keysOf(dict.en).sort()).toEqual(keysOf(dict.lv).sort());
  });

  it("neviena vērtība nav tukša", () => {
    for (const locale of ["lv", "en"] as const) {
      for (const [key, value] of Object.entries(flatten(dict[locale]))) {
        expect(value, `${locale}.${key}`).not.toBe("");
      }
    }
  });
});
