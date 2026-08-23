import { describe, expect, it } from "vitest";
import { formatTelegramAlert } from "./waitlistNotifications";

const signal = {
  id: 12,
  email: "eddy@example.com",
  suggestion: "Automatic <follow-through>",
};

describe("waitlist notification formatting", () => {
  it("formats a compact Telegram alert with the key actions", () => {
    const message = formatTelegramAlert(signal);
    expect(message).toContain("<b>Edison / New waitlist signal</b>");
    expect(message).toContain("Automatic &lt;follow-through&gt;");
    expect(message).toContain("eddy@example.com");
  });
});
