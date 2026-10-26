import test from "node:test";
import assert from "node:assert/strict";
import { clock } from "./load.mjs";
import * as R from "./fixtures/requests.mjs";

const T = (s) => new Date(s);
const installed = T("2026-10-26T12:00:00Z");
const settings = (patch = {}) => Object.assign(parseSettings(defaultSettingsRows(installed, clock), clock), patch);
const rec = (req, at) => incomingRecord(req, T(at), { messageId: "m", threadId: "t" });
const booking = (patch = {}, at = "2026-10-26T18:32:00Z") => Object.assign(leadFromIncoming(rec(R.booking, at), clock), patch);
const quote = (patch = {}, at = "2026-10-26T18:32:00Z") => Object.assign(leadFromIncoming(rec(R.quote, at), clock), patch);
const sent = (at, threadId = "th") => ({ state: "sent", at, draftId: "", threadId });
const ev = (id, start, description = "", guests = []) => ({ id, start: T(start), end: T(start), description, guests });
const NOV2 = "2026-11-02T15:00:00Z"; // Monday, November 2, 10am Toronto
const run = (leads, now, extra = {}) => planRun(Object.assign({ leads, events: [], messages: [], existingDraftIds: [], sentByThread: {}, settings: settings(), now: T(now), clock }, extra));
const kinds = (r) => r.todo.map((t) => t.kind).sort();

test("a booking request gets its reply straight away", () => {
  assert.deepEqual(kinds(run([booking()], "2026-10-26T18:40:00Z")), ["requestAck"]);
  assert.deepEqual(kinds(run([booking({ emails: { requestAck: sent("2026-10-26T18:40:00Z") } })], "2026-10-26T21:40:00Z")), []);
});

test("once the clean is on the calendar, the personal note confirms it", () => {
  const lead = booking({ emails: { requestAck: sent("2026-10-26T18:40:00Z") } });
  const confirmed = [evx("e3", NOV2, { title: "Deep cleaning: Priya", guests: ["priya@example.com"], created: "2026-10-26T19:30:00Z" })];
  assert.deepEqual(kinds(run([lead], "2026-10-26T19:35:00Z", { events: confirmed })), ["welcome"]);
});

test("personal note once the booked time is on the calendar", () => {
  const lead = booking();
  const r = run([lead], "2026-10-26T18:40:00Z", { events: [ev("e1", NOV2, "Booking NR-AB12: Deep Cleaning")] });
  assert.deepEqual(kinds(r), ["welcome"]);
  assert.equal(r.todo[0].event.start.toISOString(), T(NOV2).toISOString());
  assert.equal(lead.eventId, "e1");
  assert.equal(lead.eventStart, NOV2.replace("Z", ".000Z"));
});

test("no personal note for a booking already in the past", () => {
  const lead = booking();
  const r = run([lead], "2026-11-02T16:00:00Z", { events: [ev("e1", NOV2, "Booking NR-AB12")] });
  assert.ok(!kinds(r).includes("welcome"));
});




test("reminder at 6pm the day before, across the daylight-saving change", () => {
  const lead = booking({ emails: { welcome: sent("2026-10-26T19:00:00Z") } });
  const events = [ev("e1", NOV2, "Booking NR-AB12")];
  assert.deepEqual(kinds(run([lead], "2026-11-01T22:59:00Z", { events })), []);
  const r = run([lead], "2026-11-01T23:00:00Z", { events });
  assert.deepEqual(kinds(r), ["reminder"]);
  assert.equal(r.todo[0].key, "reminder:e1:2026-11-02");
  assert.deepEqual(kinds(run([lead], "2026-11-02T15:00:00Z", { events })), []);
  lead.emails["reminder:e1:2026-11-02"] = sent("2026-11-01T23:00:00Z");
  assert.deepEqual(kinds(run([lead], "2026-11-01T23:30:00Z", { events })), []);
});

test("a rescheduled clean gets its own reminder", () => {
  const lead = booking({ emails: { welcome: sent("2026-10-26T19:00:00Z"), "reminder:e1:2026-11-02": sent("2026-11-01T23:00:00Z") } });
  const r = run([lead], "2026-11-03T23:00:00Z", { events: [ev("e1", "2026-11-04T15:00:00Z", "Booking NR-AB12")] });
  assert.deepEqual(r.todo.map((t) => t.key), ["reminder:e1:2026-11-04"]);
});

