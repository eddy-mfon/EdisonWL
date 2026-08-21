# Upgrade Verification Notes

Browser verification on 2026-08-18 confirmed that the live Edison preview loads the full narrative sequence, including the hero, fragmentation chapter, Edison core, transformation sequence, four use cases, vision, and waitlist form.

The first live scroll transitioned cleanly from the hero into the fragmentation scene, with the cinematic background and chapter content remaining visible and structurally intact. The desktop and mobile captures confirmed that the brand lockup, headline treatment, image fields, navigation, and responsive hero composition render correctly.

The persistent waitlist contract and alert formatting are covered by Vitest. Live credential checks authenticated the configured Telegram bot and Gmail SMTP sender without sending a test submission or generating external notification noise.

The final device-mockup inspection confirmed two completed, non-placeholder 2560×1440 PNG assets. The hero asset presents a polished graphite laptop and upright phone with a coherent dark Edison chatbot UI, action cards, and restrained yellow, lime, cyan, and pink signals. The CTA asset presents a high-quality graphite laptop with a dark Edison workspace and a clear yellow action-plan panel. Both assets are suitable for their implemented placements.

On 2026-08-20, the rebuilt conversion homepage was visually checked at desktop and mobile viewports. The active hero image `/manus-storage/edison-clean-devices-transparent_227fcd5e.png` loaded as a completed phone-and-laptop composition. In both captures, the device pair sat directly on Edison’s dark hero field with no rectangular image panel or scene backdrop; the mobile composition stayed within the viewport and the desktop composition retained clear space around the supporting copy.

The active 2560×1440 hero PNG was also inspected as an RGBA asset. Its corners have near-zero alpha (4, 6, 17, and 16 out of 255) and 54.02% of its pixels are fully transparent, consistent with a cutout-style device asset rather than an opaque rectangular hero image. Browser checks separately confirmed that the rendered `.clean-device-visual` figure uses a transparent background at both target breakpoints.

On 2026-08-20, the homepage’s revised final CTA was checked at 1280×900 and 390×844. Its email-only waitlist field and concise **Join waitlist** action remain readable and unclipped; the desktop layout keeps them inline, while the mobile layout stacks them cleanly.

On 2026-08-20, the supplied forest image was verified as the hero background at 1280×900 and 390×844. The tree line remains visible around the Edison device scene, the hero resolves to its deep black lower edge, and all subsequent landing-page sections continue on the matching deep-black background without a visible color seam.

On 2026-08-20, the sharpened forest hero treatment and simplified final CTA were checked at 1280×900 and 390×844. The higher-clarity pine silhouettes remain legible around the device scene, the hero fades into the matching #050202 base, and the CTA has a plain black surface with no orbit or glow circles. The compact Join waitlist control remains visible and unclipped at both widths.
