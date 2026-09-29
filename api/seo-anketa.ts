import type { ServerResponse } from "node:http";
import { consoleLogger, describeError, readConfig } from "./_lib/contact-core.js";
import { clientIp, readJsonBody, sendJson, type BodyResult, type VercelLikeRequest } from "./_lib/http.js";
import { createResendSender } from "./_lib/resend.js";
import { handleSeoAnketa } from "./_lib/seo-anketa-core.js";
import { ANKETA_BODY_BYTES_MAX } from "./_lib/seo-anketa-fields.js";

/**
 * POST /api/seo-anketa - SEO-GEO sākuma anketa (lapa /seo-anketa).
 *
 * Tā pati infrastruktūra kā api/contact.ts: Resend, Turnstile, ātruma limits,
 * vispārīgi kļūdu kodi klientam (bez steka). Vēstule iet uz CONTACT_TO no
 * CONTACT_FROM, Reply-To ir kontaktpersonas e-pasts.
 */
export default async function handler(req: VercelLikeRequest, res: ServerResponse): Promise<void> {
  try {
    if ((req.method ?? "GET").toUpperCase() !== "POST") {
      sendJson(res, { status: 405, body: { ok: false, error: "method" }, headers: { Allow: "POST" } });
      return;
    }

    let body: BodyResult;
    try {
      body = await readJsonBody(req, ANKETA_BODY_BYTES_MAX);
    } catch {
      sendJson(res, { status: 400, body: { ok: false, error: "json" } });
      return;
    }
    // "=== false", ne "!body.ok" - sk. api/contact.ts piezīmi par Vercel tsconfig.
    if (body.ok === false) {
      sendJson(res, { status: body.error === "payload" ? 413 : 400, body: { ok: false, error: body.error } });
      return;
    }

    const config = readConfig(process.env);
    const result = await handleSeoAnketa({
      method: "POST",
      payload: body.value,
      ip: clientIp(req),
      config,
      send: createResendSender(config.apiKey ?? ""),
      logger: consoleLogger,
      requireTurnstile: process.env.VERCEL_ENV === "production",
    });
    sendJson(res, result);
  } catch (error) {
    consoleLogger.error("[seo-anketa] neparedzēta kļūda", { reason: describeError(error) });
    sendJson(res, { status: 500, body: { ok: false, error: "server" } });
  }
}