test("review request at 11am the day after the first clean, once per client", () => {
  const lead = booking({ emails: { welcome: sent("2026-10-26T19:00:00Z") } });
  const events = [ev("e1", NOV2, "Booking NR-AB12")];
  assert.deepEqual(kinds(run([lead], "2026-11-03T15:59:00Z", { events })), []);
  assert.deepEqual(kinds(run([lead], "2026-11-03T16:00:00Z", { events })), ["review"]);
  assert.deepEqual(kinds(run([lead], "2026-11-04T16:01:00Z", { events })), []);
  const other = booking({ ref: "NR-ZZ99", emails: { requestAck: sent("2026-09-01T12:05:00Z"), review: sent("2026-10-01T15:00:00Z") } }, "2026-09-01T12:00:00Z");
  assert.deepEqual(kinds(run([other, lead], "2026-11-03T16:00:00Z", { events })), []);
});

test("returning client: an event matched by email goes to the newest booking only", () => {
  const a = booking({ ref: "NR-AAAA", emails: { requestAck: sent("2026-10-01T12:05:00Z"), welcome: sent("2026-10-02T12:00:00Z") } }, "2026-10-01T12:00:00Z");
  const b = booking({ ref: "NR-BBBB", emails: { requestAck: sent("2026-10-26T18:40:00Z"), welcome: sent("2026-10-26T19:00:00Z") } });
  const events = [ev("e9", NOV2, "Home clean", ["PRIYA@example.com"])];
  const assigned = assignEvents([a, b], events);
  assert.equal(assigned["NR-AAAA"], undefined);
  assert.equal(assigned["NR-BBBB"].length, 1);
  const r = run([a, b], "2026-11-01T23:00:00Z", { events });
  assert.deepEqual(r.todo.map((t) => t.ref + " " + t.kind), ["NR-BBBB reminder"]);
});

test("two bookings by one client never get two review requests in one run", () => {
  const a = booking({ ref: "NR-AAAA", emails: { welcome: sent("2026-10-26T19:00:00Z") } });
  const b = booking({ ref: "NR-BBBB", emails: { welcome: sent("2026-10-26T19:00:00Z") } });
  const events = [ev("e1", NOV2, "Booking NR-AAAA"), ev("e2", "2026-11-02T18:00:00Z", "Booking NR-BBBB")];
  assert.deepEqual(kinds(run([a, b], "2026-11-03T16:30:00Z", { events })), ["review"]);
});

test("quote reply right away, nudge two days later at 10am", () => {
  assert.deepEqual(kinds(run([quote()], "2026-10-26T18:33:00Z")), ["quoteReply"]);
  const q = quote({ emails: { quoteReply: sent("2026-10-26T18:40:00Z") } });
  assert.deepEqual(kinds(run([q], "2026-10-28T13:59:00Z")), []);
  assert.deepEqual(kinds(run([q], "2026-10-28T14:00:00Z")), ["quoteNudge"]);
  assert.deepEqual(kinds(run([q], "2026-10-29T14:01:00Z")), []);
});

test("no quote nudge after a reply, while the reply is a draft, or once they've booked", () => {
  assert.deepEqual(kinds(run([quote({ clientRepliedAt: "2026-10-27T00:00:00Z", emails: { quoteReply: sent("2026-10-26T18:40:00Z") } })], "2026-10-28T14:00:00Z")), []);
  assert.deepEqual(kinds(run([quote({ emails: { quoteReply: { state: "draft", at: "2026-10-26T18:40:00Z", draftId: "d1", threadId: "t" } } })], "2026-10-28T14:00:00Z", { existingDraftIds: ["d1"] })), []);
  const q = quote({ email: "priya@example.com", emails: { quoteReply: sent("2026-10-26T18:40:00Z") } });
  const b = booking({ eventId: "e1", eventStart: "2026-11-05T15:00:00.000Z", emails: { welcome: sent("2026-10-27T00:00:00Z") } });
  assert.deepEqual(run([q, b], "2026-10-28T14:00:00Z", { events: [ev("e1", "2026-11-05T15:00:00Z", "Booking NR-AB12")] }).todo.filter((t) => t.kind === "quoteNudge"), []);
});

