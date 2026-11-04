# Motion, Typography and Front-end Build Tech for a Highly Animated, Fast, Accessible Small-Business Site (state as of 4 Nov 2026)

> **How this research was done:** WebFetch could not reach gsap.com, web.dev, MDN, caniuse.com or motion.dev from this session; they were outside its allowed network domains. The shared web-search budget also ran out partway through. To make up for it, much of the evidence comes straight from primary data that could be reached:
> - **npm registry metadata** for version numbers and dates (registry.npmjs.org, read 4 Nov 2026).
> - **caniuse's raw dataset**, updated 29 Oct 2026.
> - **The W3C `web-features` package v3.45.0** (2 Nov 2026) for Baseline status.
> - **The official GitHub repos** for the Interop 2026 README, MDN content, W3C WCAG Understanding docs, the Chromium metrics changelog, the Astro docs and each library's README.
> - **Google Fonts' METADATA.pb files and CSS2 API** for font licences, axes and file sizes.
> - **The library source in npm tarballs**, which I bundled myself with esbuild 0.28.2 and compressed with `gzip -9` to get bundle sizes.
>
> "Measured" means I produced the number in this session. The scratch files are in `/tmp/claude-0/-home-user-nestnrestcleaning/67aecbd2-25bd-57d0-a71b-323079773156/scratchpad/motion_tech/`. Current browser versions, from caniuse agent data: Chrome 156 (20 Oct 2026), Safari 27 (14 Sep 2026), Firefox 159 (27 Oct 2026).

---

## Q1. Motion trends 2025–2026: what's fresh, what's overused, and what reads as an "AI template" vs bespoke craft

### Takeaway
The sites that won top awards in the 2025 cycle use motion to tell a story built around one strong idea: OFF+BRAND's Lando Norris site was Site of the Year, and abeto's tiny WebGL planet "Messenger" won Developer Site of the Year. Generic effects bolted onto a template don't win.
In 2026, "AI template" is defined concretely: purple→blue gradients, a 1px grey border on every card, Inter headlines, three feature cards in a row, dark mode nobody asked for, and bento grids used by default.
Bespoke craft shows up as:
- type-led art direction
- motion that is specific to the brand's own story (for a cleaning company, things like folding, wiping, revealing, tidying)
- an anti-grid or editorial layout
- real photography instead of generic AI imagery

