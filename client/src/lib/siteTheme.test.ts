import { describe, expect, it } from "vitest";
import { nextTheme, normalizeTheme } from "./siteTheme";

describe("site theme helpers", () => {
  it("accepts only the two supported display modes", () => {
    expect(normalizeTheme("dark")).toBe("dark");
    expect(normalizeTheme("light")).toBe("light");
    expect(normalizeTheme("system")).toBeNull();
  });

  it("toggles cleanly between dark and light", () => {
    expect(nextTheme("dark")).toBe("light");
    expect(nextTheme("light")).toBe("dark");
  });
});
