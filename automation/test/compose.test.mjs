import test from "node:test";
import assert from "node:assert/strict";
import { clock, site } from "./load.mjs";
import * as R from "./fixtures/requests.mjs";

const at = new Date("2026-10-26T18:32:00Z");
const event = { start: new Date("2026-11-02T15:00:00Z") };
const booking = (patch = {}) => Object.assign(leadFromIncoming(incomingRecord(R.booking, at, { messageId: "m1", threadId: "t1" }), clock), patch);
const quote = (patch = {}) => Object.assign(leadFromIncoming(incomingRecord(R.quote, at, { messageId: "m3", threadId: "t3" }), clock), patch);
const withSite = (patch) => { const s = JSON.parse(JSON.stringify(site)); patch(s); return s; };

test("personal note after booking", () => {
  const e = composeEmail("welcome", booking(), { site, clock, event, paragraph: "P." });
  assert.equal(e.to, "priya@example.com");
  assert.equal(e.name, "Mann Patel, Nest & Rest Cleaning");
  assert.equal(e.subject, "Your deep cleaning on Monday, November 2");
  assert.ok(e.text.startsWith("Hi Priya,\n\n"));
  assert.ok(e.text.includes("I'll see you on Monday, November 2 at 10am for your deep cleaning."));
  assert.ok(e.text.includes("\n\nP.\n\n"));
  assert.ok(e.text.includes("Thank you for mentioning Sam O'Brien. You get $25 off this first clean"));
  assert.ok(e.text.includes(site.automation.prep.deep));
  assert.ok(e.text.includes("It's free up to 24 hours before."));
  assert.ok(e.text.includes("— Mann"));
  assert.ok(e.text.endsWith("\n\n" + site.footer));
  assert.ok(!/\{\w+\}/.test(e.text + e.subject));
});

test("empty lines are left out", () => {
  const e = composeEmail("welcome", booking({ referrer: "" }), { site, clock, event, paragraph: "" });
  assert.ok(!e.text.includes("Thank you for mentioning"));
  assert.ok(!e.text.includes("\n\n\n"));
});

test("reminder", () => {
  const e = composeEmail("reminder", booking(), { site, clock, event, paragraph: "" });
  assert.equal(e.subject, "See you tomorrow, Priya");
  assert.ok(e.text.includes("I'll see you tomorrow, Monday, November 2 at 10am, for your deep cleaning."));
  assert.ok(e.text.includes("I delete it within 7 days of your last scheduled visit."));
  assert.ok(e.text.includes(site.automation.pets["Cat or other"]));
  const noPets = composeEmail("reminder", booking({ pets: "No pets", access: "Concierge or front desk" }), { site, clock, event, paragraph: "" });
  assert.ok(noPets.text.includes("Please leave my name with them: Mann Patel from Nest & Rest Cleaning."));
  assert.ok(!noPets.text.includes("pets are welcome") && !noPets.text.includes("\n\n\n"));
});

test("review request", () => {
  const e = composeEmail("review", booking(), { site, clock, event, paragraph: "" });
  assert.equal(e.subject, "How did your clean go?");
  assert.ok(e.text.includes("https://nestnrestcleaning.com/review/"));
  assert.ok(e.text.includes("Scarborough & North York"));
  assert.ok(e.html.includes('<a href="https://nestnrestcleaning.com/review/">'));
});

test("pick-a-time nudge links the calendar", () => {
  const s = withSite((x) => { x.links.calendar = "https://cal.com/nr/home-clean"; });
  const e = composeEmail("pickTime", booking(), { site: s, clock, event: null, paragraph: "" });
  assert.equal(e.subject, "Pick a time for your deep cleaning");
  assert.ok(e.text.includes("so here it is again: https://cal.com/nr/home-clean"));
});

test("booking request reply repeats what they asked for", () => {
  const e = composeEmail("requestAck", booking({ requested: "Tuesday, October 27, Morning (9am to 12pm)" }), { site, clock, event: null, paragraph: "P." });
  assert.equal(e.subject, "Your deep cleaning request");
  assert.ok(e.text.includes("You asked for Tuesday, October 27, Morning (9am to 12pm)."));
});

test("quote reply with and without a walkthrough link", () => {
  const e = composeEmail("quoteReply", quote(), { site, clock, event: null, paragraph: "P." });
  assert.equal(e.subject, "Your free quote for Residence Care");
  assert.ok(e.text.includes("Thank you for asking about Residence Care with Nest & Rest Cleaning."));
  assert.ok(e.text.includes(site.automation.quoteForms["Residence Care"].nextStepNoLink));
  const s = withSite((x) => { x.links.walkthrough = "https://cal.com/nr/walkthrough"; });
  const linked = composeEmail("quoteReply", quote(), { site: s, clock, event: null, paragraph: "P." });
  assert.ok(linked.text.includes("Pick a time that suits you: https://cal.com/nr/walkthrough"));
});

test("quote nudge for a form with no entry of its own", () => {
  const e = composeEmail("quoteNudge", quote({ form: "Window Washing" }), { site, clock, event: null, paragraph: "" });
  assert.equal(e.subject, "Following up on your quote");
  assert.ok(e.text.includes("my note about Window Washing reached you"));
  const realtor = composeEmail("quoteReply", quote({ form: "Realtors & property managers" }), { site, clock, event: null, paragraph: "" });
  assert.equal(realtor.subject, "Your cleaning quote");
  assert.ok(realtor.text.includes("Thank you for asking about cleaning your property"));
});

test("a gap in the wording is caught", () => {
  const s = withSite((x) => { x.automation.review.lines = ["Hi {firstName},", "{nope}"]; });
  assert.throws(() => composeEmail("review", booking(), { site: s, clock, event, paragraph: "" }), /Unfilled placeholder \{nope\} in review/);
});

test("the paragraph is escaped in the HTML", () => {
  const e = composeEmail("welcome", booking(), { site, clock, event, paragraph: "a <b> c" });
  assert.ok(e.html.includes("a &lt;b&gt; c"));
});

test("braces typed by a client are kept as text, not mistaken for a gap", () => {
  const e = composeEmail("welcome", booking({ referrer: "Sam {friend}", firstName: "{Pri}" }), { site, clock, event, paragraph: "" });
  assert.ok(e.text.includes("Thank you for mentioning Sam {friend}."));
  assert.ok(e.text.startsWith("Hi {Pri},"));
});
