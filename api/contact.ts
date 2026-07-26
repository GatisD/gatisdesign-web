import type { IncomingMessage, ServerResponse } from "node:http";
import {
  consoleLogger,
  describeError,
  handleContact,
  readConfig,
  type ContactResult,
} from "./_lib/contact-core.js";
import { FIELD_LIMITS } from "./_lib/contact-fields.js";
import { createResendSender } from "./_lib/resend.js";

/**
 * POST /api/contact - kontaktformas pieteikums.
 *
 * Vercel Node izpildvide. Apzināti tiek lietots tikai standarta node:http API
 * (statusCode, setHeader, end), nevis Vercel res.status().json() cukurs -
 * tāpēc to pašu funkciju var palaist lokāli ar parastu node serveri un
 * pārbaudīt, ka vēstule reāli aiziet.
 *
 * Vides mainīgie: RESEND_API_KEY (obligāts), CONTACT_TO, CONTACT_FROM,
 * CONTACT_REPLY_TO (nav obligāti, sk. readConfig noklusējumus).
 */

type VercelLikeRequest = IncomingMessage & { body?: unknown };

export default async function handler(
  req: VercelLikeRequest,
  res: ServerResponse,
): Promise<void> {
  try {
    if ((req.method ?? "GET").toUpperCase() !== "POST") {
      send(res, { status: 405, body: { ok: false, error: "method" }, headers: { Allow: "POST" } });
      return;
    }

    const body = await readJsonBody(req);
    // Apzināti "=== false", nevis "!body.ok": Vercel api/ kompilē ar savu
    // ne-strict tsconfig, un tur boolean diskriminants ar noliegumu nesašaurina
    // savienojumu. Rezultāts būtu TS2339 troksnis būves logos, kurā noslīkst
    // īstās kļūdas.
    if (body.ok === false) {
      send(res, { status: body.error === "payload" ? 413 : 400, body: { ok: false, error: body.error } });
      return;
    }

    const config = readConfig(process.env);
    const result = await handleContact({
      method: "POST",
      payload: body.value,
      ip: clientIp(req),
      config,
      send: createResendSender(config.apiKey ?? ""),
      logger: consoleLogger,
    });

    send(res, result);
  } catch (error) {
    consoleLogger.error("[contact] neparedzēta kļūda", { reason: describeError(error) });
    send(res, { status: 500, body: { ok: false, error: "server" } });
  }
}

function send(res: ServerResponse, result: ContactResult): void {
  res.statusCode = result.status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  for (const [key, value] of Object.entries(result.headers ?? {})) res.setHeader(key, value);
  res.end(JSON.stringify(result.body));
}

/** Pirmā adrese x-forwarded-for virknē; Vercel to uzstāda proxy priekšā. */
function clientIp(req: IncomingMessage): string {
  const forwarded = req.headers["x-forwarded-for"];
  const raw = Array.isArray(forwarded) ? forwarded[0] : forwarded;
  const first = raw?.split(",")[0]?.trim();
  return first || req.socket?.remoteAddress || "unknown";
}

type BodyResult = { ok: true; value: unknown } | { ok: false; error: "json" | "payload" };

/**
 * Vercel parasti jau ir noparsējis JSON un ielicis req.body. Ja nav (cits
 * Content-Type, cita izpildvide, lokāls tests), nolasa plūsmu pats ar izmēra
 * vārtiem.
 */
async function readJsonBody(req: VercelLikeRequest): Promise<BodyResult> {
  if (req.body !== undefined && req.body !== null && typeof req.body === "object") {
    return { ok: true, value: req.body };
  }
  if (typeof req.body === "string") return parseJson(req.body);

  const chunks: Buffer[] = [];
  let size = 0;
  for await (const chunk of req) {
    const buf = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk as string);
    size += buf.length;
    if (size > FIELD_LIMITS.bodyBytesMax) return { ok: false, error: "payload" };
    chunks.push(buf);
  }
  return parseJson(Buffer.concat(chunks).toString("utf8"));
}

function parseJson(raw: string): BodyResult {
  if (raw.length > FIELD_LIMITS.bodyBytesMax) return { ok: false, error: "payload" };
  if (raw.trim() === "") return { ok: false, error: "json" };
  try {
    return { ok: true, value: JSON.parse(raw) };
  } catch {
    return { ok: false, error: "json" };
  }
}
