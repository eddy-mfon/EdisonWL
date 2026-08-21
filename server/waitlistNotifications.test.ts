import { describe, expect, it } from "vitest";
import { formatTelegramAlert, formatWaitlistEmail, getSmtpTransport } from "./waitlistNotifications";

const signal = {
  id: 12,
  email: "eddy@example.com",
  suggestion: "Automatic <follow-through>",
};

describe("waitlist notification formatting", () => {
  it("authenticates the configured Gmail sender without sending mail", async () => {
    await expect(getSmtpTransport().verify()).resolves.toBe(true);
  }, 30_000);

  it("formats the minimal signal for the branded email without raw HTML", () => {
    const email = formatWaitlistEmail(signal);
    expect(email).toContain("Automatic &lt;follow-through&gt;");
    expect(email).toContain("eddy@example.com");
    expect(email).toContain("Edison / New signal #12");
  });

  it("formats a compact Telegram alert with the key actions", () => {
    const message = formatTelegramAlert(signal);
    expect(message).toContain("<b>Edison / New waitlist signal</b>");
    expect(message).toContain("Automatic &lt;follow-through&gt;");
    expect(message).toContain("eddy@example.com");
  });
});
