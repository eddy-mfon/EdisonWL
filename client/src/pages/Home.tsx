import { FormEvent, useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowDown, ArrowUpRight, Check, ChevronDown, LoaderCircle, Sparkles, WandSparkles } from "lucide-react";
import { reportWaitlistConversion } from "@/lib/conversionAnalytics";
import { trpc } from "@/lib/trpc";

gsap.registerPlugin(ScrollTrigger);

export const heroPrompts = [
  { question: "What did we decide about the launch?", answer: "The team agreed to launch the core workspace first, then add integrations after early users have shared feedback.", source: "Launch planning · 3 linked notes" },
  { question: "What did the client ask for?", answer: "They asked for a simpler handoff, a clearer timeline, and one place to review the final direction.", source: "Client call · Monday" },
  { question: "What am I supposed to do next?", answer: "Share the revised brief, confirm owners for the first release, and bring the open questions to Thursday’s check-in.", source: "Project plan · Next steps" },
];

export const workflowSteps = [
  { number: "01", title: "Connect", copy: "Bring in your documents, notes, conversations, decisions, and important information." },
  { number: "02", title: "Ask", copy: "Ask Edison questions in plain English.", prompts: ["Why did we choose this approach?", "What did the client ask for?", "What are we supposed to do next?"] },
  { number: "03", title: "Move", copy: "Get the answer, the context behind it, and the next step — without hunting through your entire workspace." },
];

export const audiences = [
  { title: "Startups", copy: "Your team is moving fast and information is everywhere. Edison helps keep the context behind the work from getting lost." },
  { title: "Growing teams", copy: "People shouldn’t need to ask around just to understand what happened last week. Edison gives your team a shared memory." },
  { title: "Individuals", copy: "Projects, research, ideas, notes, and decisions shouldn’t disappear into a pile of apps. Keep the important stuff connected." },
];

export const faqs = [
  ["Is Edison an AI?", "AI is part of Edison, but Edison isn’t meant to be another chatbot. The goal is to make AI useful by giving it context from the work you actually care about."],
  ["What can I put into Edison?", "We’re starting with the information that usually gets scattered: documents, notes, ideas, decisions, conversations, tasks, and project context."],
  ["Is Edison for individuals or teams?", "Both. We’re starting with people and small teams who have a lot of information to keep track of, then expanding from there."],
  ["When will Edison launch?", "We’re currently building the first version with early users. Join the waitlist and we’ll let you know when it’s ready."],
];

function SectionLabel({ children }: { children: string }) {
  return <p className="conversion-kicker">{children}</p>;
}

