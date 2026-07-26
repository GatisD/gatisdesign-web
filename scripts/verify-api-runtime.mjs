/**
 * Būves vārti Vercel funkcijām (api/).
 *
 * KĀPĒC ŠIS PASTĀV
 * Vercel api/ failus NEBUNDLĒ. Katrs api/**\/*.ts tiek pārtulkots par atsevišķu
 * .js failu, un package.json "type": "module" dēļ Node tos ielādē kā ESM.
 * Node ESM relatīvajiem importiem prasa pilnu failа nosaukumu ar ".js". Ja tā
 * trūkst, funkcija krīt ar ERR_MODULE_NOT_FOUND JAU MODUĻA IELĀDES BRĪDĪ -
 * pirms handler koda, pirms validācijas. Pārlūkā tas izskatās kā
 * FUNCTION_INVOCATION_FAILED / "A server error has occurred", un ne typecheck,
 * ne vitest, ne `vercel dev` to nepamana (tie visi resolvē kā bundleri).
 *
 * KO TIEŠI DARA
 * 1. Kompilē api/ ar tiem pašiem NodeNext iestatījumiem, ko lieto Vercel, un
 *    IZVADA reālus .js failus (nevis --noEmit).
 * 2. Blakus izvadam noliek package.json ar "type": "module" - tāpat kā Vercel.
 * 3. Atsevišķā tīrā Node procesā mēģina import() katru funkcijas ieejas punktu
 *    un pārbauda, ka default eksports ir funkcija.
 *
 * Ja modulis neielādējas, vārti krīt un deploy nenotiek.
 */

import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { join, relative } from "node:path";

const ROOT = process.cwd();
const API_DIR = join(ROOT, "api");
/* Izvads paliek repo iekšienē ar nolūku: tā Node bare-import ("zod") atrod
   projekta node_modules, ejot pa vecākmapēm augšup. Ārpus repo tas nestrādātu. */
const OUT_DIR = join(ROOT, ".api-verify");
const TSCONFIG = join(OUT_DIR, "tsconfig.emit.json");

if (!existsSync(API_DIR)) {
  console.log("API vārti: api/ mapes nav, nav ko pārbaudīt");
  process.exit(0);
}

/** Funkciju ieejas punkti: api/**\/*.ts, izņemot _* (koplietojamie moduļi) un testus. */
function entrypoints(dir, prefix = "") {
  const found = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith("_") || entry.name.startsWith(".")) continue;
    const rel = prefix ? `${prefix}/${entry.name}` : entry.name;
    if (entry.isDirectory()) {
      found.push(...entrypoints(join(dir, entry.name), rel));
    } else if (/\.ts$/.test(entry.name) && !/\.(test|spec)\.ts$/.test(entry.name)) {
      found.push(rel.replace(/\.ts$/, ".js"));
    }
  }
  return found;
}

const targets = entrypoints(API_DIR);
if (targets.length === 0) {
  console.log("API vārti: api/ nav neviena funkcijas ieejas punkta");
  process.exit(0);
}

rmSync(OUT_DIR, { recursive: true, force: true });
mkdirSync(OUT_DIR, { recursive: true });

writeFileSync(
  TSCONFIG,
  JSON.stringify(
    {
      extends: relative(OUT_DIR, join(ROOT, "tsconfig.api.json")).replace(/\\/g, "/"),
      compilerOptions: {
        noEmit: false,
        emitDeclarationOnly: false,
        sourceMap: false,
        outDir: ".",
        rootDir: relative(OUT_DIR, ROOT).replace(/\\/g, "/"),
      },
      include: [`${relative(OUT_DIR, API_DIR).replace(/\\/g, "/")}/**/*.ts`],
      exclude: [`${relative(OUT_DIR, API_DIR).replace(/\\/g, "/")}/**/*.test.ts`],
    },
    null,
    2,
  ),
);

writeFileSync(join(OUT_DIR, "package.json"), JSON.stringify({ type: "module", private: true }, null, 2));

const fail = (message, detail) => {
  console.error("API būves vārti KRITA:");
  console.error("  -", message);
  if (detail) console.error(String(detail).trim().split("\n").map((l) => `    ${l}`).join("\n"));
  process.exit(1);
};

try {
  execFileSync("npx", ["tsc", "-p", TSCONFIG], { cwd: ROOT, stdio: "pipe", encoding: "utf8" });
} catch (error) {
  fail("api/ neizdevās kompilēt ar NodeNext (tāpat kā Vercel)", `${error.stdout ?? ""}${error.stderr ?? ""}`);
}

/* Ielāde notiek atsevišķā procesā - tieši tā, kā to darītu Vercel launcher.
   Šeit svarīgs ir tikai fakts, ka modulis ielādējas; handler netiek izsaukts. */
const probe = targets
  .map(
    (t) => `
  try {
    const mod = await import(${JSON.stringify(`./api/${t}`)});
    if (typeof mod.default !== "function") {
      console.error(${JSON.stringify(`NOT_A_HANDLER|api/${t}`)} + "|default eksports nav funkcija");
      failed = true;
    }
  } catch (error) {
    console.error(${JSON.stringify(`LOAD_FAILED|api/${t}`)} + "|" + (error.code ?? "") + " " + String(error.message).split("\\n")[0]);
    failed = true;
  }`,
  )
  .join("\n");

const runner = join(OUT_DIR, "__probe.mjs");
writeFileSync(runner, `let failed = false;\n${probe}\nprocess.exit(failed ? 1 : 0);\n`);

try {
  execFileSync(process.execPath, [runner], { cwd: OUT_DIR, stdio: "pipe", encoding: "utf8" });
} catch (error) {
  fail(
    "Vercel funkcija neielādējas tīrā Node ESM izpildvidē",
    `${error.stdout ?? ""}${error.stderr ?? ""}\nBiežākais cēlonis: relatīvam importam api/ failā trūkst \".js\" paplašinājuma.`,
  );
}

rmSync(OUT_DIR, { recursive: true, force: true });
console.log(`API būves vārti: ${targets.length} funkcija(s) ielādējas tīrā Node ESM - ${targets.join(", ")}`);
