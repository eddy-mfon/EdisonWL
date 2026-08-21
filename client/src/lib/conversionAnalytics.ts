export type ConversionAnalyticsTarget = {
  umami?: { track?: (event: string, data?: Record<string, number>) => void };
  dispatchEvent: (event: Event) => boolean;
  CustomEvent: new (type: string, init?: CustomEventInit) => Event;
};

/** Report a confirmed server-side join to optional page analytics and to the app event stream. */
export function reportWaitlistConversion(target: ConversionAnalyticsTarget, totalSubmissions?: number) {
  const data = typeof totalSubmissions === "number" ? { total_submissions: totalSubmissions } : undefined;
  target.umami?.track?.("waitlist_joined", data);
  target.dispatchEvent(new target.CustomEvent("edison:waitlist_joined", { detail: { totalSubmissions } }));
}

/** Create a respectful personal acknowledgement without storing a visitor's address in the UI. */
export function waitlistThankYouName(email: string) {
  const localPart = email.trim().split("@")[0]?.replace(/[._-]+/g, " ").trim();
  return localPart || "future builder";
}
