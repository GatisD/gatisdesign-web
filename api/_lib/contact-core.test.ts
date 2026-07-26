import { beforeEach, describe, expect, it } from "vitest";
import { handleContact, readConfig, resetRateLimit, RATE_LIMIT, type ContactConfig } from "./contact-core.js";
import type { EmailMessage } from "./contact-emails.js";

const config: ContactConfig = {
  from: "Gatis Design <forma@send.gatisdesign.com>",
  to: "gatis.design@gmail.com",
  replyTo: "gatis.design@gmail.com",
  apiKey: "re_tests_nav_istas_atslegas",
};

const validPayload = {
  name: "Testa Pieteikums",
  email: "klients@piemers.lv",
  service: "majaslapas",
  budget: "1000-3000",
  timeline: "1-2 mēneši",
  message: "Vajag jaunu mājaslapu ar formu, kas reāli sūta vēstules.",
  consent: true,
  locale: "lv",
};

function recorder() {
  const sent: EmailMessage[] = [];
  return {
    sent,
    send: async (message: EmailMessage) => {
      sent.push(message);
      return { id: `test-${sent.length}` };
    },
  };
}

let ipCounter = 0;
/** Katram testam sava adrese, lai ātruma logs starp testiem nepārklājas. */
function freshIp(): string {
  ipCounter += 1;
  return `10.0.0.${ipCounter}`;
}

beforeEach(() => {
  resetRateLimit();
});

