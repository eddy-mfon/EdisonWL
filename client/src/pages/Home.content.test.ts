import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { audiences, faqs, heroPrompts, workflowSteps } from "./Home";

describe("Edison high-conversion landing-page copy contracts", () => {
  it("keeps the supplied workflow model and plain-English questions", () => {
    expect(workflowSteps.map(step => step.title)).toEqual(["Connect", "Ask", "Move"]);
    expect(workflowSteps[1]?.prompts).toEqual([
      "Why did we choose this approach?",
      "What did the client ask for?",
      "What are we supposed to do next?",
    ]);
  });

  it("keeps the supplied audience order and four high-conversion FAQ answers", () => {
    expect(audiences.map(audience => audience.title)).toEqual(["Startups", "Growing teams", "Individuals"]);
    expect(faqs).toHaveLength(4);
    expect(faqs.every(([question, answer]) => question.length > 12 && answer.length > 70)).toBe(true);
  });

  it("keeps a concise set of interactive chat questions in the home-page hero", () => {
    expect(heroPrompts).toHaveLength(3);
    expect(heroPrompts.every(prompt => prompt.question.endsWith("?") && prompt.answer.length > 80 && prompt.source.length > 12)).toBe(true);
  });

  it("keeps the final CTA as a concise email-only waitlist form", () => {
    const source = readFileSync(new URL("./Home.tsx", import.meta.url), "utf8");
    const editorialStyles = readFileSync(new URL("../editorial-retheme.css", import.meta.url), "utf8");
    expect(source).toContain('className="cta-waitlist-form"');
    expect(source).toContain('type="email" name="email"');
    expect(source).toContain('<span>Join waitlist</span>');
    expect(source).toContain('href="#waitlist"');
    expect(source).toContain('final-cta-section" id="waitlist"');
    expect(source).not.toContain('cta-orbit');
    expect(source).toContain('className="cta-success-mark"');
    expect(source).toContain('is on the early-access list.');
    expect(source).toContain('setCtaSubmittedEmail(email)');
    expect(source).toContain('Enter a valid email address.');
    expect(source).toContain('This email is already on the waitlist.');
    expect(source).toContain('className="cta-submit-spinner"');
    expect(source).toContain('aria-busy={submitCtaWaitlist.isPending}');
    expect(editorialStyles).toContain('background: #050202;');
    expect(editorialStyles).toContain('font-size: 10px;');
    expect(editorialStyles).not.toContain('.cta-orbit');
    expect(editorialStyles).toContain('@keyframes cta-success-draw');
    expect(editorialStyles).toContain('@keyframes cta-submit-spin');
    expect(editorialStyles).toContain('@media (prefers-reduced-motion: reduce)');
  });
});
