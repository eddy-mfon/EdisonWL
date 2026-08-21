import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  consumeWaitlistRateLimit: vi.fn(),
  createWaitlistSubmission: vi.fn(),
  getWaitlistStats: vi.fn(),
  getWaitlistSubmissionByEmail: vi.fn(),
  listWaitlistSubmissions: vi.fn(),
  recordWaitlistConversion: vi.fn(),
  updateWaitlistNotificationStatus: vi.fn(),
  notifyWaitlistSubmission: vi.fn(),
}));

vi.mock("./db", () => ({
  consumeWaitlistRateLimit: mocks.consumeWaitlistRateLimit,
  createWaitlistSubmission: mocks.createWaitlistSubmission,
  getWaitlistStats: mocks.getWaitlistStats,
  getWaitlistSubmissionByEmail: mocks.getWaitlistSubmissionByEmail,
  listWaitlistSubmissions: mocks.listWaitlistSubmissions,
  recordWaitlistConversion: mocks.recordWaitlistConversion,
  updateWaitlistNotificationStatus: mocks.updateWaitlistNotificationStatus,
}));

vi.mock("./waitlistNotifications", () => ({
  notifyWaitlistSubmission: mocks.notifyWaitlistSubmission,
}));

import { appRouter } from "./routers";

describe("waitlist.submit", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.consumeWaitlistRateLimit.mockResolvedValue({ allowed: true, retryAfterSeconds: 0 });
    mocks.createWaitlistSubmission.mockResolvedValue(27);
    mocks.getWaitlistSubmissionByEmail.mockResolvedValue(null);
    mocks.getWaitlistStats.mockResolvedValue({ allTimeSubmissions: 14, todaySubmissions: 3, weekSubmissions: 9, trackedConversions: 14 });
    mocks.listWaitlistSubmissions.mockResolvedValue([{
      id: 27,
      fullName: "Anonymous",
      email: "eddy@example.com",
      role: "Waitlist",
      problem: "Reliable follow-through",
      currentProcess: null,
      betaAccess: 1,
      indispensableFeature: "Reliable follow-through",
      notificationStatus: "sent",
      createdAt: new Date("2026-08-18T12:00:00.000Z"),
    }]);
    mocks.updateWaitlistNotificationStatus.mockResolvedValue(undefined);
    mocks.notifyWaitlistSubmission.mockResolvedValue({ emailSent: true, telegramSent: true, deliveryErrors: [] });
  });

  it("persists a minimal public signal and records a successful delivery", async () => {
    const caller = appRouter.createCaller({ user: null, req: {}, res: {} } as never);
    const result = await caller.waitlist.submit({
      email: "eddy@example.com",
      suggestion: "Reliable follow-through",
    });

    expect(result).toEqual({ success: true, totalSubmissions: 14 });
    expect(mocks.createWaitlistSubmission).toHaveBeenCalledWith(expect.objectContaining({
      fullName: "Anonymous",
      problem: "Reliable follow-through",
      betaAccess: 1,
      notificationStatus: "pending",
    }));
    expect(mocks.notifyWaitlistSubmission).toHaveBeenCalledWith({ id: 27, email: "eddy@example.com", suggestion: "Reliable follow-through" });
    expect(mocks.recordWaitlistConversion).toHaveBeenCalledWith(27);
    expect(mocks.updateWaitlistNotificationStatus).toHaveBeenCalledWith(27, "sent");
  });

  it("silently accepts a filled honeypot without persisting or notifying", async () => {
    const caller = appRouter.createCaller({ user: null, req: {}, res: {} } as never);
    await expect(caller.waitlist.submit({ email: "bot@example.com", website: "https://spam.invalid" })).resolves.toEqual({ success: true });
    expect(mocks.createWaitlistSubmission).not.toHaveBeenCalled();
    expect(mocks.notifyWaitlistSubmission).not.toHaveBeenCalled();
  });

  it("returns a friendly retry window without writing when the email is rate-limited", async () => {
    mocks.consumeWaitlistRateLimit.mockResolvedValue({ allowed: false, retryAfterSeconds: 480 });
    const caller = appRouter.createCaller({ user: null, req: {}, res: {} } as never);
    await expect(caller.waitlist.submit({ email: "eddy@example.com" })).resolves.toEqual({ success: false, rateLimited: true, retryAfterSeconds: 480 });
    expect(mocks.createWaitlistSubmission).not.toHaveBeenCalled();
    expect(mocks.notifyWaitlistSubmission).not.toHaveBeenCalled();
  });

  it("rejects an already-registered email without writing, notifying, or recording a conversion", async () => {
    mocks.getWaitlistSubmissionByEmail.mockResolvedValue({ id: 12 });
    const caller = appRouter.createCaller({ user: null, req: {}, res: {} } as never);
    await expect(caller.waitlist.submit({ email: "eddy@example.com" })).resolves.toEqual({ success: false, alreadyRegistered: true });
    expect(mocks.createWaitlistSubmission).not.toHaveBeenCalled();
    expect(mocks.notifyWaitlistSubmission).not.toHaveBeenCalled();
    expect(mocks.recordWaitlistConversion).not.toHaveBeenCalled();
  });

  it("returns the public all-time submission count without exposing personal data", async () => {
    const caller = appRouter.createCaller({ user: null, req: {}, res: {} } as never);
    await expect(caller.waitlist.publicStats()).resolves.toEqual({ totalSubmissions: 14 });
  });

  it("returns a CSV export only to the owner", async () => {
    const owner = appRouter.createCaller({ user: { id: 1, role: "admin" }, req: {}, res: {} } as never);
    const exportResult = await owner.waitlist.exportCsv();
    expect(exportResult.filename).toMatch(/^edison-waitlist-\d{4}-\d{2}-\d{2}\.csv$/);
    expect(exportResult.csv).toContain("eddy@example.com");

    const visitor = appRouter.createCaller({ user: { id: 2, role: "user" }, req: {}, res: {} } as never);
    await expect(visitor.waitlist.exportCsv()).rejects.toMatchObject({ code: "FORBIDDEN" });
  });
});
