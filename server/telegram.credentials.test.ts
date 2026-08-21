import { describe, expect, it } from "vitest";

describe("Telegram notification credentials", () => {
  it("accepts the configured Edison bot token format", () => {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    expect(token).toMatch(/^\d+:[A-Za-z0-9_-]+$/);
  });

  const liveCredentialCheck = process.env.RUN_LIVE_CREDENTIAL_CHECKS === "true" ? it : it.skip;

  liveCredentialCheck("authenticates the configured Edison bot through Telegram getMe", async () => {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    expect(token).toMatch(/^\d+:[A-Za-z0-9_-]+$/);

    let response: Response | undefined;
    let lastError: unknown;
    for (let attempt = 0; attempt < 3; attempt += 1) {
      try {
        response = await fetch(`https://api.telegram.org/bot${token}/getMe`, { signal: AbortSignal.timeout(4_000) });
        break;
      } catch (error) {
        lastError = error;
        await new Promise(resolve => setTimeout(resolve, 500 * (attempt + 1)));
      }
    }

    if (!response) throw lastError;
    expect(response.ok).toBe(true);

    const payload = (await response.json()) as { ok?: boolean; result?: { is_bot?: boolean } };
    expect(payload.ok).toBe(true);
    expect(payload.result?.is_bot).toBe(true);
  }, 20_000);
});