test("delivery mode", () => {
  const before = T("2026-11-08T12:00:00Z"), after = T("2026-11-10T12:00:00Z"), s = settings(), lead = booking();
  assert.equal(deliveryMode("reminder", lead, s, before), "draft");
  assert.equal(deliveryMode("reminder", lead, s, after), "auto");
  assert.equal(deliveryMode("quoteReply", lead, s, after), "draft");
  assert.equal(deliveryMode("requestAck", lead, s, after), "draft");
  assert.equal(deliveryMode("requestAck", lead, settings({ modes: Object.assign({}, s.modes, { requestAck: "Auto" }) }), after), "auto");
  assert.equal(deliveryMode("review", lead, settings({ modes: Object.assign({}, s.modes, { review: "Off" }) }), after), "off");
  const flagged = booking({ needsYou: "Client replied" });
  for (const k of ["welcome", "requestAck", "quoteNudge"]) assert.equal(deliveryMode(k, flagged, s, after), "draft", k);
  assert.equal(deliveryMode("reminder", flagged, s, after), "auto");
  assert.equal(deliveryMode("reminder", lead, settings({ autoSendFrom: null }), after), "draft");
});

test("opt-outs read only the client's own words", () => {
  assert.equal(isOptOut("Thanks!\n\nOn Mon, Oct 26 Mann wrote:\n> To stop emails from us, email nestnrestcleaning@gmail.com with \"unsubscribe\""), false);
  assert.equal(isOptOut("Thanks!\n\nOn Mon, Oct 26, 2026 at 2:32 PM Mann Patel, Nest & Rest Cleaning <\nnestnrestcleaning@gmail.com> wrote:\n\n> Hi\n> unsubscribe"), false);
  assert.equal(isOptOut("Great, see you then.\n\nThis email is from Nest & Rest Cleaning, owned and operated by Mann Patel. To stop emails, email us with \"unsubscribe\""), false);
  assert.equal(isOptOut("STOP"), true);
  assert.equal(isOptOut("  stop  \n"), true);
  assert.equal(isOptOut("Please unsubscribe me"), true);
  assert.equal(isOptOut("Please don't stop by before 10"), false);
});

test("replies pause the client and are flagged once", () => {
  const a = booking({ emails: { welcome: sent("2026-10-26T19:00:00Z") } });
  const msg = { from: "Priya Sharma <priya@example.com>", date: T("2026-10-26T20:00:00Z"), text: "Can you bring a ladder?", threadId: "r1" };
  assert.deepEqual(applyMessages([a], [msg]), ["r1"]);
  assert.equal(a.clientRepliedAt, "2026-10-26T20:00:00.000Z");
  assert.equal(a.needsYou, "Client replied");
  a.needsYou = "";
  assert.deepEqual(applyMessages([a], [msg]), []);
  assert.equal(a.needsYou, "");
  const early = booking();
  assert.deepEqual(applyMessages([early], [msg]), []);
  assert.equal(early.clientRepliedAt, "");
});

test("an opt-out covers every row with that email", () => {
  const a = booking({ ref: "NR-AAAA" }), b = quote({ email: "PRIYA@example.com" });
  applyMessages([a, b], [{ from: "priya@example.com", date: T("2026-10-27T00:00:00Z"), text: "unsubscribe", threadId: "x" }]);
  assert.equal(a.optedOut, true);
  assert.equal(b.optedOut, true);
  assert.deepEqual(run([a, b], "2026-10-27T01:00:00Z").todo, []);
});

test("sent and deleted drafts", () => {
  const a = booking({ emails: { welcome: { state: "draft", at: "2026-10-26T19:00:00.000Z", draftId: "d1", threadId: "t1" }, requestAck: { state: "draft", at: "2026-10-26T21:32:00.000Z", draftId: "d2", threadId: "t2" } } });
  syncDrafts([a], [], { t1: [T("2026-10-26T18:00:00Z"), T("2026-10-26T20:15:00Z")], t2: [] });
  assert.deepEqual(a.emails.welcome, { state: "sent", at: "2026-10-26T20:15:00.000Z", draftId: "d1", threadId: "t1" });
  assert.equal(a.emails.requestAck.state, "skipped");
  const b = booking({ emails: { welcome: { state: "draft", at: "2026-10-26T19:00:00.000Z", draftId: "d1", threadId: "t1" } } });
  syncDrafts([b], ["d1"], {});
  assert.equal(b.emails.welcome.state, "draft");
});

test("cancelled and finished cleans", () => {
  const a = booking({ eventId: "e1", eventStart: "2026-11-05T15:00:00.000Z" });
  matchEvents([a], [], T("2026-10-30T12:00:00Z"));
  assert.equal(a.eventId, "");
  assert.equal(a.eventStart, "");
  const b = booking({ eventId: "e1", eventStart: "2026-10-20T15:00:00.000Z" });
  matchEvents([b], [], T("2026-10-30T12:00:00Z"));
  assert.equal(b.eventId, "e1");
  assert.equal(b.firstCleanAt, "2026-10-20T15:00:00.000Z");
});

