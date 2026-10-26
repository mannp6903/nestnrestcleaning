import test from "node:test";
import assert from "node:assert/strict";
import { clock, site } from "./load.mjs";
import * as R from "./fixtures/requests.mjs";

const plain = (x) => JSON.parse(JSON.stringify(x));
const at = new Date("2026-10-26T18:32:00Z");

test("every form the site sends is accepted", () => {
  for (const name of ["booking", "quote", "gift", "review", "textPrice"]) {
    assert.deepEqual(plain(checkRequest(R.copy(R[name]))), { ok: true, spam: false }, name);
  }
});

test("a filled spam trap is quietly accepted as spam", () => {
  const r = R.copy(R.booking);
  r._honey = "x";
  assert.deepEqual(plain(checkRequest(r)), { ok: true, spam: true });
});

test("malformed requests are refused", () => {
  const bad = (mutate) => { const r = R.copy(R.booking); mutate(r); return checkRequest(r); };
  assert.equal(bad((r) => { r._form = "other"; }).ok, false);
  assert.equal(bad((r) => { delete r._subject; }).ok, false);
  assert.equal(bad((r) => { r.Notes = "x".repeat(2001); }).ok, false);
  assert.equal(bad((r) => { for (let i = 0; i < 41; i++) r["Field " + i] = "x"; }).ok, false);
  assert.equal(checkRequest(null).ok, false);
  assert.equal(checkRequest([]).ok, false);
  assert.ok(bad((r) => { r._form = "other"; }).error);
});

test("rate limit keys and limits", () => {
  assert.deepEqual(plain(rateLimitKeys(R.booking, at)), ["rl:all:2026102618", "rl:email:priya@example.com:2026102618"]);
  assert.deepEqual(plain(rateLimitKeys(R.review, at)), ["rl:all:2026102618"]);
  assert.equal(isOverLimit([29, 2]), false);
  assert.equal(isOverLimit([30, 0]), true);
  assert.equal(isOverLimit([0, 3]), true);
  assert.equal(isOverLimit([5]), false);
});

test("Mann's new-request email reads back to the same fields", () => {
  const email = notificationEmail(R.booking, site, "");
  assert.equal(email.to, "nestnrestcleaning@gmail.com");
  assert.equal(email.replyTo, "priya@example.com");
  assert.equal(email.subject, R.booking._subject);
  assert.equal(email.name, "Nest & Rest website");
  assert.ok(email.text.includes("Getting in: Lockbox or key code"));
  assert.deepEqual(plain(parseRequestTable(email.html)), plain(requestFields(R.booking)));
  assert.equal(parseRequestTable(email.html).Notes, "We have a cat & the kitchen is the priority\nCode 4321");
  assert.equal(parseRequestTable(email.html)["Referred by"], "Sam O'Brien");
});

test("a note to Mann comes first", () => {
  const email = notificationEmail(R.booking, site, "Confirmation not sent: test.");
  assert.ok(email.text.startsWith("Confirmation not sent: test."));
  assert.ok(email.html.indexOf("Confirmation not sent") < email.html.indexOf("<table"));
});

test("booking confirmation uses the site's wording", () => {
  const { email, problem } = confirmationEmail(R.booking, site);
  assert.equal(problem, "");
  assert.equal(email.to, "priya@example.com");
  assert.equal(email.subject, "Your booking request with Nest & Rest Cleaning (NR-AB12)");
  assert.equal(email.name, "Mann Patel, Nest & Rest Cleaning");
  assert.ok(email.text.startsWith("Hi Priya, thank you for your booking request with Nest & Rest Cleaning (reference NR-AB12)."), email.text);
  for (const part of ["within 2 hours during business hours", "24 hours", "up to 50% of the estimated price", "https://nestnrestcleaning.com/policies/", "Email nestnrestcleaning@gmail.com", "Deep Cleaning $285"]) {
    assert.ok(email.text.includes(part), part);
  }
  assert.ok(email.text.endsWith(site.footer));
  assert.ok(!/\{\w+\}/.test(email.text));
  assert.ok(email.html.includes("<p"));
});

test("quote confirmation keeps a known reply time and replaces an unknown one", () => {
  assert.ok(confirmationEmail(R.quote, site).email.text.includes("within one business day"));
  const r = R.copy(R.quote);
  r._confirm.vals.reply = "whenever";
  const text = confirmationEmail(r, site).email.text;
  assert.ok(text.includes("within 2 hours during business hours") && !text.includes("whenever"));
});

