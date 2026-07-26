import { buildAutoReplyEmail, buildNotificationEmail, type EmailMessage } from "./contact-emails.js";
import { contactSchema, fieldErrorsFrom, type FieldErrors } from "./contact-schema.js";

/**
 * Kontaktformas loģika bez HTTP slāņa. Šeit nav ne req, ne res - tāpēc to var
 * pārbaudīt ar testiem un palaist lokāli bez Vercel vides.
 */

export type SendEmail = (message: EmailMessage) => Promise<{ id: string }>;

export type Logger = {
  info: (message: string, meta?: Record<string, unknown>) => void;
  warn: (message: string, meta?: Record<string, unknown>) => void;
  error: (message: string, meta?: Record<string, unknown>) => void;
};

export const consoleLogger: Logger = {
  info: (message, meta) => console.log(message, meta ?? ""),
  warn: (message, meta) => console.warn(message, meta ?? ""),
  error: (message, meta) => console.error(message, meta ?? ""),
};

const silentLogger: Logger = { info: () => {}, warn: () => {}, error: () => {} };

/** Kļūdu kodi, ko klients pārtulko lietotāja valodā. */
export type ContactErrorCode =
  | "method"
  | "json"
  | "payload"
  | "validation"
  | "rate_limit"
  | "config"
  | "send"
  | "server";

export type ContactResponseBody =
  | { ok: true }
  | { ok: false; error: ContactErrorCode; fields?: FieldErrors; retryAfter?: number };

export type ContactResult = {
  status: number;
  body: ContactResponseBody;
  headers?: Record<string, string>;
};

export type ContactConfig = {
  /** Sūtītājs. Domēnam jābūt verificētam Resend kontā. */
  from: string;
  /** Saņēmējs - kur nonāk pieteikums. */
  to: string;
  /** Adrese, uz kuru aiziet atbilde uz automātisko vēstuli. */
  replyTo: string;
  apiKey?: string;
};

export const DEFAULT_FROM = "Gatis Design <forma@send.gatisdesign.com>";
export const DEFAULT_TO = "gatis.design@gmail.com";

/**
 * Vides mainīgie -> konfigurācija. Sūtītājam un saņēmējam ir noklusējumi, lai
 * viena aizmirsta Vercel vērtība nenogremdē formu; API atslēgai noklusējuma
 * nav un nevar būt.
 */
export function readConfig(env: Record<string, string | undefined>): ContactConfig {
  const to = env.CONTACT_TO?.trim() || DEFAULT_TO;
  return {
    from: env.CONTACT_FROM?.trim() || DEFAULT_FROM,
    to,
    replyTo: env.CONTACT_REPLY_TO?.trim() || to,
    apiKey: env.RESEND_API_KEY?.trim() || undefined,
  };
}

/* ------------------------------------------------------------------ *
 * Ātruma ierobežojums pēc IP
 *
 * Vienkāršs logs atmiņā. Serverless instance dzīvo īsi, tāpēc tas nav
 * absolūts vārts - tas nogriež acīmredzamu spamu no vienas adreses, un
 * šai slodzei (daži pieteikumi dienā) ar to pietiek.
 * ------------------------------------------------------------------ */

export const RATE_LIMIT = { windowMs: 10 * 60_000, max: 5 } as const;

const hits = new Map<string, number[]>();

/** Testiem: notīra logu starp pārbaudēm. */
export function resetRateLimit(): void {
  hits.clear();
}

function pruneOldEntries(now: number): void {
  if (hits.size < 500) return;
  for (const [key, times] of hits) {
    if (times.every((t) => now - t >= RATE_LIMIT.windowMs)) hits.delete(key);
  }
}

/** Atgriež sekundes līdz nākamajam mēģinājumam vai 0, ja limits nav pārsniegts. */
export function checkRateLimit(ip: string, now: number): number {
  pruneOldEntries(now);
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < RATE_LIMIT.windowMs);
  if (recent.length >= RATE_LIMIT.max) {
    const oldest = recent[0] as number;
    return Math.max(1, Math.ceil((RATE_LIMIT.windowMs - (now - oldest)) / 1000));
  }
  recent.push(now);
  hits.set(ip, recent);
  return 0;
}

/* ------------------------------------------------------------------ *
 * Galvenā plūsma
 * ------------------------------------------------------------------ */

export type HandleContactInput = {
  method?: string;
  /** Jau parsēts JSON. Parsēšana un izmēra vārti paliek HTTP slānī. */
  payload: unknown;
  ip: string;
  now?: number;
  config: ContactConfig;
  send: SendEmail;
  logger?: Logger;
};

export async function handleContact(input: HandleContactInput): Promise<ContactResult> {
  const log = input.logger ?? silentLogger;
  const now = input.now ?? Date.now();
  const method = (input.method ?? "POST").toUpperCase();

  if (method !== "POST") {
    return {
      status: 405,
      body: { ok: false, error: "method" },
      headers: { Allow: "POST" },
    };
  }

  // Slazds robotiem. Aizpildīts lauks nozīmē robotu: atbildam 200, lai tas
  // neuzzina par atsijāšanu, bet nekas netiek nosūtīts.
  const honeypot = (input.payload as { company?: unknown } | null)?.company;
  if (typeof honeypot === "string" && honeypot.trim() !== "") {
    log.info("[contact] slazds nostrādāja, netiek sūtīts");
    return { status: 200, body: { ok: true } };
  }

  const retryAfter = checkRateLimit(input.ip, now);
  if (retryAfter > 0) {
    log.warn("[contact] pārāk daudz pieprasījumu no vienas adreses");
    return {
      status: 429,
      body: { ok: false, error: "rate_limit", retryAfter },
      headers: { "Retry-After": String(retryAfter) },
    };
  }

  const parsed = contactSchema.safeParse(input.payload);
  if (!parsed.success) {
    const fields = fieldErrorsFrom(parsed.error);
    // Logā tikai lauku nosaukumi un kļūdu atslēgas, nekad pati vēstule.
    log.warn("[contact] validācija neizdevās", { fields });
    return { status: 400, body: { ok: false, error: "validation", fields } };
  }

  if (!input.config.apiKey) {
    log.error("[contact] trūkst RESEND_API_KEY - vēstule netiek sūtīta");
    return { status: 500, body: { ok: false, error: "config" } };
  }

  const data = parsed.data;
  const notification = buildNotificationEmail(data, {
    from: input.config.from,
    to: input.config.to,
  });

  let notificationId: string;
  try {
    const result = await input.send(notification);
    notificationId = result.id;
  } catch (error) {
    log.error("[contact] paziņojumu neizdevās nosūtīt", { reason: describeError(error) });
    return { status: 502, body: { ok: false, error: "send" } };
  }

  log.info("[contact] paziņojums nosūtīts", { id: notificationId });

  // Automātiskā atbilde ir papildinājums, ne nosacījums. Ja tā krīt,
  // pieteikums jau ir drošībā - atbildam 200 un pierakstām kļūdu.
  try {
    const reply = await input.send(
      buildAutoReplyEmail(data, { from: input.config.from, replyTo: input.config.replyTo }),
    );
    log.info("[contact] automātiskā atbilde nosūtīta", { id: reply.id });
  } catch (error) {
    log.warn("[contact] automātiskā atbilde neizdevās", { reason: describeError(error) });
  }

  return { status: 200, body: { ok: true } };
}

/** Kļūdas apraksts logam. Bez vēstules satura un bez atslēgas. */
export function describeError(error: unknown): string {
  if (error instanceof Error) return `${error.name}: ${error.message}`.slice(0, 300);
  return String(error).slice(0, 300);
}
