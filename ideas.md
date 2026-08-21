# Edison — Design Direction

## Three possible approaches

| Theme Name | Very Brief Intro | Probability |
| --- | --- | --- |
| Obsidian Foundry | A cinematic product reveal in which scattered signal is pulled through black liquid metal and emerges as lucid action. It feels physical, deliberate, and quietly powerful. | 0.04 |
| Editorial Signal | A warm, print-inspired intelligence system pairing ruthless typography with tactile paper, amber annotations, and strong editorial pacing. It privileges clarity over spectacle. | 0.07 |
| Alpine Instrument | A bright, architectural system of cool surfaces, measurement lines, and restrained utility that makes execution feel like precision equipment. | 0.02 |

## Chosen approach — Obsidian Foundry

### Design Movement

**Cinematic industrial minimalism**: a product-launch visual language influenced by sculptural black chrome, high-end editorial systems, and measured film-title pacing. The site behaves like a reveal, not a brochure.

### Core Principles

1. **From noise to gravity**: each chapter reduces visual disorder and increases compositional calm.
2. **Whitened space is earned**: near-black negative space gives concise copy force rather than decorating it.
3. **Material before metaphor**: liquid metal, heat, orbit, and convergence communicate intelligence without generic AI graphics.
4. **Motion has narrative work**: particles gather, cards collide, and content resolves only when the story calls for it.

### Color Philosophy

The page begins in **deep obsidian** to make fragmentation feel infinite, then lets **molten copper, burnt gold, and amber** mark moments of formation, focus, and forward motion. White is reserved for decisive copy and active interface states; soft gray carries support text without diluting the atmosphere. This is warmth as intention, not decoration.

### Layout Paradigm

The experience is a **vertical cinematic track** made of oversized scenes and off-axis editorial anchors. Instead of a repeated centered-card grid, section copy alternates between left-edge captions, right-aligned declarations, and full-bleed visual fields. Pinned-feeling panels compress the scroll into deliberate chapters.

### Signature Elements

1. **The Edison aperture**: a circular broken-ring core that denotes attention, intake, and execution.
2. **Copper trajectories**: hairline warm trails that connect scattered inputs to one decisive destination.
3. **Obsidian panes**: restrained translucent information fragments used only while depicting fragmentation.

### Interaction Philosophy

Scrolling is the principal control: it advances the narrative in calm, observable steps. Hover states warm slightly and tighten contrast. The waitlist form transitions from a survey into an act of contribution, with its submitted signal visibly drawn toward the aperture.

### Animation

Use opacity and transform-led motion with strong cinematic easing. Hero background drift is nearly imperceptible; text appears by line and word with 70–110ms cadence; information panes arrive in scattered paths and settle with no bounce. Trajectories should move toward the Edison core during transformation. All nonessential animation is disabled under reduced-motion preferences.

### Typography System

**Manrope** is the compact, technical sans for navigation, body copy, labels, and form fields. **DM Sans** is the display workhorse, in tight tracking and oversized weights for declarative statements. Headlines use 700–800 weight with a 0.92–1.0 line-height; tiny all-caps labels carry wide letter spacing; paragraphs stay short and breathable.

### Brand Essence

**Edison turns every scattered signal into the next clear move for people and teams who refuse to let important work disappear.**

Personality: **deliberate, lucid, magnetic**.

### Brand Voice

Headlines are sparse, direct, and built for a pause. CTAs invite participation rather than manufacture urgency. Microcopy is plainspoken and useful.

> “Information is everywhere. Execution is rare.”

> “Bring the signal. We’ll help it move.”

### Wordmark & Logo

The mark is an **asymmetric aperture**: a thick ring interrupted at one point, with an offset inner void. It reads as an attentive eye, an orbit, and a thought resolving into direction. The wordmark sits beside it in a custom-feeling, rounded geometric sans at substantial scale—never as default UI text.

### Signature Brand Color

**Edison Copper — #FF9A5A**. A luminous, warm accent used sparingly to show attention becoming motion.

## Style Decisions

- The supplied artwork is the visual ground truth: deep black liquid metal with controlled copper, bronze, and amber light.
- Do not use generic SaaS blue, purple gradients, neon cyberpunk motifs, or repeated rounded cards.
- Preserve large black text-safe zones over every visual field; typography must always win legibility.
- Form controls may be gently rounded, but primary sections, panels, and composition stay structural and editorial rather than pill-heavy.
- The Edison wordmark uses an expanded, tightly tracked geometric display treatment with a copper activity dot so it reads as an authored lockup alongside the aperture, rather than ordinary navigation copy.
- Each chapter must visibly direct signal toward an aperture through warm trajectory lines, orbit structures, or converging fragments.
- Use cases intentionally vary their editorial staging and trajectory geometry so the story continues to evolve rather than becoming a repeated module.
- The waitlist is a contribution ritual: the form’s signal path resolves into an Edison aperture and its success state expands that aperture into the closing moment.

## Redesign Addendum — Edison Signal Board

The refreshed public experience shifts from molten-metal chapters to a **playful signal board**. It borrows the supplied reference’s most useful qualities—an inky black canvas, oversized white message, warm-edged sticker shapes, and loose, energetic composition—without copying its brand, wording, or layout. Edison’s copper becomes a broader friendly palette of **apricot, lemon, pool blue, coral, and soft lime**, used only in the hero stickers and small moments of emphasis.

The page follows one plain-language route: **Hero → About → Students → Small Companies → Enterprises → CTA → Waitlist → Footer**. Every section uses a simple promise, a short explanation, and one clear next step. The hero works as a small world of movable “signal” stickers around the idea that Edison helps you get things done. Later sections are calmer and more spacious so the page does not become a wall of decoration.

The new motion language uses GSAP as a connective system. Hero stickers drift in, tilt on hover, and settle around the main line. Section copy rises in short, readable beats, while audience sections respond to the pointer with gentle depth and a single accent trail. The CTA and waitlist use a more deliberate pull-in sequence. All motion remains transform- and opacity-led and is skipped when reduced motion is requested.