test("gift confirmation", () => {
  const { email } = confirmationEmail(R.gift, site);
  assert.equal(email.subject, "Your gift card request with Nest & Rest Cleaning (GIFT-7QXZ)");
  assert.equal(email.to, "ana@example.com");
});

test("no confirmation with a link in a value", () => {
  const r = R.copy(R.booking);
  r._confirm.vals.name = "Visit http://spam.example";
  const { email, problem } = confirmationEmail(r, site);
  assert.equal(email, null);
  assert.match(problem, /^Confirmation not sent/);
});

test("no confirmation without an email, for forms without one, or with the wrong template", () => {
  const noEmail = R.copy(R.booking);
  noEmail._replyto = "";
  assert.deepEqual(plain(confirmationEmail(noEmail, site)), { email: null, problem: "" });
  assert.deepEqual(plain(confirmationEmail(R.review, site)), { email: null, problem: "" });
  assert.deepEqual(plain(confirmationEmail(R.textPrice, site)), { email: null, problem: "" });
  const wrong = R.copy(R.booking);
  wrong._confirm.tpl = "gift";
  const res = confirmationEmail(wrong, site);
  assert.equal(res.email, null);
  assert.match(res.problem, /^Confirmation not sent/);
  const badRef = R.copy(R.booking);
  badRef._confirm.vals.ref = "anything";
  assert.equal(confirmationEmail(badRef, site).email, null);
  const long = R.copy(R.booking);
  long._confirm.vals.summary = "x".repeat(401);
  assert.equal(confirmationEmail(long, site).email, null);
});

test("the queued record leaves out notes and the address", () => {
  const rec = incomingRecord(R.booking, at, { messageId: "m1", threadId: "t1" });
  assert.equal(rec.fields.Notes, undefined);
  assert.equal(rec.fields.Address, undefined);
  assert.ok(!JSON.stringify(rec).includes("Code 4321") && !JSON.stringify(rec).includes("12 Example St"));
  assert.equal(rec.hasNotes, true);
  assert.equal(rec.messageId, "m1");
  assert.equal(rec.receivedAt, "2026-10-26T18:32:00.000Z");
  assert.equal(rec.form, "booking");
  assert.equal(incomingRecord(R.gift, at, { messageId: "m2", threadId: "t2" }), null);
  assert.equal(incomingRecord(R.quote, at, { messageId: "m3", threadId: "t3" }).hasNotes, false);
});

test("a booking becomes a lead", () => {
  const lead = leadFromIncoming(incomingRecord(R.booking, at, { messageId: "m1", threadId: "t1" }), clock);
  assert.deepEqual(plain(lead), {
    ref: "NR-AB12", kind: "booking", form: "Deep Cleaning", receivedAt: "2026-10-26T18:32:00.000Z",
    name: "Priya Sharma", firstName: "Priya", email: "priya@example.com", phone: "647 555 0123", area: "Scarborough",
    sourceMessageId: "m1", requested: "", access: "Lockbox or key code", pets: "Cat or other", referrer: "Sam O'Brien", hasNotes: true,
    needsYou: "", optedOut: false, eventId: "", eventStart: "", firstCleanAt: "", emails: {}, clientRepliedAt: "", failures: 0, lastAction: ""
  });
});

test("booking requests, missing emails and quotes", () => {
  const req = R.copy(R.booking);
  req.Date = "Tuesday, October 27";
  req["Arrival window"] = "Morning (9am to 12pm)";
  assert.equal(leadFromIncoming(incomingRecord(req, at, { messageId: "m", threadId: "t" }), clock).requested, "Tuesday, October 27, Morning (9am to 12pm)");
  const none = R.copy(R.booking);
  none.email = "not given";
  assert.equal(leadFromIncoming(incomingRecord(none, at, { messageId: "m", threadId: "t" }), clock).email, "");
  const q = leadFromIncoming(incomingRecord(R.quote, at, { messageId: "m3", threadId: "t3" }), clock);
  assert.equal(q.kind, "quote");
  assert.equal(q.form, "Residence Care");
  assert.equal(q.ref, "Q-261026143200");
  assert.equal(q.area, "M2N");
  assert.equal(q.hasNotes, false);
  assert.equal(q.email, "lee@example.com");
  assert.equal(q.referrer, "");
});

test("notesFrom ignores the empty markers", () => {
  assert.equal(notesFrom({ Notes: "None" }), "");
  assert.equal(notesFrom({ Notes: "—" }), "");
  assert.equal(notesFrom({}), "");
  assert.equal(notesFrom({ Notes: " Hi " }), "Hi");
});
