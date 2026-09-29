import {
  createRateLimiter,
  createTurnstileVerifier,
  describeError,
  RATE_LIMIT,
  type ContactConfig,
  type ContactErrorCode,
  type Logger,
  type SendEmail,
  type VerifyTurnstile,
} from "./contact-core.js";
import { buildAnketaEmail } from "./seo-anketa-emails.js";
import { ANKETA_BODY_BYTES_MAX, ANKETA_HONEYPOT_FIELD } from "./seo-anketa-fields.js";
import { anketaFieldErrors, anketaSchema, type AnketaData, type AnketaFieldErrors } from "./seo-anketa-schema.js";

/**
 * SEO anketas loģika bez HTTP slāņa. Tie paši vārti un tā pati secība kā
 * kontaktformai (api/_lib/contact-core.ts): metode, ātruma limits, validācija,
 * Turnstile, atslēga, slazds, sūtīšana. Atšķirības:
 *   - automātiskās atbildes iesniedzējam nav - anketa iet tikai Gatim;
 *   - savs ātruma logs, lai viena forma neapēd otras limitu;
 *   - kopējā izmēra griesti ir lielāki, jo anketā ir ~30 lauku.
 */

export type AnketaResponseBody =
  | { ok: true }
  | { ok: false; error: ContactErrorCode; fields?: AnketaFieldErrors; retryAfter?: number };

export type AnketaResult = {
  status: number;
  body: AnketaResponseBody;
  headers?: Record<string, string>;
};

const limiter = createRateLimiter(RATE_LIMIT);

/** Testiem: notīra logu starp pārbaudēm. */
export function resetAnketaRateLimit(): void {
  limiter.reset();
}

const silentLogger: Logger = { info: () => {}, warn: () => {}, error: () => {} };

export type HandleAnketaInput = {
  method?: string;
  payload: unknown;
  ip: string;
  now?: number;
  config: ContactConfig;
  send: SendEmail;
  logger?: Logger;
  verifyTurnstile?: VerifyTurnstile;
  /**
   * Produkcijā robotu pārbaude ir obligāta: ja noslēpuma nav, anketa atsakās
   * sūtīt (fail-closed), nevis klusi atveras. Preview un lokāli - pēc env.
   */
  requireTurnstile?: boolean;
};

export async function handleSeoAnketa(input: HandleAnketaInput): Promise<AnketaResult> {
  const log = input.logger ?? silentLogger;
  const now = input.now ?? Date.now();
  const method = (input.method ?? "POST").toUpperCase();

  if (method !== "POST") {
    return { status: 405, body: { ok: false, error: "method" }, headers: { Allow: "POST" } };
  }

  // Kopējie griesti arī šeit, ne tikai HTTP slānī: tā tos var pārbaudīt ar
  // testu, un cits izsaucējs tos neapiet.
  let size = 0;
  try {
    size = Buffer.byteLength(JSON.stringify(input.payload ?? null), "utf8");
  } catch {
    return { status: 400, body: { ok: false, error: "json" } };
  }
  if (size > ANKETA_BODY_BYTES_MAX) {
    log.warn("[seo-anketa] pieprasījums par lielu", { size });
    return { status: 413, body: { ok: false, error: "payload" } };
  }

  const retryAfter = limiter.check(input.ip, now);
  if (retryAfter > 0) {
    log.warn("[seo-anketa] pārāk daudz pieprasījumu no vienas adreses");
    return {
      status: 429,
      body: { ok: false, error: "rate_limit", retryAfter },
      headers: { "Retry-After": String(retryAfter) },
    };
  }

  const parsed = anketaSchema.safeParse(input.payload);
  if (!parsed.success) {
    const fields = anketaFieldErrors(parsed.error);
    // Logā tikai lauku nosaukumi un kļūdu atslēgas, nekad saturs.
    log.warn("[seo-anketa] validācija neizdevās", { fields });
    return { status: 400, body: { ok: false, error: "validation", fields } };
  }

  if (input.requireTurnstile && !input.config.turnstileSecret) {
    log.error("[seo-anketa] TURNSTILE_SECRET_KEY nav iestatīts produkcijā - sūtīšana atteikta");
    return { status: 503, body: { ok: false, error: "config" } };
  }

  if (input.config.turnstileSecret) {
    const raw = (input.payload as Record<string, unknown> | null)?.["cf-turnstile-response"];
    const token = typeof raw === "string" ? raw.trim() : "";
    if (!token) {
      log.warn("[seo-anketa] Turnstile pilnvaras nav");
      return { status: 400, body: { ok: false, error: "turnstile" } };
    }
    const verify = input.verifyTurnstile ?? createTurnstileVerifier(input.config.turnstileSecret);
    let passed = false;
    try {
      passed = await verify(token, input.ip);
    } catch (error) {
      log.error("[seo-anketa] Turnstile pārbaude nav pieejama", { reason: describeError(error) });
      return {
        status: 503,
        body: { ok: false, error: "turnstile_unavailable" },
        headers: { "Retry-After": "30" },
      };
    }
    if (!passed) {
      log.warn("[seo-anketa] Turnstile pilnvara nav derīga");
      return { status: 400, body: { ok: false, error: "turnstile" } };
    }
  }

  if (!input.config.apiKey) {
    log.error("[seo-anketa] trūkst RESEND_API_KEY - vēstule netiek sūtīta");
    return { status: 500, body: { ok: false, error: "config" } };
  }

  const data = parsed.data as unknown as AnketaData;

  // Aizpildīts slazds neizmet anketu - tāpat kā kontaktformā (2026-09-07
  // mācība): kluss 200 bez vēstules ir pazudis klients. Vēstule aiziet ar
  // atzīmi tēmā, lēmumu pieņem cilvēks.
  const slazds = (input.payload as Record<string, unknown> | null)?.[ANKETA_HONEYPOT_FIELD];
  const slazdsAizpildits = typeof slazds === "string" && slazds.trim() !== "";
  if (slazdsAizpildits) log.warn("[seo-anketa] slazds aizpildīts - sūtām ar atzīmi");

  const base = buildAnketaEmail(data, { from: input.config.from, to: input.config.to });
  const message = slazdsAizpildits ? { ...base, subject: `[slazds] ${base.subject}` } : base;

  try {
    const result = await input.send(message);
    log.info("[seo-anketa] vēstule nosūtīta", { id: result.id });
  } catch (error) {
    log.error("[seo-anketa] vēstuli neizdevās nosūtīt", { reason: describeError(error) });
    return { status: 502, body: { ok: false, error: "send" } };
  }

  return { status: 200, body: { ok: true } };
}
