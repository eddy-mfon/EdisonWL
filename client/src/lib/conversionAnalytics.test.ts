import { describe, expect, it, vi } from "vitest";
import { reportWaitlistConversion, waitlistThankYouName } from "./conversionAnalytics";

describe("waitlist conversion analytics", () => {
  it("emits the successful join event and sends the total to optional analytics", () => {
    const track = vi.fn();
    const dispatchEvent = vi.fn(() => true);
    const CustomEvent = class {
      type: string;
      detail: unknown;
      constructor(type: string, init?: CustomEventInit) { this.type = type; this.detail = init?.detail; }
    } as unknown as typeof globalThis.CustomEvent;

    reportWaitlistConversion({ umami: { track }, dispatchEvent, CustomEvent }, 18);
    expect(track).toHaveBeenCalledWith("waitlist_joined", { total_submissions: 18 });
    expect(dispatchEvent).toHaveBeenCalledWith(expect.objectContaining({ type: "edison:waitlist_joined", detail: { totalSubmissions: 18 } }));
  });

  it("derives a clean, personalized thank-you name and provides a safe fallback", () => {
    expect(waitlistThankYouName("eddy.edison@example.com")).toBe("eddy edison");
    expect(waitlistThankYouName(" ")).toBe("future builder");
  });
});