### Cited Findings
- **Awwwards Site of the Year 2025:** Lando Norris, by the studio OFF+BRAND. It also won Users' Choice. — [Awwwards Annual Awards winners](https://www.awwwards.com/annual-awards/winners); [Awwwards on X](https://x.com/awwwards/status/2028869511311507570); [Sites of the Year listing](https://www.awwwards.com/websites/sites_of_the_year/)
- **Awwwards Developer Site of the Year 2025:** "Messenger", by abeto, described as "a tiny WebGL planet, brought to life in your browser". abeto's Igloo Inc won the 2024 cycle (announced March 2025). — [Awwwards winners](https://www.awwwards.com/annual-awards/winners); [abeto on X](https://x.com/abeto_co)
- **GSAP on the Lando Norris site:** A YouTube breakdown is titled "Lando Norris Awwwards Site of the Year x Made With GSAP", so the site was likely built with GSAP. This is a weak source; I did not verify the site's code. — [YouTube](https://www.youtube.com/watch?v=R0o_nJzRAJw)
- **OFF+BRAND and Lenis:** OFF+BRAND is listed as a sponsor of the Lenis smooth-scroll library. This shows the studio supports Lenis, not that this particular site uses it. — [Lenis README](https://github.com/darkroomengineering/lenis)
- **What "AI slop" looks like in 2026,** according to one guide on the default output of AI coding tools:
  - purple→blue gradients
  - a grey 1px border on every card
  - Inter headlines
  - three feature cards in a row
  - unrequested dark mode
  - a bento grid "reached for by default"

  — [vibecodekit.dev, "AI Slop Design"](https://vibecodekit.dev/ai-slop-design)
- **Bento grids are now the default:** several trend roundups call bento grids "the default, not the exception" for feature sections. One warns that collapsing bento blocks to a single column on mobile "destroys the page's narrative flow". "Anti-grid brutalism" is described as the counter-movement. — [Bubble.io trends 2026](https://bubble.io/blog/web-design-trends/); [Line25](https://line25.com/articles/web-design-trends-2026/); [Fireart](https://fireart.studio/blog/the-best-web-design-trends/); [ThePlusAddons](https://theplusaddons.com/blog/web-design-trends-2026/)
- **Why sites are moving toward a human, imperfect look:** AI-generated design has made "clean and competent" look generic, and that is pushing sites toward looks that feel deliberately human-made and imperfect. — [Bubble.io](https://bubble.io/blog/web-design-trends/); [DEV Community, "What actually held up after six months"](https://dev.to/studiomeyer_io/web-design-trends-2026-what-actually-held-up-after-six-months-23p8)
- **Gradients:** plain linear gradients are described as passé. Mesh gradients and radial blur behind hero sections are the current version, and they are already widespread. — [Line25](https://line25.com/articles/web-design-trends-2026/); [The Edigital](https://www.theedigital.com/blog/web-design-trends)
- **AI imagery fatigue:** a survey of designers reports widespread frustration with AI image defaults, especially an overused yellow hue. This is a secondary source. — summarised in search results from [Bubble.io](https://bubble.io/blog/web-design-trends/) and [Gezar](https://gezar.dk/en/blog/web-design-trends-2026)
- **Webflow's native GSAP:** Webflow now hosts GSAP and all its plugins as a toggle in Site Settings. A forum user notes the toggle loads the scripts on every page. This is one reason GSAP-style effects such as split-text reveals and scroll-pinned sections are now everywhere on template-marketplace sites. — [Webflow forum](https://discourse.webflow.com/t/webflow-makes-gsap-100-free/319967)

### Inferences
- **Effects that now read as templated:** these are my inference from how cheaply they can be done. Each is a one-toggle effect in Webflow, Framer or a template marketplace, so on its own none of them signals craft anymore:
  - per-character split-text fade-ups on every heading
  - infinite logo or text marquees
  - magnetic buttons
  - custom cursor blobs
  - glassmorphism cards
  - floating gradient "orbs" and morphing blobs
  - stock 3D icons and clay renders
  - grain overlays on top of a gradient
- **Smooth scroll and long pinned sections:** Lenis-style smooth scroll and long scroll-pinned "storytelling" sections are still common on award sites. On a booking-driven service site, though, they slow the path to the call to action (CTA), and the Lenis README lists iframe and scroll-snap limitations (see Q2).
- **What would still feel fresh in 2026 (inference):**
  - Motion that comes from the brand idea. For Nest & Rest that could mean "rest/calm": slow, damped easings built with CSS `linear()` springs, a single hand-drawn SVG line that draws itself to tidy the hero, fabric-like folds, and sunlight sweeps across real photos of cleaned rooms.
  - Typography that moves in purposeful ways: variable-axis "breathing" on one display word, italic/roman swaps, mixed serif and sans in the same line.
  - Page transitions that feel continuous, using cross-document view transitions so a service card morphs into the service-page hero.
  - Scroll-driven reveals that respect reading speed.
  - One signature interactive moment, such as a before/after "wipe" slider driven by scroll or drag, rather than many generic effects.
- **Restraint as a signal:** for a calm, trust-led service brand, restraint is itself a mark of craft. Very slow ambient motion plus a few precisely timed micro-interactions will feel more premium than maximal WebGL.

### Gaps
- **FWA and CSSDA:** I could not retrieve their 2025/2026 annual winners lists (the search budget ran out), so I have only Awwwards data.
- **The Lando Norris site's actual tech stack:** not verified from its code.
- **Codrops and Smashing:** I found no Codrops or Smashing 2026 trend articles. A practitioner consensus on which effects are "overused" therefore rests on trend blogs that are partly vendor content, plus my own inference.

---

## Q2. Tooling and licensing: GSAP, Lenis, Motion, anime.js v4, Rive vs Lottie, WebGL options, Theatre.js (versions, licences, measured sizes)

### Takeaway
- **GSAP:** fully free, including SplitText, MorphSVG and Flip, since 3.13 (30 Apr 2025), under Webflow's proprietary "no-charge" licence. It is the strongest choice for timeline and scroll choreography plus accessible text splitting. A typical set (core + ScrollTrigger + SplitText) is about 48 KB gzip, measured.
- **Smaller options:** Motion's `mini` animate is about 3.3 KB and anime.js v4's WAAPI build about 4.8 KB. Both suit small, isolated effects.
- **Illustrated motion graphics:** Rive and dotLottie both pull in a ~350–500 KB gzipped WASM runtime. lottie-web's light SVG player is about 46 KB with no WASM.
- **WebGL:** OGL (~13 KB) or Unicorn Studio (~58 KB plus the scene file) cost far less than Three.js (~132 KB for a minimal scene) or Spline (~0.6–0.9 MB).
- **Theatre.js:** effectively stalled, with no npm release since May 2024.

### Cited Findings
**GSAP (GreenSock, owned by Webflow)**
- **Licence:** GSAP 3.13 made GSAP "100% FREE including ALL of the bonus plugins", such as SplitText and MorphSVG, including for commercial use, "thanks to Webflow". The `gsap-trial` package is deprecated. — [GSAP 3.13 release](https://gsap.com/blog/3-13/); [Webflow blog](https://webflow.com/blog/gsap-becomes-free); [gsap-trial README](https://cdn.jsdelivr.net/npm/gsap-trial@3.13.0/README.md)
- **Versions and dates** (npm registry):

  | Version | Published |
  |---|---|
  | 3.13.0 | 30 Apr 2025 |
  | 3.14.0 | 8 Dec 2025 |
  | 3.15.0 | 13 Apr 2026 |
  | 3.15.1 (latest) | 4 Nov 2026 |

  The package's licence field reads "Standard 'no charge' license: https://gsap.com/standard-license". — [npm registry: gsap](https://registry.npmjs.org/gsap)
- **Licence terms,** from the "Standard 'No Charge' GSAP License":
  - "Permitted Uses" covers use "on any website, web application, or digital interface by any person or entity".
  - "Prohibited Uses" covers use "in tools that allow users to build visual animations without code" that compete with "Webflow's visual animation building capabilities".
  - Webflow "may terminate this GSAP License and revoke your access in its discretion" if you breach it.
  - Webflow can amend it, but amendments "shall not result in a material degradation of your use of GSAP". You may keep using versions released before a revision.
  - The scancode copy states "Last modified date: April 30, 2025". A search-result summary said 30 May 2025, so this date conflicts slightly.

  — [ScanCode LicenseDB copy of GSAP licence](https://scancode-licensedb.aboutcode.org/gsap-standard-no-charge-2025.html); [gsap.com standard license](https://gsap.com/community/standard-license/)
- **SplitText rewrite (3.13):** "50% smaller, 14 new features". The goals included screen-reader accessibility and standalone use without GSAP core. — [GSAP 3.13 blog](https://gsap.com/blog/3-13/); [Webflow engineering: SplitText rewrite](https://webflow.com/blog/gsap-splittext-rewrite)
- **SplitText options:** the 3.15.1 TypeScript types expose `aria?: "auto" | "hidden" | "none"`, `mask?: "lines" | "words" | "chars"` for clip-reveal effects, `autoSplit` (re-splits on resize and font load), `onSplit`, `onRevert` and `smartWrap`.
- **SplitText accessibility default:** the source defaults to `aria = "auto"`. The original element keeps or gets an `aria-label`, and the generated split pieces get `aria-hidden="true"`. — [npm: gsap 3.15.1 package, `src/SplitText.js` and `types/split-text.d.ts`](https://www.npmjs.com/package/gsap)
- **Reduced motion:** GSAP core includes the `gsap.matchMedia()` API, which you can use to gate animations behind `(prefers-reduced-motion: no-preference)` (confirmed present in `src/gsap-core.js` 3.15.1). — [npm: gsap](https://www.npmjs.com/package/gsap)
- **Measured GSAP 3.15.1 sizes:**

  | What | Measured as | gzip |
  |---|---|---|
  | core | esbuild ESM bundle, minified | 27.7 KB |
  | core + ScrollTrigger + SplitText | esbuild ESM bundle, minified | 48.4 KB |
  | core + ScrollTrigger + SplitText + Flip | esbuild ESM bundle, minified | 57.5 KB |
  | ScrollTrigger | dist `.min.js` file | 18.0 KB |
  | SplitText | dist `.min.js` file | 3.7 KB |
  | Flip | dist `.min.js` file | 9.7 KB |
  | MorphSVG | dist `.min.js` file | 9.6 KB |
  | ScrollSmoother | dist `.min.js` file | 5.5 KB |
  | DrawSVG | dist `.min.js` file | 2.2 KB |
  | Observer | dist `.min.js` file | 4.3 KB |

  — measured from [npm: gsap 3.15.1](https://www.npmjs.com/package/gsap)

**Lenis (darkroom.engineering)**
- **Versions and licence:** v1.3.0 was published 21 Apr 2025 and the latest, v1.3.27, on 15 Oct 2026. MIT licence. The minimal `new Lenis({autoRaf:true})` bundle measured 5.4 KB gzip. — [npm registry: lenis](https://registry.npmjs.org/lenis)
- **Native scroll:** the README says Lenis "runs on native scroll — wraps the browser's own scroll, so position: sticky, anchor links, and accessibility keep working".
- **Reduced motion:** `respectReducedMotion` defaults to `true`. Under `reduce`, `lerp` is forced to 1, so scrolling tracks the input 1:1, and programmatic scrolls jump instantly. Lenis "keeps running" on the main thread. — [Lenis README](https://github.com/darkroomengineering/lenis)
- **Limitations listed in the README:**
  - no CSS scroll-snap (you need `lenis/snap`)
  - "capped to 60fps on Safari … and 30fps on low power mode"
  - "smooth scroll will stop working over iframe since they don't forward wheel events"
  - fixed-position lag on pre-M1 macOS Safari
  - `syncTouch` issues on iOS < 16
  - nested scroll containers need configuration

  — [Lenis README](https://github.com/darkroomengineering/lenis)

**Motion (formerly Framer Motion; motion.dev)**
- **Versions and licence:** v12.0.0 was published 20 Jan 2025, v13.0.0 on 5 Aug 2026, v14.0.0 on 2 Oct 2026, and the latest, 14.9.1, on 4 Nov 2026. MIT licence. — [npm registry: motion](https://registry.npmjs.org/motion)
- **Features and paid tier:** the README describes a "hybrid engine" combining JavaScript with native browser APIs (WAAPI) for "120fps, GPU-accelerated animations". It includes gestures, springs, layout transitions, scroll-linked effects and timelines. A paid tier, Motion+, adds example and Motion UI source code, "MotionScore performance audits" and CSS spring generation. Motion powers all Framer sites. — [Motion README](https://github.com/motiondivision/motion)
- **Measured Motion 14.9.1 sizes (gzip):** `animate` from `motion/mini` = 3.3 KB; hybrid `animate` = 25.3 KB; `animate + scroll + inView + stagger` = 28.5 KB. — measured from [npm: motion](https://www.npmjs.com/package/motion)

**anime.js v4**
- **Versions and licence:** v4.0.0 was published 3 Apr 2025, and the latest, 4.5.0, on 22 Jun 2026. MIT, "100% free". It is ES-module and modular, with modules for animation, timeline, draggable, scope, svg, text, waapi, layout, events and more. — [npm registry: animejs](https://registry.npmjs.org/animejs); [anime.js README](https://github.com/juliangarnier/anime)
- **Measured anime.js 4.5.0 sizes (gzip):**

  | What | gzip |
  |---|---|
  | `waapi.animate` only | 4.8 KB |
  | `animate` only | 12.7 KB |
  | `animate + onScroll + splitText + stagger + createTimeline` | 22.6 KB |
  | full ESM bundle | 40.8 KB |

  Its `splitText` has an `accessible` parameter that defaults to `true`, and split pieces get `aria-hidden="true"`. — measured and read from [npm: animejs 4.5.0](https://www.npmjs.com/package/animejs)

**Rive vs Lottie / dotLottie (illustrated motion graphics)**
- **Rive runtime:** `@rive-app/canvas` and `canvas-lite` 2.49.3 were published 4 Nov 2026, with MIT-licensed runtimes. Measured sizes:
  - canvas-lite: JS wrapper about 62 KB gzip, plus `rive.wasm` at 348 KB gzip (849 KB raw)
  - full canvas: `rive.wasm` at 931 KB gzip (2.24 MB raw)

  A threaded `webgl2-threads` build exists for cross-origin-isolated pages. — [npm: @rive-app/canvas](https://registry.npmjs.org/@rive-app/canvas); [rive-wasm README](https://github.com/rive-app/rive-wasm)
- **dotLottie runtime:** `@lottiefiles/dotlottie-web` 0.82.1 was published 2 Nov 2026, MIT. JS measured 12.7 KB gzip. Its `dotlottie-player.wasm` measured 491 KB gzip (1.23 MB raw). The README says the WASM engine (~500 KB compressed) "is fetched from a CDN [jsDelivr] when the first player is constructed". You can preload it, or self-host it with `setWasmUrl()`. Worker mode requires a same-origin worker URL. — [dotlottie-web README](https://github.com/LottieFiles/dotlottie-web); [npm](https://registry.npmjs.org/@lottiefiles/dotlottie-web)
- **lottie-web (classic SVG/DOM renderer, no WASM):** latest is 5.13.0, published 21 May 2025, so it is slow-moving. Measured gzip: full `lottie.min.js` 76 KB, `lottie_light.min.js` 46.4 KB, `lottie_svg.min.js` 62.3 KB. — [npm: lottie-web](https://registry.npmjs.org/lottie-web)
- **Vendor claims on file size and format:**
  - Rive claims .riv files are "10 to 15 times smaller than an equivalent uncompressed Lottie .json". The comparison is against uncompressed JSON, not .lottie.
  - LottieFiles counters that the compressed .lottie format narrows the gap, that Lottie now has a native State Machine in Lottie Creator, and that theming is a single call (`setTheme('dark')`).
  - Rive's format is proprietary and controlled by Rive; Lottie is an open format.

  These are vendor sources. — [Rive blog](https://framer.rive.app/blog/rive-as-a-lottie-alternative); [LottieFiles blog](https://lottiefiles.com/blog/working-with-lottie-animations/lottiefiles-or-rive); [Toolradar](https://toolradar.com/compare/rive-vs-lottie)

**WebGL and 3D**
- **Three.js:** r187 (0.187.0) was published 30 Oct 2026, MIT. A minimal tree-shaken scene (WebGLRenderer + Mesh + PlaneGeometry + ShaderMaterial) measured 132 KB gzip. — [npm: three](https://registry.npmjs.org/three)
- **OGL:** 1.0.11 was published 27 Jan 2025 under the Unlicense. A minimal Renderer + Program + Mesh + Triangle (a full-screen shader) measured 12.8 KB gzip. — [npm: ogl](https://registry.npmjs.org/ogl)
- **Spline:** `@splinetool/runtime` 2.0.136 was published 4 Nov 2026, with no licence field (proprietary). The `runtime.js` loader is 37 KB gzip but dynamically imports effect chunks and WASM modules (physics, boolean, navmesh and others). The standalone WebGL build is 587 KB gzip, and the full standalone build 911 KB gzip. — measured from [npm: @splinetool/runtime](https://registry.npmjs.org/@splinetool/runtime)
- **Unicorn Studio:** the runtime is v2.4.4, with the UMD file at 57.6 KB gzip (209 KB raw), measured from GitHub. It supports `lazyLoad` (no init until the scene scrolls into view), `scale` (0.25–1 for performance), `fps` (1–120), `altText` ("optional text for SEO, going inside the <canvas> tag") and `ariaLabel`. It already handles "pausing offscreen scenes, resizing, tab visibility… and WebGL context limits". The runtime file contains no `prefers-reduced-motion` string, so you have to gate reduced motion yourself. — [unicornstudio.js README](https://github.com/hiunicornstudio/unicornstudio.js)

**Theatre.js**
- `@theatre/core` latest is 0.7.2, published 19 May 2024. The README says "Theatre.js 1.0 is around the corner… temporarily moved development to a private repo". The core is Apache-2.0; the studio is AGPL-3.0, for development only. — [npm](https://registry.npmjs.org/@theatre/core); [Theatre README](https://github.com/theatre-js/theatre)

### Inferences
- **Recommended core library:** GSAP 3.15 (core + ScrollTrigger + SplitText, about 48 KB gzip), loaded only on pages that need choreography. You get timeline control, `gsap.matchMedia()` for reduced-motion gating, and SplitText's built-in aria handling.
  - **Licence risk:** low for a cleaning-business website, since that is a "Permitted Use". It is still a proprietary licence that Webflow can revoke or revise. You can always keep using versions released before a revision, so pin the version.
- **Pages with only light motion:** use CSS (scroll-driven animations, view transitions, `@starting-style`) plus Motion `mini` (3.3 KB) or anime.js `waapi` (4.8 KB) instead of GSAP.
- **Skip Lenis (my recommendation):** Lenis does not work over iframes. The Cal.com and Easy!Appointments inline embeds and the Chatwoot widget are iframes, so the scroll feel would change jarringly over the booking widget. It is also capped at 60fps on Safari, needs extra work for scroll-snap, and adds main-thread work. Native scrolling plus CSS scroll-driven animation is the safer premium choice. If the owner insists, enable it desktop-only with the defaults, which respect reduced motion.
- **Illustrated motion graphics:** for a few short brand loops (a nest, a folding towel, sparkles), the cheapest routes are SVG + CSS or SVG + GSAP (DrawSVG 2.2 KB, MorphSVG 9.6 KB), or lottie_light (46 KB, no WASM). Both Rive and dotLottie add about 350–500 KB of WASM, more than the whole rest of the page. Choose Rive only for a stateful interactive mascot or illustration with a state machine, and lazy-load it after first interaction or when it scrolls into view.
- **Shader backgrounds:** prefer a hand-written OGL fragment shader (~13 KB) or Unicorn Studio (~58 KB plus scene JSON, lazy-loaded) over Three.js or Spline. Always provide a static poster image as the LCP-safe fallback and for reduced motion.
- **Theatre.js:** don't use it in production, given no public release in about 2.5 years.

### Gaps
- **The full "You may not" list** in the GSAP licence: only one item is visible in the scancode copy, "Reverse engineer GSAP Products for the purpose of creating Competitive Products". I could not read gsap.com directly to confirm whether there are others.
- **Pricing:** I could not verify Rive's or Unicorn Studio's 2026 plans, including whether exports, self-hosting or watermark removal need a paid tier, or Spline's licence terms for runtime use (the search budget was exhausted).
- **Brotli sizes:** all sizes here are gzip -9. Brotli over the wire, as GitHub Pages and CDNs serve it, would typically be roughly 10–20% smaller, but I did not measure it.

---

## Q3. Native platform features: support as of Nov 2026 and progressive enhancement

### Takeaway
These features are now Baseline (all three engines):
- CSS scroll-driven animations: Baseline Newly available on 27 Oct 2026, when Firefox 159 shipped them.
- Same-document view transitions: since Oct 2025.
- `@starting-style`, the Popover API, `linear()` easing (now Widely available) and container queries.

Cross-document view transitions (`@view-transition { navigation: auto }`) work in Chrome/Edge 126+ and Safari 18.2+, but not yet in Firefox. That is perfect for progressive enhancement, because non-supporting browsers simply do a normal page load.

Anchor positioning is still not Baseline: Safari 27 has it fully, while Chrome 125+ and Firefox 147+ have it partially. Use it only for non-critical tooltips, with a fallback.

### Cited Findings
- **Status from web-features 3.45.0** (2 Nov 2026; first browser versions):

  | Feature | Status (web-features) | Chrome | Firefox | Safari |
  |---|---|---|---|---|
  | Scroll-driven animations (`animation-timeline`, `scroll()`, `view()`, `animation-range`, `view-timeline`) | Baseline low, 2026-10-27 | 115 | 159 | 26 |
  | Same-document view transitions | Baseline low, 2025-10-14 | 111 | 144 | 18 |
  | `view-transition-class` | Baseline low, 2025-10-14 | — | — | — |
  | `:active-view-transition` | Baseline low, 2026-01-13 | — | 147 | — |
  | Cross-document view transitions (`@view-transition`, `navigation`, `types`) | Not Baseline | 126 | ✗ | 18.2 |
  | Anchor positioning | Not Baseline | partial from 125 | partial from 147 | full only from 27 |
  | `@starting-style` | Baseline 2024-08-06 | 117 | 129 | 17.5 |
  | `transition-behavior` (allow-discrete) | Baseline 2024-08-06 | — | — | — |
  | Popover | Baseline 2025-01-27 | 116 | 125 | 17 (iOS 18.3) |
  | `popover="hint"` | Not Baseline | 151 | 153 | ✗ |
  | `linear()` easing | Widely available, 2026-06-11 (newly 2023-12-11) | — | — | — |
  | Container size queries | Widely available, 2025-08-14 | — | — | — |
  | Container style queries | Baseline low, 2026-05-19 | — | — | — |
  | `@scope` | Baseline 2026-03-24 | — | — | — |
  | CSS `shape()` | Baseline 2026-02-24 | 135 | 148 | 18.4 |
  | `sibling-count` | Baseline 2026-08-18 | — | — | — |
  | `field-sizing` | Baseline 2026-06-16 | — | — | — |
  | `::details-content` | Baseline 2025-09-16 | — | — | — |
  | `text-wrap: balance` | Baseline 2024-05-13 | — | — | — |
  | `font-size-adjust` | Baseline 2024-07-25 | — | — | — |
  | `interpolate-size` / `calc-size()` | Not Baseline | 129 only | ✗ | ✗ |
  | `text-wrap: pretty` | Not Baseline | 117 | ✗ | 26 |
  | `corner-shape` | Not Baseline | 139 only | ✗ | ✗ |
  | Customizable `<select>` | Not Baseline | 135 | ✗ | 27 |
  | Speculation rules | Not Baseline | 109 only | ✗ | ✗ |

  Cells marked "—" were not recorded in the extract I pulled. Notes on individual rows:
  - **Scroll-driven animations:** `timeline-scope: all` is not in Chrome.
  - **Cross-document view transitions:** caniuse lists Firefox 144 as "partial", meaning it supports only Level 1 (same-document). A `dom.viewTransitions.enabled` flag exists, on by default in Nightly only. Global support is 86.8%.
  - **Anchor positioning:** caniuse partial notes say there is no `position-anchor: normal` and no `position-visibility: anchor-valid/anchor-visible`, and that Firefox cannot animate `anchor()`/`anchor-size()`.
  - **Container style queries:** Chrome and Safari support custom properties only; Firefox 151 has full support.

  — [web-features package (npm)](https://registry.npmjs.org/web-features); [web-features repo](https://github.com/web-platform-dx/web-features); [caniuse raw data, updated 2026-10-29](https://github.com/Fyrd/caniuse); [caniuse: cross-document view transitions](https://caniuse.com/cross-document-view-transitions); [caniuse: anchor positioning](https://caniuse.com/css-anchor-positioning)
- **Conflict on Firefox scroll-driven animations, now resolved:**
  - A mid-2026 blog said Firefox 152 (June 2026) still had scroll-driven animations behind `layout.css.scroll-driven-animations.enabled`.
  - A Firefox 150 summary (April 2026) said it added `animation-range`.
  - web-features data shows full support from Firefox 159 (27 Oct 2026).

  These are consistent: it shipped by default in 159. — [buildmvpfast blog](https://www.buildmvpfast.com/blog/css-scroll-driven-animations-replace-js-2026); [Firefox 150 summary](https://ilyagarbuz.netlify.app/blog/firefox-150/); [web-features](https://github.com/web-platform-dx/web-features)
- **Interop 2026 focus areas** (20): container style queries, CSS anchor positioning (carried over from 2025), CSS `attr()`, `contrast-color()`, CSS zoom, custom highlights, dialogs and popovers (`<dialog closedby>`, `:open`, `popover="hint"`), fetch uploads and ranges, IndexedDB, JSPI for Wasm, media pseudo-classes, Navigation API (incl. `precommitHandler`), scoped custom element registries, scroll-driven animations, scroll snap, CSS `shape()`, view transitions, web compat, WebRTC and WebTransport. The view-transitions area specifically covers same-document interop, `blocking="render"`, `<link rel="expect">`, `:active-view-transition-type()` and "Cross-document view transitions". — [Interop 2026 README](https://github.com/web-platform-tests/interop/blob/main/2026/README.md); [web.dev Interop 2026](https://web.dev/blog/interop-2026); [Mozilla Hacks](https://hacks.mozilla.org/?p=48246); [Microsoft Edge blog](https://blogs.windows.com/msedgedev/2026/02/12/microsoft-edge-and-interop-2026/)
- **How the opt-in works:** `@view-transition { navigation: auto; }` must be present in both the old and the new document. It works only for same-origin navigations with no cross-origin redirects. For push/replace, the navigation "must be initiated by a user interacting with the page content, not by a browser UI feature". — [MDN @view-transition (mdn/content)](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@view-transition)
- **Chrome documentation:** Chrome's docs list cross-document view-transition support as Chrome/Edge 126, Safari 18.2, Firefox not supported. — [Chrome for Developers: cross-document view transitions](https://developer.chrome.com/docs/web-platform/view-transitions/cross-document)
- **Same-document Baseline:** same-document view transitions became Baseline Newly available on 14 Oct 2025, with Firefox 144. — [web.dev blog](https://web.dev/blog/same-document-view-transitions-are-now-baseline-newly-available); [web.dev Oct 2025 platform](https://web.dev/blog/web-platform-10-2025)

### Inferences
- **Progressive-enhancement recipe for an MPA site** (inference built from the support data above):
  1. Add `@view-transition { navigation: auto; }` plus `view-transition-name` on shared elements (logo, service-card image → service hero, booking CTA). Wrap all of it in `@media (prefers-reduced-motion: no-preference)`. Firefox (and reduced-motion users) get ordinary instant navigation, so nothing breaks.
  2. Write scroll reveals with `animation-timeline: view()` inside `@supports (animation-timeline: view())` and the reduced-motion media query. Older browsers simply show content statically. Never start content hidden outside the `@supports` block.
  3. Animate menus, dialogs, the booking drawer and the FAQ with `popover`/`<dialog>` plus `@starting-style` and `transition-behavior: allow-discrete`. Animate FAQ `<details>` with `::details-content`. Height-to-auto animation via `interpolate-size` is Chrome-only, so treat it as a bonus.
  4. Build bespoke spring and bounce easings with `linear()`, which is Widely available, instead of a JS spring library.
  5. Use CSS `shape()` (Baseline Feb 2026) for organic morphing section dividers and "blob" masks without JS, and the `sibling-count` feature for staggered timing without JS.
  6. Use speculation rules (Chromium only) to prerender the booking page on hover, which pairs well with cross-document view transitions. It is ignored elsewhere.
- **Anchor positioning:** acceptable only for decorative or non-critical tooltips, with a `@supports (position-anchor: --x)` fallback.

### Gaps
- **Firefox cross-document view transitions:** I could not confirm whether Firefox has a ship date. caniuse says Nightly only, behind a flag.

---

## Q4. Performance: Core Web Vitals and keeping an animated site fast

### Takeaway
"Good" thresholds are unchanged in 2026: LCP ≤ 2.5 s, INP ≤ 200 ms, CLS ≤ 0.1.

The biggest risk in an animated hero is the LCP element. Chrome excludes opacity-0 and transparent text from LCP, so hiding hero text until JS splits and fades it pushes LCP to the moment of reveal.

Keep the hero text and image visible in server-rendered HTML. Animate only `transform`, `opacity`, `clip-path` and similar compositor-friendly properties, starting from a visible state where possible. Lazy-initialise WebGL, Lottie and Rive, and cap fonts to 2–3 WOFF2 files.

### Cited Findings
- **Thresholds in the `web-vitals` library** v6.2.3 (5 Oct 2026):

  | Metric | Good ≤ | Poor > |
  |---|---|---|
  | LCP | 2500 ms | 4000 ms |
  | INP | 200 ms | 500 ms |
  | CLS | 0.1 | 0.25 |
  | FCP | 1800 ms | 3000 ms |
  | TTFB | 800 ms | 1800 ms |

  — [web-vitals (npm/GitHub)](https://github.com/GoogleChrome/web-vitals)
- **Chromium LCP changelog,** entries relevant to animation:
  - **Chrome 86:** an LCP bug was fixed for pages "where the largest contentful element initially has opacity:0". Such sites "will now see a longer LCP, reflecting the time until the largest contentful paint is visible to the user, instead of the time it is loaded in the DOM but invisible".
  - **Chrome 130 (Oct 2024):** "Exclude transparent text from being LCP eligible".
  - **2025–2026:** further fixes for "LCP and FCP handling when document opacity changes from zero to non-zero", text presentation timestamps reported too early (introduced in M140), LCP candidates "based on largest painted image instead of largest pending image" (Feb 2026), and prompt LCP for video (June 2026).

  — [Chromium LCP changelog](https://chromium.googlesource.com/chromium/src/+/main/docs/speed/metrics_changelog/lcp.md) (read via the [GitHub mirror](https://github.com/chromium/chromium/blob/main/docs/speed/metrics_changelog/lcp.md)); [M86 note](https://github.com/chromium/chromium/blob/main/docs/speed/metrics_changelog/2020_08_lcp.md); [M130 note](https://github.com/chromium/chromium/blob/main/docs/speed/metrics_changelog/2024_10_lcp.md)
- **Chromium INP changelog:** `performance.interactionCount` shipped to stable in Chrome 144, with further definition fixes in Chrome 147, 148 and 150. — [Chromium INP changelog](https://github.com/chromium/chromium/blob/main/docs/speed/metrics_changelog/inp.md)
- **`font-display` options:**
  - `swap`: an extremely small block period and an infinite swap period.
  - `fallback`: an extremely small block period and a short swap period.
  - `optional`: an extremely small block period and no swap period.
  - `block`: a short block period and an infinite swap period.

  — [MDN font-display (mdn/content)](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@font-face/font-display)
- **Lenis on the main thread:** Lenis keeps running on the main thread even when reduced motion is on. — [Lenis README](https://github.com/darkroomengineering/lenis)
- **Dynamic WASM loads:** the dotLottie WASM (~500 KB compressed) is fetched at first player construction. The README recommends preloading it, or self-hosting it to take it off the first animation's critical path. — [dotlottie-web README](https://github.com/LottieFiles/dotlottie-web)
- **Unicorn Studio:** offers `lazyLoad` (init when the scene scrolls into view), `scale` 0.25–1 and an `fps` cap for performance. — [unicornstudio.js README](https://github.com/hiunicornstudio/unicornstudio.js)
- **Current Nest & Rest baseline** (repo):
  - `js/site.min.js`: 103.7 KB raw / 30.0 KB gzip
  - `css/site.min.css`: 100.7 KB raw / 20.3 KB gzip
  - two preloaded WOFF2 fonts (`plus-jakarta-sans.woff2`, `dm-sans.woff2`)
  - `prefers-reduced-motion` is referenced 6× in `css/site.css` and 2× in `js/site.js`

  — local files `/home/user/nestnrestcleaning/js/site.min.js`, `/home/user/nestnrestcleaning/css/site.min.css`, `/home/user/nestnrestcleaning/index.html`

### Inferences
- **Hero rules for LCP** (inference from the Chromium behaviour above):
  - Render the H1 and the hero image as plain HTML, visible on first paint.
  - Don't put `opacity:0` on the H1 in CSS while waiting for GSAP SplitText. If you do, LCP equals JS download + parse + font load + animation start.
  - Safer patterns:
    - (a) animate a decorative layer, not the LCP text;
    - (b) a CSS-only entrance whose first keyframe is already partially visible, or a pure `transform`/`clip-path` reveal of an already-painted element;
    - (c) split only secondary headings below the fold.
  - Preload the hero image with `fetchpriority="high"`; never lazy-load it.
- **INP:** keep animation work off the input path. Use CSS/WAAPI animations of `transform`/`opacity`, which can run on the compositor. Avoid scroll listeners and JS smooth-scroll loops on mobile. Debounce SplitText `autoSplit` re-splits. Load Chatwoot and the Cal.com embed only on click or idle, because third-party chat and booking widgets are typical INP and main-thread offenders.
- **CLS:**
  - Reserve space for embeds (Cal.com, the chat launcher, review widgets) with fixed aspect-ratio boxes.
  - Use `font-size-adjust` (Baseline) or `size-adjust`/`ascent-override` on a fallback `@font-face` so swapping in the web font doesn't reflow.
  - Remember that view transitions don't count as CLS, but scroll-triggered layout changes do.
- **Proposed mobile budget for this site** (my own inference; no authoritative 2026 budget was found):
  - LCP ≤ 2.0 s on a mid-range Android over 4G.
  - ≤ 100 KB gzip of first-party JS on the home page. That is the current ~30 KB plus GSAP core + ScrollTrigger + SplitText at ~48 KB, plus room.
  - ≤ 150 KB of WOFF2 fonts in total (2–3 files).
  - 0 KB of WebGL, Rive or Lottie on the critical path; those load lazily after interaction or when visible, and never on the booking page.
  - Third-party scripts deferred until interaction.
- **Font file sizes:** variable fonts with many axes are heavy (see Q7). Fraunces with all four axes is 118 KB for the Latin roman alone, versus 66 KB with only opsz+wght. Subset to the axes you actually animate.

### Gaps
- **Compositor claim not re-verified:** I could not re-fetch web.dev or Chrome documentation confirming that CSS scroll-driven animations run off the main thread for transform/opacity. This is widely stated in Chrome's materials but was not re-verified in this session.
- **No field data:** I found no field data (CrUX) quantifying the INP cost of Lenis versus native scroll.

---

## Q5. Accessibility: reduced motion, WCAG 2.2, vestibular issues, scroll hijacking, focus in transitions

### Takeaway
Three WCAG 2.2 criteria apply:
- **2.2.2 Pause, Stop, Hide (Level A):** auto-playing motion longer than 5 s, shown alongside other content, needs a pause control. That includes marquees, ambient loops and shader backgrounds.
- **2.3.1 Three Flashes or Below Threshold (Level A):** nothing may flash more than three times in any one second, unless it stays below the general and red flash thresholds.
- **2.3.3 Animation from Interactions (Level AAA):** non-essential motion triggered by interaction, explicitly including scroll-linked motion and parallax, should be disable-able. The simplest way to meet it is to honour `prefers-reduced-motion`.

Astro's ClientRouter and Lenis both honour reduced motion by default. GSAP and anime.js split text handle aria for you, but WebGL embeds such as Unicorn Studio do not handle reduced motion.

### Cited Findings
- **WCAG 2.3.3 Animation from Interactions (Understanding doc):**
  - Intent: "allow users to prevent animation from being displayed on web pages… if scrolling a page causes elements to move (other than the essential movement associated with scrolling) it can trigger vestibular disorders". Reactions include "dizziness, nausea and headaches"; parallax scrolling is called out as "often non-essential".
  - Fixes: avoid unnecessary animation, provide a control to turn it off, or "take advantage of the reduce motion feature in the user agent or operating system".
  - "Moving new content into the viewport is essential for scrolling… Only add non-essential animation to the scrolling interaction in a responsible way."

  — [W3C Understanding SC 2.3.3](https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions.html) (read via [w3c/wcag repo](https://github.com/w3c/wcag))
- **WCAG 2.2.2 Pause, Stop, Hide (Understanding doc):**
  - Scope: content that "starts automatically" (not the result of the user's intentional activation), "moving, blinking and scrolling" content, and auto-updating content.
  - Five seconds "was chosen because it is long enough to get a user's attention, but not so long that a user cannot wait out the distraction".
  - Moving content "can also cause problems for screen readers".

  — [W3C Understanding SC 2.2.2](https://www.w3.org/WAI/WCAG22/Understanding/pause-stop-hide.html)
- **WCAG 2.3.1 (Understanding doc):** the goal is that "content does not trigger seizures". Saturated red flashing gets its own special test. — [W3C Understanding SC 2.3.1](https://www.w3.org/WAI/WCAG22/Understanding/three-flashes-or-below-threshold.html)
- **MDN on `prefers-reduced-motion`:** it detects whether the user "has enabled a setting on their device to minimize the amount of non-essential motion". "Animations such as scaling or panning large objects can be vestibular motion triggers." `@media (prefers-reduced-motion)` is equivalent to `(prefers-reduced-motion: reduce)`. — [MDN prefers-reduced-motion](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@media/prefers-reduced-motion)
- **Support:** caniuse puts global support at 97.2% (Chrome 74+, Safari 10.1+, Firefox 63+), and web-features lists it as Widely available. — [caniuse](https://caniuse.com/prefers-reduced-motion); [web-features](https://github.com/web-platform-dx/web-features)
- **Astro's ClientRouter accessibility:**
  - It "includes a CSS media query that disables all view transition animations, including fallback animation, whenever the prefers-reduced-motion setting is detected".
  - It includes a route announcer (since v3.2.0) that adds an `aria-live="assertive"` element announcing the new page's `<title>`, else the first `<h1>`, else the pathname.

  — [Astro docs: View transitions → Accessibility](https://docs.astro.build/en/guides/view-transitions/) (read via [withastro/docs](https://github.com/withastro/docs))
- **Lenis** honours reduced motion by default (`respectReducedMotion: true`). The README calls opting out "not recommended". — [Lenis README](https://github.com/darkroomengineering/lenis)
- **Split-text aria handling:** GSAP SplitText defaults to `aria: "auto"`, which puts an `aria-label` on the original element and `aria-hidden="true"` on the split pieces. anime.js `splitText` defaults to `accessible: true` and sets `aria-hidden` on split pieces. — [npm: gsap src/SplitText.js](https://www.npmjs.com/package/gsap); [npm: animejs dist/modules/text/split.js](https://www.npmjs.com/package/animejs)
- **Unicorn Studio:** offers `altText` and `ariaLabel` for the canvas, but its runtime contains no reduced-motion handling. — [unicornstudio.js](https://github.com/hiunicornstudio/unicornstudio.js)

### Inferences
- **Recommended pattern** (inference):
  1. Author all motion CSS inside `@media (prefers-reduced-motion: no-preference)`. That puts the "motion-on" state behind the media query, so the default is static.
  2. In JS, wrap GSAP in `gsap.matchMedia()` with a `(prefers-reduced-motion: no-preference)` condition.
  3. Add a visible "Reduce motion / Pause animations" toggle in the footer or header that sets `data-motion="reduced"` on `<html>`. This satisfies 2.2.2 for ambient loops and gives AAA-level control under 2.3.3 without relying on OS settings.
  4. Under reduced motion, replace parallax, zoom, large pans and scroll-pinned sequences with simple cross-fades or nothing.
- **Scroll hijacking:** avoid scroll-jacking, i.e. pinned sections that eat scroll distance, horizontal-scroll galleries and snap-paging, on core conversion pages (home → services → pricing → booking). If used at all, keep pinned sequences short (≤ 1 viewport of travel). Make sure keyboard (Space/PageDown), screen readers and find-in-page still reach all content.
- **Split text on non-heading elements:** using SplitText's aria-label approach on non-heading elements is risky. ARIA 1.2 does not allow `aria-label` on generic and paragraph roles, so some screen readers may ignore it. That claim is from my knowledge of the spec and was not re-verified this session. Split headings only, or use the "visually hidden real text + aria-hidden decorative split copy" pattern.
- **Focus and announcements across page transitions:**
  - Native cross-document view transitions are real page loads, so the browser's normal focus reset and title announcement apply. This is a key accessibility advantage over SPA routing.
  - If you use an SPA router (Astro ClientRouter, Next, SvelteKit), you depend on its route announcer and must manage focus yourself, e.g. focus the `<h1>` or `<main>` after navigation.
  - In both cases, give each page a unique `<title>`.
- **Flashing:** never use strobing sparkle or "shine" effects faster than 3 per second. Keep the hero shader low-contrast and slow.

### Gaps
- **No published vestibular data:** I found no study quantifying how many visitors to service-business sites set reduced motion.
- **WCAG 3:** I could not fetch its 2026 draft status.

---

## Q6. SEO/AEO compatibility: text in HTML, canvas, split text, view transitions vs SPA routing

### Takeaway
AI answer-engine crawlers (GPTBot, ClaudeBot, PerplexityBot and others) do not execute JavaScript; Googlebot does, in a delayed second pass. Every meaningful word therefore has to be in the server-rendered HTML: services, prices, areas, FAQs, reviews and the NAP block (name, address, phone).

Canvas, WebGL, Rive and Lottie text is invisible to AI crawlers and to most assistive tech.

Native cross-document view transitions keep a true multi-page site, so every URL serves full HTML with no SEO trade-off. SPA routers are crawlable only if each route is also pre-rendered as static HTML.

### Cited Findings
- **AI crawlers and JavaScript:** a Vercel and MERJ crawl-log analysis of over 500 million GPTBot fetches found "zero evidence of JavaScript execution". Secondary sources extend this to ClaudeBot, PerplexityBot, Meta's agent and ByteDance's crawler; GPTBot (11.5%) and ClaudeBot (23.8%) downloaded JS files but didn't run them. Googlebot renders with headless Chromium in a delayed pass.
  - Caveats: the data is from late 2024, and these citations are secondary SEO blogs. I did not fetch the original Vercel post.

  — [TripleDart research](https://www.tripledart.com/research/why-your-site-is-invisible-to-chatgpt-and-claude); [Passionfruit](https://getpassionfruit.com/blog/javascript-rendering-and-ai-crawlers-can-llms-read-your-spa); [Averi](https://averi.ai/blog/javascript-rendering-gap-ai-crawlers); [Dev.to](https://dev.to/msmyaqoob25/how-gptbot-claudebot-and-perplexitybot-actually-crawl-your-site-and-how-to-optimize-for-ai-search-4862)
- **Unicorn Studio `altText`:** it places "optional text for SEO, going inside the <canvas> tag". This is a vendor acknowledgement that canvas content is not readable text. — [unicornstudio.js README](https://github.com/hiunicornstudio/unicornstudio.js)
- **Cross-document view transitions:** they require both documents to opt in. They are same-origin full navigations, i.e. the MPA model. — [MDN @view-transition](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@view-transition)
- **Astro ClientRouter trade-offs:** it turns an MPA into an SPA, with "shared state across pages and persistent elements" but "drawbacks, such as needing to manually reinitialize scripts or state after navigation". Bundled module scripts "are only ever executed once". Astro says ClientRouter "will increasingly become unnecessary" as browser APIs evolve, and links to its "future of Astro: zero-JS view transitions" post. — [Astro docs: View transitions](https://docs.astro.build/en/guides/view-transitions/)
- **Split text:** the original text stays in the DOM with `aria-label` (GSAP) or with split spans marked `aria-hidden` (anime.js). In the raw HTML before JS runs, the heading is plain text, so non-rendering crawlers see the unsplit heading. — [npm: gsap](https://www.npmjs.com/package/gsap); [npm: animejs](https://www.npmjs.com/package/animejs)

### Inferences
- **Rules for the rebuild** (inference):
  - Generate split-text spans client-side only, never at build time, so the HTML that crawlers and AI engines see contains clean, unbroken words.
  - Never inject prices, service lists, FAQs or reviews via JS.
  - Keep JSON-LD (LocalBusiness/HouseCleaning, Service, FAQPage, Review) in static HTML.
  - Treat canvas/WebGL as decoration: `aria-hidden="true"` on the canvas, with a real `<h1>` and `<p>` overlaid in HTML.
  - Any Rive or Lottie graphic that conveys information needs an adjacent HTML text equivalent.
- **Routing:** use native cross-document view transitions, not ClientRouter, for this site. That keeps it a pure MPA (best for crawl budget, analytics pageviews and third-party script lifecycles), avoids re-init bugs with the Chatwoot, n8n-form and Cal.com scripts, and gets the same visual result in Chrome and Safari, which carry ~87% of global usage.
- **Prerendering:** speculation rules that prerender likely next pages do not affect crawlers; bots ignore them.

### Gaps
- **Original crawler study:** I did not fetch Vercel's original "rise of the AI crawler" post or Google's 2026 JavaScript SEO documentation.
- **Hydration for SPA routes:** I found no 2026 source on whether Google AI Overviews and AI Mode use rendered HTML or raw HTML for SPA routes.

---

## Q7. Typography: 2026 trends, self-hosting and subsetting, font-display, and 5–8 pairings for a premium-but-warm, calm, trustworthy cleaning brand

### Takeaway
The 2026 brand-type story is expressive, personality-driven display serifs paired with quiet, legible sans body text, delivered as variable fonts. Optical-size and width axes do the expressive work: oversized display headings, mixed roman/italic, subtle axis animation.

Good Google Fonts choices (all SIL OFL, so free to self-host and subset) include Fraunces (soft and wonky axes), Instrument Serif/Sans, Newsreader, Young Serif, Hedvig Letters, Platypi, Gloock, Mona Sans, Figtree, Hanken Grotesk and Onest.

The current site's Plus Jakarta Sans + DM Sans is a very common startup/template pairing. Replacing it is one of the cheapest ways to look less like an AI template.

### Cited Findings
- **Trends:**
  - Expressive serifs are called the defining 2026 trend: "loud, personality-driven display serifs replacing the restrained book serifs". Maximalist serifs are said to be making a comeback, and Tinder's 2026 refresh added a headline serif.
  - Variable fonts with optical sizing provide "multiple weights, widths, and optical sizes in one file".
  - The common pattern is an expressive display serif paired with a quiet sans for body text.
  - These are design-blog and foundry sources, so treat them as directional.

  — [MadeGoodDesigns](https://madegooddesigns.com/font-trends-2026/); [Emin Media](https://eminmedia.com/typography-trends-2026/); [Figure Estudio, late 2026](https://figureestudio.com/2026/09/10/typography-trends-late-2026/); [Medium/Design Bootcamp](https://medium.com/design-bootcamp/typography-trends-2026-2027-when-letters-begin-to-breathe-8499fb6c5ef1); [Inspo AI](https://www.inspoai.io/blogs/typography-trends-2026); [Envato](https://elements.envato.com/learn/font-trends)
- **"AI slop" type tell:** Inter headlines are listed as a tell of default AI output. — [vibecodekit.dev](https://vibecodekit.dev/ai-slop-design)
- **Browser support:** variable fonts and WOFF2 each have about 97.2% global support. `font-display` and `font-variation-settings` are Widely available. — [caniuse variable-fonts](https://caniuse.com/variable-fonts); [caniuse woff2](https://caniuse.com/woff2); [web-features](https://github.com/web-platform-dx/web-features)
- **Licence, axes and date added** (all licence = OFL), from the Google Fonts METADATA.pb files:

  | Family | Axes / styles | Designer | Added |
  |---|---|---|---|
  | Fraunces | SOFT 0–100, WONK 0–1, opsz 9–144, wght 100–900, plus italic | Undercase Type | 2020-10-29 |
  | Instrument Serif | static roman + italic | — | 2023-03-22 |
  | Instrument Sans | wdth 75–100, wght 400–700, italic | — | 2023-04-13 |
  | Newsreader | opsz 6–72, wght 200–800, italic | Production Type | — |
  | Young Serif | static | Bastien Sozeau | 2023 |
  | Bricolage Grotesque | opsz 12–96, wdth 75–100, wght 200–800 | — | — |
  | Hedvig Letters Serif | opsz 12–24 | Kanon Foundry, for the insurer Hedvig | — |
  | Hedvig Letters Sans | — | Kanon Foundry, for the insurer Hedvig | — |
  | Platypi | wght 300–800, italic | — | 2024 |
  | Gloock | static display serif | Duarte Pinto | — |
  | Mona Sans | wdth 75–125, wght 200–900, italic | GitHub | 2024 |
  | Figtree | wght 300–900, italic | Erik Kennedy | — |
  | Hanken Grotesk | wght 100–900 | — | — |
  | Onest | wght 100–900 | — | — |
  | Literata | opsz 7–72, wght 200–900 | TypeTogether | — |
  | Source Serif 4 | opsz 8–60 | — | — |
  | Playfair | opsz 5–1200, wdth 87.5–112.5, wght 300–900 | — | — |
  | Google Sans Flex | ROND, opsz, slnt, wdth, wght | — | 2024-11-21 |
  | Geist | wght | Vercel team | 2024-10-02 |

  "—" means not captured in my extract. — [google/fonts repo, ofl/* METADATA.pb](https://github.com/google/fonts/tree/main/ofl)
- **Measured Latin-subset variable WOFF2 sizes** from the Google Fonts CSS2 API, 4 Nov 2026:

  | Family (axes requested) | Roman | Italic |
  |---|---|---|
  | Fraunces, all 4 axes | 118.2 KB | 146.2 KB |
  | Fraunces, opsz+wght only | 65.7 KB | 79.6 KB |
  | Instrument Serif | 20.5 KB | 21.6 KB |
  | Instrument Sans | 56.0 KB | 60.2 KB |
  | Newsreader | 128.9 KB | 143.4 KB |
  | Young Serif | 26.4 KB | — |
  | Bricolage Grotesque | 128.5 KB | — |
  | Figtree | 19.7 KB | 20.4 KB |
  | Hanken Grotesk | 33.9 KB | — |
  | Onest | 33.0 KB | — |
  | Literata | 107.5 KB | 110.5 KB |
  | Inter | 71.2 KB | — |
  | Mona Sans (wdth+wght) | 95.8 KB | — |
  | Platypi | 42.2 KB | 43.5 KB |
  | Gloock | 25.7 KB | — |
  | Hedvig Letters Serif | 33.8 KB | — |
  | Schibsted Grotesk | 45.7 KB | — |
  | Source Serif 4 | 119.5 KB | — |
  | Playfair | 179.7 KB | — |

  — measured via [Google Fonts CSS2 API](https://fonts.googleapis.com/css2?family=Fraunces)
- **Self-hosting via npm:** Fontsource publishes OFL variable packages on npm, e.g. `@fontsource-variable/fraunces` 5.3.0 (19 Jul 2026, OFL-1.1). — [npm](https://registry.npmjs.org/@fontsource-variable/fraunces)
- **Current site fonts:** `--display: "Plus Jakarta Sans"` and `--body: "DM Sans"`, both self-hosted and preloaded. — `/home/user/nestnrestcleaning/css/site.css`, `/home/user/nestnrestcleaning/index.html`
- **`font-display` semantics:** `swap` has an infinite swap period; `optional` has no swap period. — [MDN font-display](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@font-face/font-display)

### Inferences
- **Recommended pairings** (inference; sizes are measured Latin WOFF2, all fonts OFL):
  1. **Fraunces + Figtree:** "soft heritage, friendly"; about 66 KB + 20 KB.
     - **Use:** Fraunces display at a high opsz with SOFT ≈ 50–100 for rounded, pillowy serifs, which suits "Nest & Rest". Use WONK italics for one or two accent words, and Figtree for UI and body.
     - **Caution:** Fraunces has been popular since 2020. Make it distinctive through SOFT/WONK settings and very large sizes.
     - **Weight saving:** request only the opsz+wght axes plus a static SOFT value, unless you animate SOFT.
  2. **Instrument Serif + Instrument Sans:** "editorial calm"; about 21 KB + 56 KB, so very light.
     - **Use:** set oversized Instrument Serif headlines with italic accents. Instrument Sans's width axis (75–100) allows subtle kinetic width shifts on hover or scroll.
     - **Caution:** this pairing is very fashionable among 2024–26 startups, so it needs brand-specific art direction to avoid sameness.
  3. **Newsreader + Hanken Grotesk:** "trusted, magazine-like"; about 129 KB + 34 KB.
     - **Use:** Newsreader's opsz 6–72 lets one file serve both display and small text.
     - **Weight saving:** subset aggressively, or use a static display instance.
  4. **Young Serif + Onest:** "warm, 70s-soft, approachable"; about 26 KB + 33 KB.
     - **Use:** Young Serif is a single weight, so use it only for headings.
  5. **Hedvig Letters Serif + Hedvig Letters Sans:** "calm service brand".
     - **Why:** a superfamily drawn for a consumer insurance brand, so it was literally built to signal trust. Serif ~34 KB.
  6. **Platypi + Schibsted Grotesk:** "sturdy, friendly, a little quirky"; about 42 KB + 46 KB. Platypi's wedge serifs read warm at large sizes.
  7. **Gloock + Mona Sans:** "premium contrast + kinetic width"; about 26 KB + 96 KB.
     - **Use:** Gloock for short, high-contrast display headings. Animate Mona Sans's wdth 75–125 for one signature kinetic word, e.g. "rest" relaxing from condensed to wide.
  8. **Optional (licence to verify):** Fontshare pairings such as Gambetta or Erode (serif) with General Sans or Switzer (sans). See Gaps.
- **Avoid as primary choices:** Inter, Geist, Plus Jakarta Sans, DM Sans, Satoshi, Manrope and Clash Display. They read as default startup/AI-template type in 2026 (inference, partly supported by the "Inter headlines" tell).
- **Delivery rules:**
  - Self-host WOFF2 from the same origin, with no Google Fonts CDN. This also helps privacy, and Canadian PIPEDA expectations favour minimal third-party calls (inference).
  - Subset to Latin (plus Latin-ext for French names if needed), e.g. with `pyftsubset` or glyphhanger.
  - Preload only the display font used in the LCP H1.
  - Use `font-display: swap` for the H1 font paired with a metric-matched fallback (`size-adjust`/`ascent-override` or `font-size-adjust`). Use `optional` for secondary faces.
  - Keep total font bytes ≤ ~150 KB.
- **Kinetic variable-axis animation:** animating `font-variation-settings` or `font-weight` re-lays-out and repaints text every frame. Unlike transforms, it cannot run on the compositor, so limit it to one short word, never body copy, and disable it under reduced motion. This is engine behaviour as I understand it; I did not re-verify it this session.

### Gaps
- **Fontshare licence:** I could not verify the current terms of the ITF Free Font License (self-hosting and commercial web use). fontshare.com was unreachable and the search budget was exhausted. Confirm before using any Fontshare family.
- **Velvetyne and Collletttivo:** I could not confirm their licences or catalogue. Both sites were unreachable and GitLab rate-limited me. I believe Velvetyne publishes under SIL OFL, but that is unverified.
- **Font-usage data:** I have no data (e.g. HTTP Archive Web Almanac) on how widespread each recommended family already is on small-business sites.

---

## Q8. Architecture: keep the vanilla static site + Node build, or move to Astro, Next.js or SvelteKit; fit with GitHub Pages

### Takeaway
For this site, both of these are sound options:
1. Keep the vanilla static multi-page architecture and Node build script (`tools/build.mjs`), and add progressive-enhancement motion layers.
2. Migrate to Astro 7 in static-output mode, using native cross-document view transitions rather than ClientRouter.

Next.js 16 and SvelteKit 3 add framework runtime and SPA routing that this content site doesn't need.

The stack I recommend:
- semantic HTML + CSS-first motion (scroll-driven animations, cross-document view transitions, `@starting-style`, `linear()`)
- GSAP core + ScrollTrigger + SplitText (~48 KB gzip), loaded only on choreographed pages
- an optional lazy shader hero (OGL ~13 KB)

That makes an estimated 60–100 KB gzip of first-party JS on the heaviest page.

Separately, check GitHub Pages' terms: they say Pages is not for running an online business or sites "primarily directed at… facilitating commercial transactions".

### Cited Findings
- **Astro dates:**
  - Astro 6.0.0: 10 Mar 2026
  - Astro 7.0.0: 22 Jun 2026
  - 7.1: 16 Jul, 7.2: 6 Aug, 7.3: 3 Sep, 7.4: 15 Oct 2026
  - latest 7.4.5: 2 Nov 2026, MIT licence

  — [npm registry: astro](https://registry.npmjs.org/astro)
- **Astro and Cloudflare:** the Astro Technology Company joined Cloudflare in January 2026; Astro "stays MIT-licensed and platform-agnostic". — [Cloudflare blog](https://blog.cloudflare.com/astro-joins-cloudflare/)
- **Astro 6 features:** a dev server rebuilt on Vite's Environment API, first-class Cloudflare Workers support, live content collections, CSP, and an experimental Rust compiler. — [Doolpa](https://doolpa.com/news/astro-6-stable-release-cloudflare-workers-vite-environment-api-march-2026); [ai-suka](https://ai-suka.pages.dev/astro-6-release-guide)
- **Astro 7 features:** core build steps and the .astro compiler moved to Rust, Vite 8 with the Rolldown bundler, queued rendering, `astro dev --background` and JSON logging for AI coding agents. These are secondary sources. — [AlternativeTo](https://alternativeto.net/news/2026/6/astro-7-0-brings-vite-8-performance-boost-advanced-routing-route-caching-and-ai-features/); [NeverCodeAlone](https://nevercodealone.de/frontend-development/astro-js-static-site-generator-website-performance)
- **Other framework versions** (npm registry):
  - Next.js 16.0.0: 22 Oct 2025; latest 16.4.5: 3 Nov 2026
  - SvelteKit 3.0.0: 1 Oct 2026; latest 3.1.1: 29 Oct 2026
  - Vite 8.0.0: 12 Mar 2026
  - Eleventy 3.1.8: 3 Nov 2026

  — [npm: next](https://registry.npmjs.org/next); [npm: @sveltejs/kit](https://registry.npmjs.org/@sveltejs/kit); [npm: vite](https://registry.npmjs.org/vite); [npm: @11ty/eleventy](https://registry.npmjs.org/@11ty/eleventy)
- **Astro ClientRouter vs native transitions:** the ClientRouter provides SPA-mode routing, fallback animation for non-supporting browsers, `transition:persist`, a route announcer and reduced-motion handling. Drawbacks: scripts must be re-initialised via `astro:page-load`, and bundled scripts run once. Astro notes native cross-document view transitions "can be used in Astro" for MPAs. — [Astro docs: View transitions](https://docs.astro.build/en/guides/view-transitions/)
- **GitHub Pages limits and terms:**
  - Pages "is not intended for or allowed to be used as a free web-hosting service to run your online business, e-commerce site, or any other website that is primarily directed at either facilitating commercial transactions or providing commercial software as a service".
  - Limits: 1 GB site, 100 GB/month soft bandwidth, 10 builds/hour (not for Actions-based deploys), 10-minute deploy timeout.

  — [GitHub Docs: GitHub Pages limits](https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits)
- **Current site structure:**
  - static HTML folders: `areas/`, `services/`, `pricing/`, `book/`, `guides/` and others
  - `tools/build.mjs`, `tools/guides.mjs` and `tools/landmarks.mjs` generate pages
  - `js/config.js` holds config
  - a single `site.min.js` (30 KB gzip) and `site.min.css` (20 KB gzip)

  — local repo `/home/user/nestnrestcleaning/`

### Inferences
**Option A: Stay vanilla and add a motion layer** (lowest risk). Recommended if the owner and maintainer are comfortable with the current build script.
- **What to add:**
  - Split motion into `motion.css`, which uses scroll-driven animations, view transitions and `@starting-style`, all gated by `@supports` and `prefers-reduced-motion`.
  - Add `motion.js` as an ES module loaded with `type="module"` (and deferred) on pages that opt in via `data-motion="hero|story"`. It dynamically imports GSAP and its plugins only where needed.
  - Add `@view-transition` and shared `view-transition-name`s in the base template.
  - Extend `build.mjs` with font subsetting, image AVIF/WebP generation, critical-CSS inlining and per-page script manifests.
- **JS weight:** about 30 KB existing + ~48 KB GSAP on choreographed pages, and ~30–35 KB on simple pages.
- **Compatibility:** no change to the hosting model or the integrations (Cal.com/Easy!Appointments, n8n webhooks, Chatwoot).

**Option B: Astro 7 in static output** (best developer experience if the site keeps growing, with many area, guide and service pages).
- **What it adds:** components and layouts instead of string templates, content collections for areas, guides and services, built-in image optimisation, and zero JS by default. You can add `<script>` per component, with "islands" only for interactive widgets.
- **Settings:** use `output: 'static'`; it deploys to GitHub Pages via Actions or to Cloudflare Pages. Use native `@view-transition` CSS, not `<ClientRouter />`, to avoid script re-init problems with the Chatwoot, n8n and Cal.com embeds.
- **JS weight:** about the same as Option A, because Astro ships no runtime for static pages.
- **Migration cost:** porting the build-config logic into Astro.

**Option C: Next.js 16 or SvelteKit 3** — not recommended.
- They add framework runtime (React for Next) and SPA routing by default, with more moving parts on a static host. They also bring hydration and INP risks and no benefit for a brochure-plus-booking site.

**Hosting**
- **Why reconsider GitHub Pages:**
  - The GitHub Pages terms are ambiguous for a commercial lead-gen site; a booking-focused business site arguably falls under "facilitating commercial transactions".
  - GitHub Pages also offers no custom response headers for cache control, CSP or HSTS preload. That is from my knowledge and was not re-verified this session.
- **Alternative:** Cloudflare Pages/Workers static assets (free tier, custom headers, Astro now Cloudflare-owned) or Netlify. Both deploy the same static output.

**Recommended stack summary** (inference):

| Layer | Choice | Approx. gzip | Notes |
|---|---|---|---|
| Markup | Static HTML (vanilla build or Astro 7 static) | — | All content and JSON-LD in HTML |
| Page transitions | CSS `@view-transition { navigation: auto }` + `view-transition-name` | 0 | Chrome/Safari animate; Firefox does a normal navigation |
| Scroll reveals | CSS `animation-timeline: view()` | 0 | Baseline since 27 Oct 2026; `@supports` gate |
| UI motion | `popover`/`<dialog>` + `@starting-style`, `linear()` springs, `::details-content` | 0 | — |
| Choreography | GSAP 3.15 core + ScrollTrigger + SplitText | ~48 KB | Only on home and story pages; `gsap.matchMedia()` for reduced motion |
| Micro-interactions (alternative) | Motion `mini` | ~3.3 KB | Where GSAP isn't loaded |
| Smooth scroll | None (native) | 0 | Lenis breaks over the booking and chat iframes |
| Illustration | Inline SVG + CSS/GSAP DrawSVG/MorphSVG; lottie_light if needed | 2–46 KB | Avoid the ~350–500 KB Rive/dotLottie WASM unless it's a stateful mascot |
| Hero shader (optional) | OGL fragment shader or Unicorn Studio, lazy-loaded, static poster fallback | 13–58 KB + scene | Never the LCP element; off under reduced motion and on Save-Data |
| Fonts | 1 display serif + 1 sans, self-hosted, subset WOFF2 | ≤150 KB total | Preload one |
| Third parties | Chatwoot and Cal.com loaded on interaction | deferred | Reserve layout space |

### Gaps
- **Astro detail:** I did not verify Astro 7's exact GitHub Pages deploy guide or whether its Fonts API is stable in 7.x; the official docs were reachable only through GitHub and I did not fetch those pages.
- **Hosting terms:** I found no authoritative statement on whether GitHub enforces the commercial-use clause against small-business brochure sites, so this needs owner judgement.
- **Hosting headers:** Cloudflare Pages and Netlify free-tier specifics (header rules, bandwidth) were not verified this session.
