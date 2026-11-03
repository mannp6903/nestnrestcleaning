# Final-review fix report

Branch claude/jolly-tesla-o00gmy. Files: js/site.js, tools/build.mjs, tools/qa/stack.test.mjs, docs/ops-stack-setup.md, README.md, js/config.js (plus rebuilt pages and js/site.min.js).

## C1 (Ruling 20) open relay
- js/site.js sendRecord (~1484-1492): the `receipt` line is gone; comment explains why. FormSubmit `_autoresponse` unchanged.
- tools/qa/stack.test.mjs: test renamed "n8n gets JSON and its reference is shown"; asserts `!("receipt" in body)` and no `_` fields.
- Guide Recipe 1 rewritten (docs/ops-stack-setup.md, "Recipe 1"): receipt row removed from the table; step 2 validates form/reference/attempt/honey/size and replies `{ "ok": false }`; step 3 dedupes by attempt; step 4 reissues a same-prefix reference on a clash for a different attempt (box named Reference); step 5 saves, step 6 replies; step 8 sends a receipt in fixed wording per form (copied from RECEIPTS in tools/sheet/Code.gs, plus CASL footer), only booking/quote/gift, with a `receipts` data table limit (1 an hour per address, 50 a day, each send recorded). The "every box takes values from Webhook" rule now excepts the repeat reply and the Reference box. Invoice Ninja and listmonk steps are now 9 and 10 and the dependency list is updated.
- Privacy bullet for n8n ("a receipt that only confirms your request arrived") stays true: the fixed wording is the same as Code.gs. No code change.

## I1 (Ruling 21) offers box dependency
- Guide: dependency list (new bullet), section 7 intro, new steps 7 (preview the opt-in email by subscribing yourself) and 8 (manual alternative), section 8 `newsletter` line, and the calendar check now says the text needs Recipe 2 and SMS Gateway first.
- README.md newsletter line and js/config.js newsletter comment (now says "booking form", needs delivery "webhook" and the listmonk step, and `server` filled in).
- Verified: raw.githubusercontent.com/knadh/listmonk/master/internal/core/subscribers.go, InsertSubscriber sends the opt-in email when `!preconfirm` and sending is on; i18n/en.json "subscribers.preconfirmHelp" is "Don't send opt-in e-mails...". Docs apis/subscribers.md says the same for preconfirm_subscriptions. The admin form has the "Preconfirm subscriptions" checkbox, so leaving it unticked sends the opt-in email.

## I2 Easy!Appointments setup
- Guide section 2 step 4: Duration is the clean plus 30 to 60 minutes (example 3 h becomes 210). Step 8: new bullet asking Claude to put business name, Mann Patel, mailing address, contact details, stop-emails line and terms link into the calendar's email templates (view files on the server: application/views/emails/*).

## I3 Easy!Appointments analytics
- Guide section 2 step 3 (General Settings) and the section 8 "Before the calendar" note: leave Google Analytics Code and Matomo Analytics URL empty. Verified names in application/language/english/translations_lang.php ("google_analytics_code", "matomo_analytics_url").

## I4 (Ruling 22) chat wording
- tools/build.mjs (~2540): Chatwoot bullet is exactly the specified text. tools/qa/stack.test.mjs "sharing bullet" assertion updated to match.
- Guide section 6 new step 6: keep `ip_lookup` off, delete old anonymous contacts; step 8 describes the new policy wording. Verified: raw.githubusercontent.com/chatwoot/chatwoot/develop/config/features.yml has `ip_lookup`, enabled: false.

## M1 cookies
- tools/build.mjs CALENDARS.easyappointments.cookies: ea_session (up to a week) and csrf_cookie. Verified in raw.githubusercontent.com/alextselegidis/easyappointments/main/application/config/config.php: sess_cookie_name 'ea_session', sess_expiration 604800 (1 week), csrf_cookie_name 'csrf_cookie'. Added an assertion to the Easy!Appointments privacy test.

## M2 (Ruling 23) unknown provider
- tools/build.mjs checkStack(): stops unless PROVIDER (after NR_PROVIDER) is "", "formsubmit", "sheet", "webhook" or "none"; message exactly as specified. An empty or missing provider is still allowed because the code treats it as FormSubmit today (neither SHEET nor WEBHOOK, and js/site.js falls through to FormSubmit). The sheet test override NR_PROVIDER="sheet" still builds. New STOPS row with provider "n8n".

## M3 Recipe 2 action check
- New step 3 (If on `action`, compare with the exact word seen in the test run); later steps renumbered.

## M4 pruning
- Guide section 9 "Old requests": monthly delete of quote/pricetext rows older than 12 months from `requests`, and receipts rows older than a day.

## M5
- "or to Cal.com if calLink is set" removed from "Switching a piece off".

## M6
- tools/build.mjs comment above CALENDARS reworded.

## Verification
- `node tools/build.mjs && node tools/qa/run.mjs stack`: 23 passed, 0 failed.
- `node tools/qa/run.mjs delivery`: 9 passed, 0 failed.
- `node tools/qa/run.mjs` (full): 167 passed, 0 failed.
- `node tools/qa/perf.mjs`: ran; LCP about 2.0 to 2.15 s, CLS 0 on all pages.
- Page identity: for all 38 built .html pages, content vs HEAD with `?v=` stripped: 0 differ. sitemap.xml churns a date on each build; restored with git checkout.
- `grep -nE "TODO|TBD|—" docs/ops-stack-setup.md`: no output.
- GitHub reads used raw.githubusercontent.com via curl (the gh API was not enabled for those repos).
