import { describe, expect, it } from "vitest";
import { buildWaitlistCsv } from "./waitlistCsv";

describe("buildWaitlistCsv", () => {
  it("creates a comma-safe CSV with the essential owner export fields", () => {
    const csv = buildWaitlistCsv([{
      id: 5,
      fullName: "Anonymous",
      email: "person@example.com",
      role: "Waitlist",
      problem: "A suggestion, with a comma",
      currentProcess: null,
      betaAccess: 1,
      indispensableFeature: "A suggestion, with a comma",
      notificationStatus: "sent",
      createdAt: new Date("2026-08-18T12:00:00.000Z"),
    }]);

    expect(csv).toContain("submitted_at_utc");
    expect(csv).toContain('"A suggestion, with a comma"');
    expect(csv).toContain('"person@example.com"');
  });
});