describe("kontaktformas serveris", () => {
  it("derīgs pieteikums sūta divas vēstules un atgriež 200", async () => {
    const mail = recorder();
    const result = await handleContact({
      payload: validPayload,
      ip: freshIp(),
      config,
      send: mail.send,
    });

    expect(result.status).toBe(200);
    expect(result.body).toEqual({ ok: true });
    expect(mail.sent).toHaveLength(2);

    const [notification, autoReply] = mail.sent;
    expect(notification.to).toBe("gatis.design@gmail.com");
    expect(notification.replyTo).toBe("klients@piemers.lv");
    expect(notification.subject).toContain("Mājaslapu izstrāde");
    expect(notification.subject).toContain("Testa Pieteikums");
    expect(notification.text).toContain("1-2 mēneši");

    expect(autoReply.to).toBe("klients@piemers.lv");
    expect(autoReply.subject).toBe("Paldies par pieprasījumu - Gatis Design");
  });

  it("automātiskā atbilde iet iesniedzēja valodā", async () => {
    const mail = recorder();
    const result = await handleContact({
      payload: { ...validPayload, locale: "en", email: "client@example.com" },
      ip: freshIp(),
      config,
      send: mail.send,
    });

    expect(result.status).toBe(200);
    expect(mail.sent[1].subject).toBe("Thank you for your request - Gatis Design");
    expect(mail.sent[1].text).toContain("Website development");
  });

  it("tukšs vārds atgriež 400 ar lauka kļūdu un neko nesūta", async () => {
    const mail = recorder();
    const result = await handleContact({
      payload: { ...validPayload, name: "" },
      ip: freshIp(),
      config,
      send: mail.send,
    });

    expect(result.status).toBe(400);
    expect(result.body).toMatchObject({ ok: false, error: "validation" });
    expect((result.body as { fields: Record<string, string> }).fields.name).toBe("nameShort");
    expect(mail.sent).toHaveLength(0);
  });

  it("consent false atgriež 400", async () => {
    const mail = recorder();
    const result = await handleContact({
      payload: { ...validPayload, consent: false },
      ip: freshIp(),
      config,
      send: mail.send,
    });

    expect(result.status).toBe(400);
    expect((result.body as { fields: Record<string, string> }).fields.consent).toBe("consentRequired");
    expect(mail.sent).toHaveLength(0);
  });

  it("nederīgs pakalpojums un budžets netiek pieņemts", async () => {
    const mail = recorder();
    const result = await handleContact({
      payload: { ...validPayload, service: "kaut-kas-cits", budget: "miljons" },
      ip: freshIp(),
      config,
      send: mail.send,
    });

    expect(result.status).toBe(400);
    const fields = (result.body as { fields: Record<string, string> }).fields;
    expect(fields.service).toBe("serviceRequired");
    expect(fields.budget).toBe("budgetRequired");
    expect(mail.sent).toHaveLength(0);
  });

  it("pārāk īsa ziņa netiek pieņemta", async () => {
    const mail = recorder();
    const result = await handleContact({
      payload: { ...validPayload, message: "īsa" },
      ip: freshIp(),
      config,
      send: mail.send,
    });

    expect(result.status).toBe(400);
    expect((result.body as { fields: Record<string, string> }).fields.message).toBe("messageShort");
    expect(mail.sent).toHaveLength(0);
  });

  it("aizpildīts slazds atgriež 200, bet vēstule neaiziet", async () => {
    const mail = recorder();
    const result = await handleContact({
      payload: { ...validPayload, company: "SIA Robots" },
      ip: freshIp(),
      config,
      send: mail.send,
    });

    expect(result.status).toBe(200);
    expect(result.body).toEqual({ ok: true });
    expect(mail.sent).toHaveLength(0);
  });

  it("pārsniedzot limitu, atgriež 429 ar Retry-After", async () => {
    const mail = recorder();
    const ip = freshIp();
    for (let i = 0; i < RATE_LIMIT.max; i += 1) {
      const ok = await handleContact({ payload: validPayload, ip, config, send: mail.send });
      expect(ok.status).toBe(200);
    }

    const blocked = await handleContact({ payload: validPayload, ip, config, send: mail.send });
    expect(blocked.status).toBe(429);
    expect(blocked.body).toMatchObject({ ok: false, error: "rate_limit" });
    expect(Number(blocked.headers?.["Retry-After"])).toBeGreaterThan(0);
    expect(mail.sent).toHaveLength(RATE_LIMIT.max * 2);
  });

  it("logs atbrīvojas, kad laika logs pagājis", async () => {
    const mail = recorder();
    const ip = freshIp();
    const start = 1_000_000;
    for (let i = 0; i < RATE_LIMIT.max; i += 1) {
      await handleContact({ payload: validPayload, ip, now: start, config, send: mail.send });
    }
    const later = await handleContact({
      payload: validPayload,
      ip,
      now: start + RATE_LIMIT.windowMs + 1,
      config,
      send: mail.send,
    });
    expect(later.status).toBe(200);
  });

  it("bez RESEND_API_KEY atgriež 500 config, nevis klusu kļūdu", async () => {
    const mail = recorder();
    const result = await handleContact({
      payload: validPayload,
      ip: freshIp(),
      config: { ...config, apiKey: undefined },
      send: mail.send,
    });

    expect(result.status).toBe(500);
    expect(result.body).toEqual({ ok: false, error: "config" });
    expect(mail.sent).toHaveLength(0);
  });

  it("ja paziņojums neaiziet, atgriež 502", async () => {
    const result = await handleContact({
      payload: validPayload,
      ip: freshIp(),
      config,
      send: async () => {
        throw new Error("Resend 403: domain not verified");
      },
    });

    expect(result.status).toBe(502);
    expect(result.body).toEqual({ ok: false, error: "send" });
  });

  it("ja krīt tikai automātiskā atbilde, pieteikums tāpat ir saņemts", async () => {
    let calls = 0;
    const result = await handleContact({
      payload: validPayload,
      ip: freshIp(),
      config,
      send: async () => {
        calls += 1;
        if (calls === 2) throw new Error("Resend 429: too many requests");
        return { id: "notification-1" };
      },
    });

    expect(result.status).toBe(200);
    expect(result.body).toEqual({ ok: true });
  });

  it("cita metode atgriež 405 ar Allow", async () => {
    const mail = recorder();
    const result = await handleContact({
      method: "GET",
      payload: {},
      ip: freshIp(),
      config,
      send: mail.send,
    });

    expect(result.status).toBe(405);
    expect(result.headers?.Allow).toBe("POST");
    expect(mail.sent).toHaveLength(0);
  });

  it("HTML vēstulē lietotāja teksts ir aizsargāts", async () => {
    const mail = recorder();
    await handleContact({
      payload: {
        ...validPayload,
        name: "Testa <script>alert(1)</script>",
        message: "Ziņa ar <b>tagiem</b> un & zīmi, pietiekami gara pārbaudei.",
      },
      ip: freshIp(),
      config,
      send: mail.send,
    });

    expect(mail.sent[0].html).not.toContain("<script>");
    expect(mail.sent[0].html).toContain("&lt;script&gt;");
    expect(mail.sent[0].html).toContain("&lt;b&gt;tagiem&lt;/b&gt;");
  });
});

describe("konfigurācija no vides", () => {
  it("noklusējumi ir droši, ja mainīgie nav uzstādīti", () => {
    const cfg = readConfig({});
    expect(cfg.from).toBe("Gatis Design <forma@send.gatisdesign.com>");
    expect(cfg.to).toBe("gatis.design@gmail.com");
    expect(cfg.replyTo).toBe("gatis.design@gmail.com");
    expect(cfg.apiKey).toBeUndefined();
  });

  it("CONTACT_TO maina saņēmēju bez koda izmaiņām", () => {
    const cfg = readConfig({ CONTACT_TO: "cits@gatisdesign.com", RESEND_API_KEY: "re_x" });
    expect(cfg.to).toBe("cits@gatisdesign.com");
    expect(cfg.replyTo).toBe("cits@gatisdesign.com");
    expect(cfg.apiKey).toBe("re_x");
  });
});
