# Website v5: from 83 to a credible 90+

Date: 30 October 2026. Owner: Mann Patel. Branch: `ccr-039338b4-5qsxib`.

An outside review of the live desktop site scored it **83/100**: visual identity 13/15, typography 18/20, layout 13/15, navigation and decision support 12/15, pricing and booking 20/25, imagery 7/10. It asked for clearer pricing choices, smoother booking and more authentic imagery, in this order: plan selection, price clarity, booking simplification, typography and imagery, then mobile verification. It also asked to keep the navy-and-teal identity and the font pairing. This file records what changed for each point and why, so later changes stay consistent.

## 1. Plans you can choose

**Found:** the weekly, every-2-weeks and every-4-weeks panels showed prices with no way to act on them.

**Changed:** each plan ends with its own button, "Choose every 2 weeks" and so on, linking to `book/?s=regular&f=<plan>`. Booking reads `f`, selects that plan, and says so at the top of step 1 ("Every 2 weeks selected, 15% off every visit … You can change the plan on the next step"). The estimate shows the later-visit price straight away. `booking_started` now reports `source: "plan"`, and the buttons send `plan_click`.

## 2. Say what a price is for, before the price

**Found:** the price box opened at $116 first visit / $145 regular, while the plans further down used $175 for a different home. The explanations existed, but visitors had to connect them.

**Changed:**

- The price box has a line directly above the amount, "Regular Cleaning · 1-bedroom, 1-bathroom condo", which follows every change (`priceFor()` in `tools/build.mjs` and `js/site.js`, worded the same).
- The plans say "Prices shown for: Regular Cleaning · 2-bedroom, 1-bathroom condo" above the strip, not in fine print below it.

## 3. A shorter booking form

**Found:** three steps, a useful final review, but the form repeated what the price box had just asked and showed every optional field at once.

**Changed:**

- **From a price box:** the service and home show as one card, "Your clean, from the price box", with Edit. Edit opens the full choices and focuses the chosen service.
- **Folded sections:** "Anything unusual about your home?" and Extras on step 1; Visit preferences (getting in, building, pets, products, notes) and "Referred by a client?" on step 3. Each summary says what's chosen inside ("Inside oven · +$40", "I'll be home · Dog · Our products · Notes added"), so a selection is never out of sight. Confirm by stays in view with the contact fields.
- **Reveal before focus:** an error, or an Edit from "Check your clean", unfolds its section (or the card) before moving focus.
- **Unchanged:** the review, the fields and their payload, validation rules, storage and delivery.

## 4. Dates you can page through

**Found:** 21 dates in one horizontal strip, with no visible controls or range.

**Changed:** Earlier and Later buttons page the strip a screen at a time, and the line between them shows the dates in view ("Sat, Oct 31 – Tue, Nov 3"). Both are disabled at the ends. Mann's confirmation note is unchanged. Requests further ahead are a business decision: raise `daysAhead` in `js/config.js`, and the paging keeps a longer window usable.

## 5. A pricing page you can scan

**Found:** four detailed price tables stacked on computers, then extras and a long comparison.

**Changed:**

- Links under the title: Estimate · Prices · Plans · Extras · Compare.
- One tab per service shows one price table at a time, at every width (phones already had this). Without JavaScript, all four still show.
- The room-by-room comparison is folded under "Show the room-by-room comparison", and opens from the Compare link or `#compare`.

The phone page is about 1,600 px shorter.

## 6. Type, applied more consistently

**Kept:** Plus Jakarta Sans for headings, buttons and prices, DM Sans for text, and the 17 px body.

| Element | Before | Now |
|---|---|---|
| Service-card, price-card and room titles | 19.2–23.2 px | `--fs-h3`, 20–22 px |
| Supporting text (what an extra covers, hints, "per visit", table headings, facts labels) | 13.1–13.8 px | `--fs-support`, 14 px; price-box lines 14.4 px |
| Badges ("Extra", "Most popular", service tags) | 12–12.5 px | `--fs-badge`, 13.5 px |
| Prices in lists and tables | 15.7–18.4 px | `--fs-money`, 17 px, tabular lining figures |

Fine print (privacy notes, the price-box footer) is 13 px. Nothing on the site is under 12 px.

## 7. Imagery

**Generated:** an empty, freshly cleaned home for the Move-In / Move-Out card, to replace the slippers. It is an AI illustration made in Canva, consistent with the other room illustrations and covered by the same footer disclosure. It is saved in the owner's Canva uploads.

