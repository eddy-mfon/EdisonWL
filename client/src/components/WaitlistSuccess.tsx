import React from "react";
import { CornerDownRight } from "lucide-react";
import { waitlistThankYouName } from "@/lib/conversionAnalytics";

type WaitlistSuccessProps = {
  email: string;
  markSrc: string;
  onReturn: () => void;
};

/** The staged post-submission scene used by Home’s GSAP timeline. */
export function WaitlistSuccess({ email, markSrc, onReturn }: WaitlistSuccessProps) {
  return (
    <div className="success-state" role="status" aria-live="polite">
      <div className="success-veil" />
      <div className="success-constellation" aria-hidden="true"><i /><i /><i /><i /><i /><i /></div>
      <div className="success-core"><span className="success-ring ring-1" /><span className="success-ring ring-2" /><img src={markSrc} alt="" /></div>
      <div className="success-copy">
        <p className="eyebrow warm">Signal received</p>
        <h2>Thank you,<br /><em>{waitlistThankYouName(email)}.</em></h2>
        <p>Your signal is now part of the field. We’ll be in touch when Edison is ready to move.</p>
        <button className="text-cta" onClick={onReturn}>Return to the beginning <CornerDownRight size={18} /></button>
      </div>
    </div>
  );
}

export function shouldAnimateWaitlistSuccess(prefersReducedMotion: boolean) {
  return !prefersReducedMotion;
}
