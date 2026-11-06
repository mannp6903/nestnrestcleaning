# Nest & Rest Cleaning: design system

The one page to read before changing how the site looks. Every value here is a token in `css/site.css` (`:root`), and
pages use the names, never raw values. The history and the reasons behind each decision are in
[docs/design-notes.md](docs/design-notes.md).

**Direction:** "We clean. You rest." Calm, local, owner-run. Taken from the logo: ink navy and teal, with sky and sand
from the nest, on white and warm ivory. A crisp sans for doing things, a soft serif for resting the eye. The home hero
is the one dramatic moment (Toronto at dawn); everything after it is quiet and easy to scan.

**Compared with** (November 2026, first screen on a computer): three Toronto cleaning sites that rank for "house cleaning
Toronto": hellamaid.ca, cleanpapi.ca and torontoshinecleaning.ca. (The UXKIN and Mobbin libraries weren't available.)
What they share, and what this site does about it:

- **A price tool on the first screen.** All three. Hellamaid and Clean Papi ask for a name, email and phone before
  showing a price; this site shows the price with no contact details, and says so. Keep that.
- **One warm, loud action colour** (yellow or lime) on dark or white. Here it's sand on the navy hero and navy on white:
  one action colour per surface.
- **Proof beside the headline:** Google rating, review count, "insured", "background-checked". This site has no reviews
  yet and never invents them; its proof is the owner (Mann's photo and name) and the policies (no deposit, free re-clean).
- **Rounded sans everywhere** (Poppins, Quicksand). The Fraunces and Figtree pairing here is the main thing that looks
  different from the rest of the local market. Keep it.
- **A big phone number in the header** on all three. Mann keeps his number private, so email and the chat assistant do
  that job.

## Colour

Brand colours never change; role colours switch in dark mode (`:root[data-theme="dark"]` and the system setting).

| Token | Light | Role |
|---|---|---|
| `--navy` | #0A2D5C | Brand ink: the home hero, navy bands, the footer |
| `--teal` | #2FA4A6 | Accent: decoration, and text on navy |
| `--teal-ink` | #1A7476 | Small teal text on white or ivory (4.5:1) |
| `--teal-deep` | #23898B | Large teal text on light backgrounds (3:1) |
| `--teal-light` | #6FD0CD | "You rest.", highlights on navy |
| `--sky` / `--sky-light` | #6FC3E0 / #B5E2F2 | Focus rings and kickers on navy; the kicker over the hero photo |
| `--sand` | #EFD9AE | The one warm action on navy (the hero's Request a clean), the gift band |
| `--ink` | #0A2D5C | Text and headings |
| `--muted` | #4B5E74 | Supporting text (4.5:1 on white and ivory) |
| `--page-bg` / `--section-tint` | #FFFFFF / #F7F3EA | Page, and alternate sections |
| `--paper` | #FFFFFF | Cards, the price box, the chat panel |
| `--line`, `--line-2`, `--card-line` | navy at 12%, 22%, 8% | Dividers, outlines, card edges |
| `--field` | #7A8899 | Input and control borders (3:1) |
| `--btn-bg` / `--btn-fg` | #0A2D5C / #F7F3EA | Primary buttons (sky blue on dark in dark mode) |
| `--danger` | #A8261B | Errors |
| `--warn-ink` | #7A5300 | Warnings ("Mann confirms the final price") |
| `--wa` | #0F7A40 | WhatsApp only |

**Service hues**, one per clean, on its icon and its page: regular (lake) `--regular-ink` #1A7476, deep (dusk)
`--deep-ink` #5A4A9C, move-in/out (dawn) `--move-ink` #94491A, kitchen and bath (sky) `--detail-ink` #1D6788, each with a
`-soft` tile. Text contrast: 4.5:1 for text, 3:1 for large text and controls, checked by `tools/qa/design.test.mjs`
and, over the hero photo, by `tools/qa/signature.test.mjs`.

## Typography

| Token | Family | Use |
|---|---|---|
| `--serif` | Fraunces (soft, self-hosted, 34 KB) | Page and section headings at 600, "You rest." |
| `--display` / `--body` | Figtree (self-hosted) | Everything else: text, buttons, labels, prices (tabular figures) |

Scale (fluid, phone to computer): `--fs-display` 44–84px (the home slogan), `--fs-h1` 36–56px, `--fs-h2` 28–40px,
`--fs-h3` 20–22px, `--fs-lede` 18–20px, body 16–17px, `--fs-small` 15px, `--fs-support` 14px (the smallest text people
need), `--fs-fine` 13px, `--fs-tag` 12px (nothing smaller). Headings track slightly tight (`--ls-h1`, `--ls-h2`). Lines
stay under about 70 characters.

## Spacing and layout

- **Width:** `.wrap`, 1220px at most, with `--gutter` (18–48px) at the sides.
- **Sections:** `.section` 48–84px top and bottom, white and ivory alternating; section heads 760px wide at most.
- **Grid:** one column on phones; two columns from 960px (60em). The price box is on the first screen everywhere.
- **Rhythm:** 4px steps (8, 12, 14, 16, 22, 28, 40...); gaps on grids and flex, not margins.
- **Booking is never more than one tap away:** the header button on computers, the action bar on phones.

## Shape and depth

- **Radius:** `--field-radius` 12px (inputs, steppers, choices), `--card-radius` 14px (cards, the price box),
  `--band-radius` 20px (navy panels), 999px (buttons and pills).
- **Shadows:** two only. `--shadow-sm` for cards that need lifting; `--shadow` for the price box and floating panels.
  Most cards are flat with a `--card-line` edge.

## Motion

- **Settle** (`--ease-settle`, a long soft landing): 250ms (`--settle-quick`, a control answering), 600ms
  (`--settle`, a part of the page arriving), 900ms (`--settle-slow`).
- **Pop** (`--ease-pop`, a small overshoot): only the home hero's entrance, once, settled in about 1.6s.
- **Scroll rises:** cards and steps below the first screen rise 22px into place as they come into view, side-by-side
  ones a beat apart (transform only, so text never fades below its contrast; switched on after the page loads).
- **Signatures:** the home hero's entrance and the line under "rest."; the price box's house filling with rooms; page
  crossfades with service titles gliding into their pages.
- **Rules:** never loops, never hides the largest text on the first screen, and nothing moves under reduced motion.

## Components

- **Buttons:** primary (navy pill, ivory text, 52px tall; `.btn-sm` 44px), sand primary on navy, ghost (white with an
  outline), ghost-light (on navy). Hover deepens the fill; focus is a 3px sky ring; disabled is dimmed and not
  clickable. Labels say what happens: "Request a clean", "Choose a preferred day".
- **Links:** `.text-link`, bold with a teal underline and an arrow that nudges on hover.
- **Inputs:** 12px radius, `--field` border, labels above, errors beside their field in `--danger`.
- **Cards:** white, `--card-line` edge, 14px radius; service cards carry their hue on the icon.
- **The price box:** the site's main tool, on every key page; the price, what it's for, and the next step.
- **Navigation:** sticky white header (logo, five links, theme switch, Request a clean); phones get a menu and a
  bottom action bar.
- **Footer:** navy, logo and slogan, services, areas, company links, contact, and the illustration note.
- **Opening soon** (`launch.open: false`): a sand pill badge (`.soon-badge`, uppercase 12px) with one sentence. On the
  home hero it sits above the slogan on a dark panel; in place of a form it's a white card (`.soon-box`); in the price box
  it's a sand-soft line (`.pricer-soon`).
- **Chat assistant:** a teal "Ask" pill bottom right (above the phone's action bar), opening a white panel with
  suggested questions; links only to the website and the email.

## Imagery and icons

- **Icons:** the site's own line set (`<symbol>` sprite in `tools/build.mjs`), 1.8px strokes, `currentColor`. No emoji.
- **The home hero:** a photo of Toronto's skyline and the CN Tower at dawn under a navy shade (an illustration).
- **Rooms:** AI-made illustrations in soft rounded frames; the footer says so. Real photos of Mann's work replace them as
  they come in (`tools/add_photo.py`).
- **Landmark art:** drawn in code (`tools/landmarks.mjs`) for the district cards and pages.
- **People:** only Mann, from his own photo. No stock or generated people as staff or clients, no before-and-after, no
  invented reviews.
