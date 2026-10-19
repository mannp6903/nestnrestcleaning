# Nest & Rest flyer

Two-sided US Letter flyer (8.5 × 11 in).

- **Front:** brand promise, three proof points, the founding-household offer (20% off the first visit for the first 50 households), QR code and phone number.
- **Back:** services and prices, recurring-plan savings, the five-step doorway standard, a note from Mann, booking steps and contact details.

## Files

| File | Use it for |
|---|---|
| `nest-and-rest-flyer-print.pdf` | Print shops. 8.75 × 11.25 in: the Letter page plus a 0.125 in bleed on every side. |
| `nest-and-rest-flyer-letter.pdf` | A home or office printer. Exact Letter size, no bleed. |
| `flyer-front.png`, `flyer-back.png` | Previews, email, WhatsApp, social posts. 2550 × 3300 px (300 dpi at Letter size). |
| `index.html` | The source. Open it in a browser to see both sides. |
| `qr-book.svg` | The QR code on its own. |

The design is also in Figma as editable layers, with brand colour variables and components:
https://www.figma.com/design/tAtqa4fc97nRhW94COLwiZ

## Printing

- **Size and sides:** Letter, double-sided, front and back on the same sheet. Upload `nest-and-rest-flyer-print.pdf` and choose "full bleed" or "edge to edge".
- **Paper:** 100 lb cover (about 14 pt / 270 gsm) or heavier. Matte or silk. Soft-touch lamination makes it feel premium in the hand. Avoid high gloss: it fights the quiet, navy-and-ivory look.
- **Colour:** the file is RGB. The printer converts it to CMYK. The deep navy can print darker or flatter than on screen, so ask for a printed proof before a large run.
- **Safe area:** all text sits at least 0.58 in inside the trim, so nothing important is cut off.
- **Fonts:** fonts are embedded. If a print shop's preflight check rejects the PDF, export the two frames from the Figma file as PDF instead.

## The QR code

It opens `https://nestnrestcleaning.com/book/?utm_source=flyer&utm_medium=print`.
Once a Google Analytics ID is added in `js/config.js`, bookings from the flyer show up there under the source "flyer".
Test-scan one printed copy before handing out a full run.

## Changing the flyer

Prices, offers and wording on the flyer are typed into `index.html`. They are not read from `js/config.js`. If a price or the offer changes on the website, change it here too, then rebuild the files:

```
node tools/render-flyer.mjs
```

This needs Playwright with Chromium (`npm i -D playwright`).
