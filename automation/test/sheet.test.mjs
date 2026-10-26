import test from "node:test";
import assert from "node:assert/strict";
import { clock } from "./load.mjs";
import * as R from "./fixtures/requests.mjs";

const plain = (x) => JSON.parse(JSON.stringify(x));
const now = new Date("2026-10-26T18:32:00Z");
const booking = (patch = {}) => Object.assign(leadFromIncoming(incomingRecord(R.booking, now, { messageId: "m1", threadId: "t1" }), clock), patch);
const quote = (patch = {}) => Object.assign(leadFromIncoming(incomingRecord(R.quote, now, { messageId: "m3", threadId: "t3" }), clock), patch);
const sent = (at, threadId = "th") => ({ state: "sent", at, draftId: "", threadId });

test("headers and labels", () => {
  assert.equal(CLIENT_HEADERS.length, 17);
  assert.equal(CLIENT_HEADERS[10], "Needs you");
  assert.equal(CLIENT_HEADERS[11], "Opted out");
  assert.equal(CLIENT_HEADERS[16], "Data");
  assert.equal(KIND_LABELS.welcome, "Personal note");
  assert.equal(KIND_LABELS.review, "Review request");
});

test("a lead survives the round trip through a row", () => {
  const lead = booking({ eventId: "e1", eventStart: "2026-11-02T15:00:00.000Z", emails: { welcome: sent("2026-10-26T19:00:00.000Z", "th1") } });
  const row = leadToRow(lead, now, clock);
  assert.equal(row.length, 17);
  assert.equal(row[0], "2026-10-26 14:32");
  assert.equal(row[1], "NR-AB12");
  assert.equal(row[2], "Booking");
  assert.equal(row[8], "Monday, November 2 at 10am");
  assert.equal(row[9], "Booked");
  assert.equal(row[15], "https://mail.google.com/mail/u/0/#all/th1");
  assert.deepEqual(plain(rowToLead(row)), plain(lead));
});

test("Mann's edits to Needs you and Opted out win", () => {
  const row = leadToRow(booking({ needsYou: "Client replied" }), now, clock);
  row[10] = "  ";
  row[11] = "TRUE";
  const lead = rowToLead(row);
  assert.equal(lead.needsYou, "");
  assert.equal(lead.optedOut, true);
  row[11] = false;
  assert.equal(rowToLead(row).optedOut, false);
});

test("rows never hold notes or the address", () => {
  const row = JSON.stringify(leadToRow(booking(), now, clock));
  assert.ok(!row.includes("Code 4321") && !row.includes("12 Example St"));
});

test("default settings", () => {
  const rows = defaultSettingsRows(now, clock);
  assert.deepEqual(plain(rows[0]), ["Automation on", true]);
  assert.deepEqual(plain(rows[1]), ["Auto-send starts", "2026-11-09"]);
  assert.deepEqual(plain(rows.slice(-2)), [["Last run", ""], ["Last error", ""]]);
  const s = parseSettings(rows, clock);
  assert.equal(s.on, true);
  assert.equal(s.autoSendFrom.toISOString(), "2026-11-09T05:00:00.000Z");
  assert.deepEqual(plain(s.modes), { welcome: "Auto", requestAck: "Draft", quoteReply: "Draft", quoteNudge: "Auto", reminder: "Auto", review: "Auto" });
  assert.equal(s.pickTimeHours, undefined);
  assert.ok(!rows.some((r) => /pick-a-time/i.test(r[0])));
  assert.equal(s.quoteNudgeDays, 2);
  assert.equal(s.quoteNudgeHour, 10);
  assert.equal(s.reminderHour, 18);
  assert.equal(s.reviewHour, 11);
  assert.deepEqual(plain(s.problems), []);
});

test("bad settings fall back to the defaults and say so", () => {
  const rows = defaultSettingsRows(now, clock).map((r) => r[0] === "Reminder" ? ["Reminder", "Sometimes"] : r[0] === "Reminder time, day before (hour, 0-23)" ? [r[0], 25] : r);
  const s = parseSettings(rows, clock);
  assert.equal(s.modes.reminder, "Auto");
  assert.equal(s.reminderHour, 18);
  assert.equal(s.problems.length, 2);
  assert.match(s.problems.join(" "), /Reminder/);
});

test("settings typed by hand", () => {
  const rows = defaultSettingsRows(now, clock).map((r) => r[0] === "Automation on" ? [r[0], "FALSE"] : r[0] === "Auto-send starts" ? [r[0], new Date("2026-11-20T15:00:00Z")] : r[0] === "Quote reply" ? [r[0], "auto"] : r);
  const s = parseSettings(rows, clock);
  assert.equal(s.on, false);
  assert.equal(s.autoSendFrom.toISOString(), "2026-11-20T05:00:00.000Z");
  assert.equal(s.modes.quoteReply, "Auto");
  assert.equal(parseSettings(defaultSettingsRows(now, clock).map((r) => r[0] === "Auto-send starts" ? [r[0], ""] : r), clock).autoSendFrom, null);
});

test("status, in order of precedence", () => {
  assert.equal(statusOf(booking({ optedOut: true, needsYou: "x" }), now), "Opted out");
  assert.equal(statusOf(booking({ needsYou: "x", emails: { welcome: { state: "draft", at: "", draftId: "d", threadId: "" } } }), now), "Needs you");
  assert.equal(statusOf(booking({ clientRepliedAt: "2026-10-27T00:00:00Z", emails: { welcome: { state: "draft", at: "", draftId: "d", threadId: "" } } }), now), "Draft ready");
  assert.equal(statusOf(booking({ clientRepliedAt: "2026-10-27T00:00:00Z" }), now), "Paused (client replied)");
  assert.equal(statusOf(booking({ eventId: "e1", eventStart: "x", emails: { review: sent("x"), "reminder:e1:2026-11-02": sent("x") } }), now), "Reviewed");
  assert.equal(statusOf(booking({ eventId: "e1", eventStart: "x", emails: { "reminder:e1:2026-11-02": sent("x") } }), now), "Reminder sent");
  assert.equal(statusOf(booking({ eventId: "e1", eventStart: "x" }), now), "Booked");
  assert.equal(statusOf(booking({ requested: "Tue", emails: { requestAck: sent("x") } }), now), "Sent");
  assert.equal(statusOf(booking({ requested: "Tue" }), now), "New");
  assert.equal(statusOf(booking({ requested: "" }), now), "Waiting for time");
  assert.equal(statusOf(quote({ emails: { quoteReply: sent("x"), quoteNudge: sent("2026-10-01T00:00:00Z") } }), now), "Done");
  assert.equal(statusOf(quote({ emails: { quoteReply: sent("x"), quoteNudge: sent("2026-10-20T00:00:00Z") } }), now), "Nudged");
  assert.equal(statusOf(quote({ emails: { quoteReply: sent("x") } }), now), "Quote sent");
  assert.equal(statusOf(quote(), now), "New");
});