test("nothing for opted-out leads, leads without email, or when automation is off", () => {
  assert.deepEqual(run([booking({ optedOut: true })], "2026-10-26T21:32:00Z").todo, []);
  assert.deepEqual(run([booking({ email: "" })], "2026-10-26T21:32:00Z").todo, []);
  assert.deepEqual(run([booking()], "2026-10-26T21:32:00Z", { settings: settings({ on: false }) }).todo, []);
  assert.deepEqual(run([quote({}, "2026-05-01T12:00:00Z")], "2026-10-26T21:32:00Z").todo, []);
});

const evx = (id, start, opts = {}) => ({ id, start: T(start), end: T(start), description: opts.description || "", guests: opts.guests || [], title: opts.title || "", created: opts.created ? T(opts.created) : null });

test("a reminder already sent isn't sent again when the clean moves to a newer request", () => {
  const a = booking({ ref: "NR-AAAA", emails: { requestAck: sent("2026-10-01T12:05:00Z"), welcome: sent("2026-10-02T12:00:00Z"), "reminder:e2:2026-11-05": sent("2026-11-04T23:00:00Z") } }, "2026-10-01T12:00:00Z");
  const b = booking({ ref: "NR-BBBB", emails: { requestAck: sent("2026-11-04T23:35:00Z") } }, "2026-11-04T23:30:00Z");
  const events = [evx("e2", "2026-11-05T15:00:00Z", { title: "Home clean", guests: ["priya@example.com"], created: "2026-10-20T12:00:00Z" })];
  assert.deepEqual(kinds(run([a, b], "2026-11-04T23:40:00Z", { events })), []);
});

test("a booking matched only by email counts as booked", () => {
  const lead = booking();
  const picked = [evx("e5", NOV2, { title: "Home clean", guests: ["priya@example.com"], created: "2026-10-26T18:36:00Z" })];
  assert.deepEqual(kinds(run([lead], "2026-10-26T18:40:00Z", { events: picked })), ["welcome"]);
  assert.deepEqual(kinds(run([booking()], "2026-10-26T21:40:00Z", { events: picked })), ["welcome"]);
  // An older clean on the calendar isn't taken for this new request.
  const older = [evx("e6", NOV2, { title: "Home clean", guests: ["priya@example.com"], created: "2026-10-20T12:00:00Z" })];
  assert.deepEqual(kinds(run([booking()], "2026-10-26T21:40:00Z", { events: older })), ["requestAck"]);
});

test("walkthroughs aren't cleans, and a booked walkthrough stops the quote nudge", () => {
  const walk = (email) => evx("w1", "2026-10-28T15:00:00Z", { title: "Free walkthrough between Mann Patel and Lee Chen", guests: [email], created: "2026-10-26T19:00:00Z" });
  const q = quote({ emails: { quoteReply: sent("2026-10-26T18:40:00Z") } });
  assert.deepEqual(kinds(run([q], "2026-10-28T14:00:00Z", { events: [walk("lee@example.com")] })), []);
  const b = booking({ emails: { requestAck: sent("2026-10-26T18:40:00Z"), welcome: sent("2026-10-26T19:00:00Z") } });
  assert.deepEqual(kinds(run([b], "2026-10-27T23:00:00Z", { events: [walk("priya@example.com")] })), []);
});

test("reminders only go out on the day before", () => {
  const lead = booking({ emails: { welcome: sent("2026-10-26T19:00:00Z") } });
  const events = [ev("e1", NOV2, "Booking NR-AB12")];
  assert.deepEqual(kinds(run([lead], "2026-11-02T13:00:00Z", { events })), []);
});

test("no reminder in the same evening as the personal note", () => {
  const late = booking({}, "2026-11-01T23:50:00Z");
  const events = [evx("e7", "2026-11-02T14:00:00Z", { description: "Booking NR-AB12" })];
  assert.deepEqual(kinds(run([late], "2026-11-02T00:00:00Z", { events })), ["welcome"]);
  const noted = booking({ emails: { welcome: sent("2026-11-01T22:00:00Z") } }, "2026-11-01T21:50:00Z");
  assert.deepEqual(kinds(run([noted], "2026-11-01T23:00:00Z", { events })), []);
});

test("a client who opted out stays opted out when they send a new request", () => {
  const a = booking({ ref: "NR-AAAA", optedOut: true }, "2026-10-01T12:00:00Z");
  const b = booking({ ref: "NR-BBBB" });
  const r = run([a, b], "2026-10-26T21:40:00Z");
  assert.equal(b.optedOut, true);
  assert.deepEqual(r.todo, []);
});
