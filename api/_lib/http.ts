import type { IncomingMessage, ServerResponse } from "node:http";

/**
 * HTTP slānis, kas kopīgs visām formu funkcijām (api/contact.ts,
 * api/seo-anketa.ts). Tikai standarta node:http API, lai funkciju var palaist
 * arī lokāli ar parastu node serveri.
 */

export type VercelLikeRequest = IncomingMessage & { body?: unknown };

export type JsonResult = {
  status: number;
  body: unknown;
  headers?: Record<string, string>;
};

export function sendJson(res: ServerResponse, result: JsonResult): void {
  res.statusCode = result.status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  for (const [key, value] of Object.entries(result.headers ?? {})) res.setHeader(key, value);
  res.end(JSON.stringify(result.body));
}

/** Pirmā adrese x-forwarded-for virknē; Vercel to uzstāda proxy priekšā. */
export function clientIp(req: IncomingMessage): string {
  const forwarded = req.headers["x-forwarded-for"];
  const raw = Array.isArray(forwarded) ? forwarded[0] : forwarded;
  const first = raw?.split(",")[0]?.trim();
  return first || req.socket?.remoteAddress || "unknown";
}

export type BodyResult = { ok: true; value: unknown } | { ok: false; error: "json" | "payload" };

/**
 * Vercel parasti jau ir noparsējis JSON un ielicis req.body. Ja nav (cits
 * Content-Type, cita izpildvide, lokāls tests), nolasa plūsmu pats ar izmēra
 * vārtiem.
 */
export async function readJsonBody(req: VercelLikeRequest, maxBytes: number): Promise<BodyResult> {
  if (req.body !== undefined && req.body !== null && typeof req.body === "object") {
    // Vercel jau ir noparsējis ķermeni, tāpēc plūsmas izmēra vārti nekad
    // nenostrādāja - pa šo ceļu vienīgā robeža bija Vercel 4,5 MB. Izmēru
    // mēra pēc noparsētā objekta.
    const size = Buffer.byteLength(JSON.stringify(req.body), "utf8");
    if (size > maxBytes) return { ok: false, error: "payload" };
    return { ok: true, value: req.body };
  }
  if (typeof req.body === "string") return parseJson(req.body, maxBytes);

  const chunks: Buffer[] = [];
  let size = 0;
  for await (const chunk of req) {
    const buf = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk as string);
    size += buf.length;
    if (size > maxBytes) return { ok: false, error: "payload" };
    chunks.push(buf);
  }
  return parseJson(Buffer.concat(chunks).toString("utf8"), maxBytes);
}

export function parseJson(raw: string, maxBytes: number): BodyResult {
  if (Buffer.byteLength(raw, "utf8") > maxBytes) return { ok: false, error: "payload" };
  if (raw.trim() === "") return { ok: false, error: "json" };
  try {
    return { ok: true, value: JSON.parse(raw) };
  } catch {
    return { ok: false, error: "json" };
  }
}
