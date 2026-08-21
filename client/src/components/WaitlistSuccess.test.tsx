import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { shouldAnimateWaitlistSuccess, WaitlistSuccess } from "./WaitlistSuccess";

describe("WaitlistSuccess", () => {
  it("renders the personalized, cinematic success scene after a confirmed join", () => {
    const markup = renderToStaticMarkup(<WaitlistSuccess email="eddy.edison@example.com" markSrc="/mark.png" onReturn={() => undefined} />);
    expect(markup).toContain("Signal received");
    expect(markup).toContain("Thank you,");
    expect(markup).toContain("eddy edison.");
    expect(markup).toContain("success-constellation");
    expect(markup).toContain('role="status"');
  });

  it("gates the cinematic timeline when reduced motion is requested", () => {
    expect(shouldAnimateWaitlistSuccess(false)).toBe(true);
    expect(shouldAnimateWaitlistSuccess(true)).toBe(false);
  });
});
