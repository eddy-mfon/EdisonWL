import { FormEvent, useEffect, useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { WaitlistSuccess, shouldAnimateWaitlistSuccess } from "@/components/WaitlistSuccess";
import { reportWaitlistConversion } from "@/lib/conversionAnalytics";
import { trpc } from "@/lib/trpc";

const MARK = "/manus-storage/edison-mark_bf38f3ef.png";

export default function Waitlist() {
  const rootRef = useRef<HTMLElement>(null);
  const [submitted, setSubmitted] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState("");
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const submitWaitlist = trpc.waitlist.submit.useMutation({
    onSuccess: result => {
      if (!result.success) {
        if ("alreadyRegistered" in result && result.alreadyRegistered) {
          setSubmissionError("This email is already on the waitlist.");
          return;
        }
        const minutes = Math.max(1, Math.ceil(result.retryAfterSeconds / 60));
        setSubmissionError(`Please wait about ${minutes} minute${minutes === 1 ? "" : "s"} before trying again.`);
        return;
      }
      const totalSubmissions = "totalSubmissions" in result ? result.totalSubmissions : undefined;
      setSubmitted(true);
      reportWaitlistConversion(window, totalSubmissions);
    },
    onError: error => setSubmissionError(/invalid email/i.test(error.message) ? "Enter a valid email address." : "That did not go through. Please try again."),
  });

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const context = gsap.context(() => {
      gsap.timeline({ defaults: { ease: "power3.out" } })
        .from(".waitlist-nav", { y: -18, opacity: 0, duration: .58 })
        .from(".waitlist-intro > *", { y: 22, opacity: 0, duration: .6, stagger: .09 }, "-=.18")
        .from(".waitlist-card", { y: 24, scale: .98, opacity: 0, duration: .62 }, "-=.32");
    }, root);
    return () => context.revert();
  }, []);

  useEffect(() => {
    if (!submitted || !shouldAnimateWaitlistSuccess(window.matchMedia("(prefers-reduced-motion: reduce)").matches)) return;
    const context = gsap.context(() => {
      gsap.timeline({ defaults: { ease: "power4.out" } })
        .fromTo(".success-veil", { scaleX: .12, transformOrigin: "left" }, { scaleX: 1, duration: .7 })
        .from(".success-core", { opacity: 0, scale: .75, y: 28, duration: .82 }, "-=.25")
        .from(".success-copy > *", { opacity: 0, y: 35, duration: .7, stagger: .09 }, "-=.38");
    }, rootRef);
    return () => context.revert();
  }, [submitted]);

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmissionError(null);
    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") || "").trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setSubmissionError("Enter a valid email address.");
      return;
    }
    setSubmittedEmail(email);
    submitWaitlist.mutate({ email, suggestion: String(form.get("suggestion") || "") || undefined, website: String(form.get("website") || "") });
  };

  return (
    <main className="conversion-site waitlist-page" ref={rootRef}>
      <header className="conversion-nav waitlist-nav editorial-nav">
        <a className="conversion-brand" href="/">edison<span>•</span></a>
        <div className="waitlist-nav-actions"><a className="back-home" href="/"><ArrowLeft size={16} /> Back to home</a></div>
      </header>
      {submitted ? <section className="waitlist-success-wrap"><WaitlistSuccess email={submittedEmail} markSrc={MARK} onReturn={() => window.location.assign("/")} /></section> : (
        <section className="waitlist-page-content waitlist-minimal-content">
          <div className="waitlist-copy waitlist-intro">
            <p className="conversion-kicker">Early access</p>
            <h1>Join <em>Edison.</em></h1>
            <p>Leave your email. Add a thought if you have one.</p>
          </div>
          <form className="waitlist-card" onSubmit={submit} noValidate>
            <div className="waitlist-card-top"><span>Join the waitlist</span></div>
            <label>Email address<input required type="email" name="email" autoComplete="email" placeholder="you@example.com" aria-invalid={Boolean(submissionError)} onChange={() => submissionError && setSubmissionError(null)} /></label>
            <label>Thoughts <small>Optional</small><textarea name="suggestion" rows={4} placeholder="What should Edison help you remember?" /></label>
            <div className="honeypot" aria-hidden="true"><label>Website<input tabIndex={-1} autoComplete="off" name="website" /></label></div>
            <button className="conversion-button form-submit" type="submit" disabled={submitWaitlist.isPending}>{submitWaitlist.isPending ? "Sending…" : "Join Edison"}<ArrowUpRight size={18} /></button>
            {submissionError && <p className="form-error" role="alert">{submissionError}</p>}
          </form>
        </section>
      )}
    </main>
  );
}
