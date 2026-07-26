import type { EmailMessage } from "./contact-emails.js";
import type { SendEmail } from "./contact-core.js";

const RESEND_ENDPOINT = "https://api.resend.com/emails";
const TIMEOUT_MS = 10_000;

export class ResendError extends Error {
  readonly status: number;

  constructor(status: number, detail: string) {
    // Detaļa nāk no Resend atbildes (validācijas kļūda, domēna problēma) -
    // vēstules saturs tur nenonāk, un atslēga netiek pievienota nekad.
    super(`Resend ${status}: ${detail.slice(0, 200)}`);
    this.name = "ResendError";
    this.status = status;
  }
}

/** Sūtītājs, kas runā ar Resend REST API. Atslēga paliek šeit, logos to nav. */
export function createResendSender(apiKey: string): SendEmail {
  return async (message: EmailMessage) => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
    try {
      const response = await fetch(RESEND_ENDPOINT, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: message.from,
          to: [message.to],
          subject: message.subject,
          text: message.text,
          html: message.html,
          ...(message.replyTo ? { reply_to: message.replyTo } : {}),
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        const detail = await response.text().catch(() => "");
        throw new ResendError(response.status, detail);
      }

      const payload = (await response.json().catch(() => ({}))) as { id?: string };
      return { id: payload.id ?? "" };
    } finally {
      clearTimeout(timer);
    }
  };
}
