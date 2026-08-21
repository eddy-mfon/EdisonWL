import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";

const statsMock = vi.hoisted(() => vi.fn());
const emailsMock = vi.hoisted(() => vi.fn());

vi.mock("./db", () => ({ getWaitlistStats: statsMock, listWaitlistEmails: emailsMock }));

import { formatTelegramReport, handleTelegramReportingUpdate, telegramWebhookSecret } from "./telegramReporting";

const originalFetch = global.fetch;

describe("Telegram reporting commands", () => {
  beforeEach(() => {
    process.env.TELEGRAM_BOT_TOKEN = "123456:test-token";
    process.env.TELEGRAM_CHAT_ID = "777";
    process.env.JWT_SECRET = "test-jwt-secret";
    statsMock.mockResolvedValue({ allTimeSubmissions: 29, todaySubmissions: 4, weekSubmissions: 12, trackedConversions: 29 });
    emailsMock.mockResolvedValue([{ email: "newest@example.com" }, { email: "first@example.com" }]);
    global.fetch = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ ok: true }) }) as unknown as typeof fetch;
  });

  it("formats the total registered-email count without unrelated analytics", () => {
    const report = formatTelegramReport("/total", { allTimeSubmissions: 29, todaySubmissions: 4, weekSubmissions: 12, trackedConversions: 29 });
    expect(report).toContain("Total: 29");
    expect(report).not.toContain("Tracked conversions");
    expect(telegramWebhookSecret()).toMatch(/^[A-Za-z0-9_-]+$/);
  });

  it("answers an authorized /emails command through Telegram", async () => {
    await expect(handleTelegramReportingUpdate({ message: { message_id: 9, chat: { id: 777 }, text: "/emails" } })).resolves.toEqual({ handled: true });
    expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining("/sendMessage"), expect.objectContaining({ method: "POST" }));
    const payload = JSON.parse((global.fetch as unknown as ReturnType<typeof vi.fn>).mock.calls[0][1].body);
    expect(payload.text).toContain("newest@example.com");
    expect(payload.text).toContain("first@example.com");
  });

  it("sends the authorized report without a reply target when Telegram rejects a stale message ID", async () => {
    global.fetch = vi.fn()
      .mockResolvedValueOnce({ ok: false, json: async () => ({ ok: false, description: "Bad Request: message to be replied not found" }) })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ ok: true }) }) as unknown as typeof fetch;

    await expect(handleTelegramReportingUpdate({ message: { message_id: 91001, chat: { id: 777 }, text: "/total" } })).resolves.toEqual({ handled: true });
    expect(global.fetch).toHaveBeenCalledTimes(2);
    const fallbackPayload = JSON.parse((global.fetch as unknown as ReturnType<typeof vi.fn>).mock.calls[1][1].body);
    expect(fallbackPayload.reply_to_message_id).toBeUndefined();
    expect(fallbackPayload.text).toContain("Total: 29");
  });

  it("ignores commands from any other chat without disclosing analytics", async () => {
    await expect(handleTelegramReportingUpdate({ message: { chat: { id: 778 }, text: "/total" } })).resolves.toEqual({ handled: false });
    expect(global.fetch).not.toHaveBeenCalled();
  });
});

afterAll(() => {
  global.fetch = originalFetch;
});
