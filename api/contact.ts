import type { ServerResponse } from "node:http";
import {
  consoleLogger,
  describeError,
  handleContact,
  readConfig,
  type ContactResult,
} from "./_lib/contact-core.js";
import { FIELD_LIMITS } from "./_lib/contact-fields.js";
import { createResendSender } from "./_lib/resend.js";
import { clientIp, readJsonBody, sendJson, type BodyResult, type VercelLikeRequest } from "./_lib/http.js";

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

export default async function handler(
  req: VercelLikeRequest,
  res: ServerResponse,
): Promise<void> {
  try {
    if ((req.method ?? "GET").toUpperCase() !== "POST") {
      send(res, { status: 405, body: { ok: false, error: "method" }, headers: { Allow: "POST" } });
      return;
    }

    // Ķermeņa nolasīšanai sava kļūdu apstrāde: ar Content-Type application/json
    // Vercel parsē pats, un pie salauzta JSON izņēmums lidoja līdz ārējam catch,
    // kas atbild 500 "neparedzēta kļūda". Salauzts JSON ir klienta kļūda, un
    // atbildei uz to ir 400, ne 500.
    let body: BodyResult;
    try {
      body = await readJsonBody(req, FIELD_LIMITS.bodyBytesMax);
    } catch {
      send(res, { status: 400, body: { ok: false, error: "json" } });
      return;
    }
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
  sendJson(res, result);
}