**Not in the repository yet:** this build environment can't download from Canva's media host. The build switches to `assets/photos/empty-home-*` by itself once the four files are added (see "Wanted" in `docs/design-notes.md`).

**Needs the owner:** two or three real photographs of Mann at work. No illustration substitutes for these, and none is presented as one.

## 8. Words that match the stage

| Where | Before | Now |
|---|---|---|
| Every way into booking | Book a clean / Book | Request a clean / Request |
| The price box, after a price | Book this clean | Choose a preferred day |
| Step 1's Continue | Continue | Choose a preferred day |
| Step 2's Continue | Continue | Add your details |
| Final button | Request this clean | Send cleaning request |

With the Cal.com calendar switched on, booking confirms a time, so the words go back to "Book a clean", "Book this clean" and "Choose your time" (`ACT` in `tools/build.mjs`). On phones, Back is the arrow alone (named "Back" for screen readers), so the longer final label fits beside it and the sticky bar stays one row.

## 9. Service pages lead with what's covered

**Found:** the regular-cleaning page led with a count of 16 included, 6 extras and 10 exclusions, and mixed all 32 rows in each room.

**Changed:**

- The heading is "What every visit covers." and the lead line is "16 tasks in every visit".
- Each room lists what's covered first, at full size.
- Under it, a quieter box lists "Add as an extra" (with each extra's price) and "Not part of this clean".
- Nothing is hidden, and the step-up pointer to the next fuller clean is kept.

## 10. Verification

`tools/qa/v5.test.mjs` adds 11 checks:

- plans choosable on both pages at 390 and 1440 px, and carried into booking;
- the price labels follow the price box;
- the card and Edit, including Edit from the review;
- folded sections: their summaries, opening by keyboard, and an error unfolding one;
- date paging at 360 and 1440 px;
- the stage words;
- jump links and the folded comparison;
- service scope order and extra prices;
- the type scale at 390 and 1440 px;
- contrast of every new and folded part in both themes;
- a complete phone booking at 360, 390 and 430 px: the price box, an extra, paged dates, a window, details, visit preferences, a failed send with its email fallback, a retry with the same reference, and the done screen. It also checks for sideways scroll and sticky bars over controls at every step.

Existing tests changed only where a rule changed on purpose: the label vocabulary, the price card replacing the prefill note, one table at every width, and opening folded sections before using them. The full suite passes 126 of 126. Lab LCP is 1.84–1.94 s and CLS 0, the same as v4.

**Bug found and fixed along the way:** on phones, tapping a folded section low on the screen moved focus, the focus guard scrolled it to the centre, and the tap's release landed elsewhere, so the section didn't open. The guard now acts only on keyboard-style focus (`:focus-visible`).

**Still needs a real phone:** the phone keyboard, autofill, VoiceOver and TalkBack (`docs/phone-checklist.md`, updated for these flows). Also one real test request to confirm delivery.

## 11. Round 2 (same day, after the re-score of 90)

The outside reviewer re-scored the desktop site at **90/100**: typography 19/20, layout 14/15, navigation 14/15, pricing and booking 23/25; identity 13/15 and imagery 7/10 unchanged. Their next four points:

1. **One price per extra.** The regular-cleaning page showed "Inside fridge and oven +$40", which reads as $40 for both, but the oven and the fridge are separate $40 extras sharing one checklist row. Each room now lists one row per extra, by the extra's own name and price (`roomExtras()`). Heavy pet hair, which belongs to no row, sits under Whole home, so the count line ("8 optional extras") matches the extras list on the same page and on pricing.
2. **A shorter final review.**
   - "Check your clean" leads with Service, Extras, Plan, Preferred time and the Estimate. The Estimate is in bold, with the time on site folded in.
   - Under "Your details and visit", a compact 14px summary: Contact (with how to confirm), Address and Visit (getting in, pets, products). Notes and Referred by appear only when given.
   - Every row keeps its Edit. Visit's Edit opens the folded preferences on Getting in.
3. **"Recommended", not "Most popular".** There's no booking data behind a popularity claim yet. The plan flag and the every-2-weeks paragraph in the "How often" guide now say it's the one we recommend.
4. **Photography:** unchanged, because it needs the owner (see section 7). The empty-home illustration is still in the owner's Canva uploads. The build switches the move-out card to it as soon as the four `empty-home` files are in `assets/photos`.

Verification: two new checks in `tools/qa/v5.test.mjs`, one for the review's two tiers and one for the Recommended flag across the home page, pricing and the guide. The service-scope checks now expect one row per extra.
