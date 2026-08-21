import { beforeEach, describe, expect, it, vi } from "vitest";

const configureWebhook = vi.hoisted(() => vi.fn());

vi.mock("./telegramReporting", () => ({ configureTelegramReportingWebhook: configureWebhook }));

import { appRouter } from "./routers";

function ownerCaller(host: string) {
  return appRouter.createCaller({
    user: { id: 1, role: "admin" },
    req: { protocol: "https", header: (name: string) => name === "host" ? host : undefined },
    res: {},
  } as never);
}

describe("telegram.configureReporting", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    configureWebhook.mockResolvedValue({ url: "https://edisonexec-vxw4fmwm.manus.space/api/telegram/reports" });
  });

  it("returns non-blocking guidance in temporary preview instead of throwing an API error", async () => {
    await expect(ownerCaller("3000-preview.manus.computer").telegram.configureReporting()).resolves.toEqual({ activated: false, requiresPublishedDomain: true });
    expect(configureWebhook).not.toHaveBeenCalled();
  });

  it("activates the reporting webhook from a durable published domain", async () => {
    await expect(ownerCaller("edisonexec-vxw4fmwm.manus.space").telegram.configureReporting()).resolves.toEqual({
      activated: true,
      requiresPublishedDomain: false,
      url: "https://edisonexec-vxw4fmwm.manus.space/api/telegram/reports",
    });
    expect(configureWebhook).toHaveBeenCalledWith("https://edisonexec-vxw4fmwm.manus.space");
  });
});