export default function Home() {
  const rootRef = useRef<HTMLElement>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [ctaSubmitted, setCtaSubmitted] = useState(false);
  const [ctaSubmittedEmail, setCtaSubmittedEmail] = useState("");
  const [ctaSubmissionError, setCtaSubmissionError] = useState<string | null>(null);
  const submitCtaWaitlist = trpc.waitlist.submit.useMutation({
    onSuccess: result => {
      if (!result.success) {
        if ("alreadyRegistered" in result && result.alreadyRegistered) {
          setCtaSubmissionError("This email is already on the waitlist.");
          return;
        }
        const minutes = Math.max(1, Math.ceil(result.retryAfterSeconds / 60));
        setCtaSubmissionError(`Please wait about ${minutes} minute${minutes === 1 ? "" : "s"} before trying again.`);
        return;
      }
      setCtaSubmitted(true);
      reportWaitlistConversion(window, "totalSubmissions" in result ? result.totalSubmissions : undefined);
    },
    onError: error => setCtaSubmissionError(/invalid email/i.test(error.message) ? "Enter a valid email address." : "That did not go through. Please try again."),
  });

  const submitCta = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setCtaSubmissionError(null);
    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") || "").trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setCtaSubmissionError("Enter a valid email address.");
      return;
    }
    setCtaSubmittedEmail(email);
    submitCtaWaitlist.mutate({
      email,
      website: String(form.get("website") || ""),
    });
  };

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const context = gsap.context(() => {
      const ease = "power3.out";
      gsap.timeline({ defaults: { ease } })
        .from(".conversion-nav", { y: -20, opacity: 0, duration: .62 })
        .from(".hero-copy > *", { y: 38, opacity: 0, duration: .72, stagger: .1 }, "-=.22")
        .from(".hero-device-scene", { y: 30, scale: .965, opacity: 0, duration: 1.05 }, "-=.58")
        .from(".hero-signal", { y: 18, opacity: 0, duration: .48 }, "-=.45");
      gsap.utils.toArray<HTMLElement>(".conversion-section").forEach(section => {
        gsap.from(section.querySelectorAll(".reveal"), { y: 44, opacity: 0, duration: .75, stagger: .09, ease, scrollTrigger: { trigger: section, start: "top 80%", once: true } });
      });
      gsap.utils.toArray<HTMLElement>(".workflow-card, .audience-panel, .vision-question, .faq-item").forEach((item, index) => {
        gsap.from(item, { y: 34, opacity: 0, duration: .66, ease, scrollTrigger: { trigger: item, start: "top 87%", once: true }, delay: index % 3 * .04 });
      });
      gsap.from(".final-cta-copy", { y: 42, opacity: 0, duration: .78, ease, scrollTrigger: { trigger: ".final-cta-section", start: "top 78%", once: true } });
      gsap.to(".hero-device-scene", { yPercent: -6, ease: "none", scrollTrigger: { trigger: ".conversion-hero", start: "top top", end: "bottom top", scrub: 1 } });
      gsap.to(".hero-glow", { scale: 1.18, ease: "none", scrollTrigger: { trigger: ".conversion-hero", start: "top top", end: "bottom top", scrub: 1 } });
    }, root);
    return () => context.revert();
  }, []);

  return (
    <main className="conversion-site" ref={rootRef}>
      <section className="conversion-hero hero-reference" id="product">
        <div className="hero-glow" aria-hidden="true" />
        <header className="conversion-nav reference-nav">
          <a className="conversion-brand" href="/">edison<span>•</span></a>
          <nav className="conversion-links" aria-label="Main navigation"><a href="#product">Product</a><a href="#how-it-works">How it works</a><a href="#who-its-for">Who it’s for</a></nav>
          <div className="nav-actions"><a className="reference-demo" href="#how-it-works">See how it works</a><a className="reference-signin" href="#waitlist">Get early access</a></div>
        </header>
        <div className="hero-layout hero-layout-reference">
          <div className="hero-copy hero-copy-reference">
            <SectionLabel>The memory for your work</SectionLabel>
            <h1>Stop losing <em>important work</em><br />to scattered tabs, chats, and documents.</h1>
            <p>Edison brings your team’s knowledge, ideas, decisions, and next steps into one intelligent place — so you can find what matters without asking five people or digging through twenty tabs.</p>
          </div>
          <figure className="hero-device-scene" aria-label="Phone loading Edison beside a laptop showing the Edison work-memory workspace">
            <div className="device-scene-halo" aria-hidden="true" />
            <picture>
              <source srcSet="/manus-storage/edison-device-scene-final-alpha_f7a3802c.webp" type="image/webp" />
              <img src="/manus-storage/edison-device-scene-final-alpha_61fc65f0.png" alt="Edison phone loading work memory beside a laptop workspace with a memory rail, ask field, and next actions" width="2560" height="1440" loading="eager" fetchPriority="high" decoding="async" />
            </picture>
          </figure>
        </div>
        <div className="reference-footer-proof"><span>One workspace</span><i>•</i><span>Clear context</span><i>•</i><span>Useful next steps</span></div>
      </section>

      <section className="conversion-section problem-section" id="problem">
        <div className="section-intro reveal"><SectionLabel>The problem</SectionLabel><h2>Your team already knows the answer.<em>You just have to find it.</em></h2></div>
        <div className="problem-copy reveal"><p>The decision was made in Slack.</p><p>The document is somewhere in Drive.</p><p>The notes are sitting in someone’s laptop.</p><p>And the person who knows what happened is currently offline.</p><strong>The information exists. The problem is finding it.</strong><p>Edison is being built to change that.</p></div>
      </section>

      <section className="conversion-section how-section" id="how-it-works">
        <div className="section-intro reveal"><SectionLabel>How it works</SectionLabel><h2>Give Edison your <em>knowledge.</em></h2><p>Edison connects the things your team already works with and turns them into something you can actually use.</p></div>
        <div className="workflow-grid">{workflowSteps.map(step => <article className="workflow-card" key={step.number}><span>{step.number}</span><h3>{step.title}</h3><p>{step.copy}</p>{step.prompts && <div className="prompt-list">{step.prompts.map(prompt => <p key={prompt}>“{prompt}”</p>)}</div>}</article>)}</div>
      </section>

      <section className="conversion-section difference-section" id="difference">
        <div className="difference-copy reveal"><SectionLabel>The difference</SectionLabel><h2>Not another place to put your work.<em>A place that understands it.</em></h2><p>Edison isn’t trying to give you another dashboard full of tabs. It’s being built to understand the information your team already creates — and make that information useful when you need it.</p></div>
        <div className="difference-points reveal" aria-label="Edison benefits">{["Less searching.", "Less repeating yourself.", "Less “where did we put that?”", "More getting things done."].map((point, index) => <p className={index === 3 ? "is-highlight" : ""} key={point}><Check size={17} />{point}</p>)}</div>
      </section>

      <section className="conversion-section audience-section" id="who-its-for">
        <div className="section-intro reveal"><SectionLabel>Who it’s for</SectionLabel><h2>Built for people who have <em>too much to remember.</em></h2></div>
        <div className="audience-grid">{audiences.map((audience, index) => <article className="audience-panel" key={audience.title}><span>0{index + 1}</span><h3>{audience.title}</h3><p>{audience.copy}</p></article>)}</div>
      </section>

      <section className="conversion-section vision-section" id="vision">
        <div className="section-intro reveal"><SectionLabel>The vision</SectionLabel><h2>Imagine never having to ask:</h2></div>
        <div className="vision-questions">{["Where is that document?", "What did we decide?", "Why did we do it this way?", "What did the client say?", "What am I supposed to do next?"].map(question => <p className="vision-question" key={question}>“{question}”</p>)}</div>
        <div className="vision-close reveal"><h3>That’s the Edison we’re building.</h3><p>A place where your work doesn’t just live.<strong>It makes sense.</strong></p></div>
      </section>

      <section className="conversion-section faq-section-new" id="faq">
        <div className="section-intro reveal"><SectionLabel>FAQ</SectionLabel><h2>Clear answers, <em>before you join.</em></h2></div>
        <div className="faq-list-new">{faqs.map(([question, answer], index) => <article className={`faq-item${openFaq === index ? " is-open" : ""}`} key={question}><button className="faq-trigger" type="button" aria-expanded={openFaq === index} aria-controls={`faq-answer-${index}`} onClick={() => setOpenFaq(openFaq === index ? null : index)}><span>{question}</span><ChevronDown size={19} /></button><div className="faq-answer" id={`faq-answer-${index}`} role="region" aria-label={question}><p>{answer}</p></div></article>)}</div>
      </section>

      <section className="final-cta-section" id="waitlist"><div className="final-cta-copy"><SectionLabel>Early access</SectionLabel><h2>Keep your work<em>in reach.</em></h2><p>Join the waitlist.</p>{ctaSubmitted ? <div className="cta-waitlist-success" role="status"><span className="cta-success-mark" aria-hidden="true"><Check size={16} strokeWidth={2.5} /></span><span><strong>You’re on the list.</strong><small><b>{ctaSubmittedEmail}</b> is on the early-access list.</small></span></div> : <><form className="cta-waitlist-form" onSubmit={submitCta} noValidate><label><span className="sr-only">Email address</span><input required type="email" name="email" autoComplete="email" placeholder="you@example.com" aria-label="Email address" aria-invalid={Boolean(ctaSubmissionError)} onChange={() => ctaSubmissionError && setCtaSubmissionError(null)} /></label><div className="honeypot" aria-hidden="true"><label>Website<input tabIndex={-1} autoComplete="off" name="website" /></label></div><button className="conversion-button primary" type="submit" disabled={submitCtaWaitlist.isPending} aria-busy={submitCtaWaitlist.isPending}>{submitCtaWaitlist.isPending ? <><LoaderCircle className="cta-submit-spinner" size={14} aria-hidden="true" /><span>Joining…</span></> : <><span>Join waitlist</span><ArrowUpRight size={18} /></>}</button></form>{ctaSubmissionError && <p className="cta-form-error" role="alert">{ctaSubmissionError}</p>}</>}</div></section>

      <footer className="conversion-footer"><div><a className="conversion-brand" href="/">edison<span>•</span></a><p>The intelligent home for your work.</p></div><nav aria-label="Legal"><a href="/privacy">Privacy</a><a href="/terms">Terms</a></nav><span>© 2026 Edison</span></footer>
    </main>
  );
}
