import test from "node:test";
import assert from "node:assert/strict";
import { site, clock } from "./load.mjs";
import { makeFakeEnv } from "./fake-env.mjs";
import * as R from "./fixtures/requests.mjs";

const INSTALL = "2026-10-26T12:00:00Z";
const T = (s) => new Date(s);
const NOV2 = T("2026-11-02T15:00:00Z");
const calEvent = { id: "e1", start: NOV2, end: NOV2, description: "Booking NR-AB12: Deep Cleaning", guests: ["priya@example.com"] };
const body = (o) => JSON.stringify(o);
const setting = (state, k) => state.settingsRows.find((r) => r[0] === k)[1];
// The site settings once Mann has added the mailing address that Canada's anti-spam law requires in every email.
const addressed = (() => { const x = JSON.parse(JSON.stringify(site)); x.business.mailingAddress = "PO Box 123, Scarborough, ON M1B 0A1"; return x; })();

function installed(opts = {}) {
  const f = makeFakeEnv({ now: INSTALL, site: addressed, ...opts });
  f.env.props.set("ANTHROPIC_API_KEY", "sk-test");
  install(f.env);
  return f;
}

test("a booking request emails Mann and the client, and queues the lead without notes", () => {
  const { env, outbox, state } = installed();
  state.now = T("2026-10-26T18:32:00Z");
  assert.deepEqual({ ...receive(env, body(R.booking)) }, { success: "true" });
  assert.equal(outbox.sent.length, 2);
  assert.equal(outbox.sent[0].to, "nestnrestcleaning@gmail.com");
  assert.equal(outbox.sent[0].replyTo, "priya@example.com");
  assert.equal(outbox.sent[1].to, "priya@example.com");
  assert.equal(outbox.sent[1].subject, "Your booking request with Nest & Rest Cleaning (NR-AB12)");
  assert.equal(state.incoming.length, 1);
  assert.ok(!state.incoming[0].includes("Code 4321") && !state.incoming[0].includes("12 Example St"));
});

test("gift, review and price requests", () => {
  const { env, outbox, state } = installed();
  receive(env, body(R.gift));
  assert.equal(outbox.sent.length, 2);
  receive(env, body(R.review));
  receive(env, body(R.textPrice));
  assert.equal(outbox.sent.length, 4);
  assert.ok(outbox.sent.slice(2).every((e) => e.to === "nestnrestcleaning@gmail.com"));
  assert.equal(state.incoming.length, 0);
});

test("spam is accepted quietly and bad requests are refused", () => {
  const { env, outbox } = installed();
  assert.equal(receive(env, body({ ...R.booking, _honey: "x" })).success, "true");
  assert.equal(receive(env, "not json").success, "false");
  assert.equal(receive(env, body({ ...R.booking, _form: "other" })).success, "false");
  assert.equal(outbox.sent.length, 0);
});

test("the fourth request in an hour from one address is refused", () => {
  const { env, outbox } = installed();
  for (let i = 0; i < 3; i++) assert.equal(receive(env, body(R.booking)).success, "true");
  const sentBefore = outbox.sent.length;
  const res = receive(env, body(R.booking));
  assert.equal(res.success, "false");
  assert.match(res.message, /Too many requests/);
  assert.equal(outbox.sent.length, sentBefore);
});

test("a link in the name means no confirmation, and Mann is told why", () => {
  const { env, outbox } = installed();
  const r = R.copy(R.booking);
  r._confirm.vals.name = "Visit http://spam.example";
  assert.equal(receive(env, body(r)).success, "true");
  assert.equal(outbox.sent.length, 1);
  assert.ok(outbox.sent[0].text.startsWith("Confirmation not sent"));
});

test("if Mann's email can't be sent, the website shows its fallback", () => {
  const { env, state } = installed();
  state.failSend = (e) => e.to === "nestnrestcleaning@gmail.com";
  assert.equal(receive(env, body(R.booking)).success, "false");
});

test("requests are still received while the automation is paused", () => {
  const { env, outbox } = installed();
  env.sheet.writeSettingValue("Automation on", false);
  assert.equal(receive(env, body(R.booking)).success, "true");
  assert.equal(outbox.sent.length, 2);
});

function booked(opts) {
  const f = installed({ events: [calEvent], ...opts });
  f.state.now = T("2026-10-26T18:32:00Z");
  receive(f.env, body(R.booking));
  f.state.now = T("2026-10-26T18:40:00Z");
  return f;
}

test("after the time is picked: one personal-note draft, written by Claude without contact details", () => {
  const { env, outbox, state, claudeCalls } = booked();
  const res = run(env);
  assert.equal(res.drafted, 1);
  assert.equal(outbox.drafts.length, 1);
  assert.equal(outbox.drafts[0].to, "priya@example.com");
  assert.equal(outbox.drafts[0].subject, "Your deep cleaning on Monday, November 2");
  assert.ok(outbox.drafts[0].text.includes("I'll start in the kitchen."));
  assert.ok(state.labelled.some(([t, n]) => t === outbox.drafts[0].threadId && n === "Nest auto/draft ready"));
  assert.equal(state.leadRows.length, 1);
  assert.equal(state.leadRows[0][9], "Draft ready");
  assert.equal(state.incoming.length, 0);
  assert.equal(claudeCalls.length, 1);
  const sentToClaude = JSON.stringify(claudeCalls[0]);
  assert.ok(sentToClaude.includes("We have a cat") && !sentToClaude.includes("priya@example.com"));
  assert.equal(setting(state, "Last run"), "2026-10-26 14:40");
});

test("running again changes nothing", () => {
  const { env, outbox, claudeCalls } = booked();
  run(env);
  run(env);
  assert.equal(outbox.drafts.length, 1);
  assert.equal(claudeCalls.length, 1);
});

test("after the auto-send date, the personal note goes out on its own", () => {
  const { env, outbox, state } = booked();
  env.sheet.writeSettingValue("Auto-send starts", "2026-10-26");
  const sentBefore = outbox.sent.length;
  run(env);
  assert.equal(outbox.sent.length, sentBefore + 1);
  assert.equal(outbox.drafts.length, 0);
  assert.equal(state.leadRows[0][9], "Booked");
});

test("when Claude asks for Mann, the email waits as a draft with the reason", () => {
  const claude = () => ({ status: 200, body: JSON.stringify({ stop_reason: "end_turn", content: [{ type: "text", text: JSON.stringify({ paragraph: "Thanks for asking. I'll reply about that personally.", needs_mann: true, reason: "Asked about carpet shampooing" }) }] }) });
  const { env, outbox, state } = booked({ claude });
  env.sheet.writeSettingValue("Auto-send starts", "2026-10-26");
  run(env);
  assert.equal(outbox.drafts.length, 1);
  assert.equal(state.leadRows[0][10], "Asked about carpet shampooing");
  assert.equal(state.leadRows[0][9], "Needs you");
});

test("when Claude fails, the draft goes out without a paragraph", () => {
  const { env, outbox, state } = booked({ claude: () => ({ status: 500, body: '{"error":{"message":"Overloaded"}}' }) });
  run(env);
  assert.equal(outbox.drafts.length, 1);
  assert.ok(!outbox.drafts[0].text.includes("kitchen"));
  assert.match(state.leadRows[0][10], /^Couldn't write the personal paragraph: HTTP 500: Overloaded/);
});

test("a paragraph that fails the checks is dropped", () => {
  const claude = () => ({ status: 200, body: JSON.stringify({ stop_reason: "end_turn", content: [{ type: "text", text: JSON.stringify({ paragraph: "Enjoy 20% off!", needs_mann: false, reason: "" }) }] }) });
  const { env, outbox, state } = booked({ claude });
  run(env);
  assert.ok(!outbox.drafts[0].text.includes("20%"));
  assert.match(state.leadRows[0][10], /^Couldn't write the personal paragraph/);
});

test("paused: no emails, but the run is recorded", () => {
  const { env, outbox, state } = booked();
  env.sheet.writeSettingValue("Automation on", false);
  run(env);
  assert.equal(outbox.drafts.length, 0);
  assert.match(String(setting(state, "Last run")), /^2026-10-26 14:40/);
});

test("the saved copy of the site settings is used when the site can't be reached", () => {
  const { env, outbox, state } = booked();
  state.configStatus = 404;
  state.props.CONFIG_FETCHED_AT = "0";
  run(env);
  assert.equal(outbox.drafts.length, 1);
  const fresh = makeFakeEnv({ now: INSTALL });
  fresh.state.settingsRows = [];
  fresh.env.sheet.setup([], []);
  install(fresh.env);
  fresh.state.configStatus = 404;
  fresh.state.configCache = null;
  run(fresh.env);
  assert.match(String(setting(fresh.state, "Last error")), /Can't read the site settings/);
});

test("install twice keeps the settings and one timer", () => {
  const { env, state } = installed();
  env.sheet.writeSettingValue("Reminder", "Off");
  install(env);
  assert.equal(state.triggers, 1);
  assert.equal(setting(state, "Reminder"), "Off");
  assert.equal(setting(state, "Last error"), "");
  assert.ok(state.labels.has("Nest auto/needs you"));
});

test("install warns when the Claude key is missing", () => {
  const f = makeFakeEnv({ now: INSTALL, site: addressed });
  install(f.env);
  assert.equal(setting(f.state, "Last error"), "Add ANTHROPIC_API_KEY in Project Settings → Script Properties");
});

test("a forged request can't make the business email a stranger", () => {
  const { env, outbox, state } = installed();
  env.sheet.writeSettingValue("Auto-send starts", "2026-10-26");
  const forged = R.copy(R.booking);
  delete forged._replyto;
  forged.email = "victim@example.org";
  forged.Name = "https://evil.example/claim Bob";
  forged.Service = "refund at https://evil.example/login";
  state.now = T("2026-10-26T18:32:00Z");
  assert.equal(receive(env, body(forged)).success, "true");
  assert.equal(outbox.sent.length, 1);
  assert.equal(outbox.sent[0].to, "nestnrestcleaning@gmail.com");
  assert.match(outbox.sent[0].text, /^Not added to the client list/);
  assert.equal(state.incoming.length, 0);
  state.now = T("2026-10-26T22:00:00Z");
  run(env);
  assert.ok([...outbox.sent, ...outbox.drafts].every((e) => e.to !== "victim@example.org"));
});

test("a daily cap stops a flood before it uses up Gmail's allowance", () => {
  const { env, outbox } = installed();
  env.props.set("RL_DAY", "20261026:60");
  const res = receive(env, body(R.booking));
  assert.equal(res.success, "false");
  assert.match(res.message, /Too many requests/);
  assert.equal(outbox.sent.length, 0);
  env.props.set("RL_DAY", "20261025:60");
  assert.equal(receive(env, body(R.booking)).success, "true");
  assert.equal(env.props.get("RL_DAY"), "20261026:1");
});

test("when Gmail's allowance runs low, Mann still hears about requests", () => {
  const { env, outbox, state } = installed();
  state.quota = 10;
  assert.equal(receive(env, body(R.booking)).success, "true");
  assert.equal(outbox.sent.length, 1);
  assert.match(outbox.sent[0].text, /^Confirmation not sent: Gmail's daily email limit is nearly used up/);
  state.quota = 1;
  assert.equal(receive(env, body(R.quote)).success, "false");
});

test("when Gmail's allowance runs low, automatic emails wait as drafts", () => {
  const { env, outbox, state } = booked();
  env.sheet.writeSettingValue("Auto-send starts", "2026-10-26");
  state.quota = 10;
  const sentBefore = outbox.sent.length;
  run(env);
  assert.equal(outbox.sent.length, sentBefore);
  assert.equal(outbox.drafts.length, 1);
});

test("an unreadable row in Clients doesn't stop the run", () => {
  const { env, outbox, state } = booked();
  const junk = Array(17).fill("");
  junk[0] = "Mann's note: call Priya back";
  junk[16] = "not json";
  state.leadRows = [junk, Array(17).fill("")];
  run(env);
  assert.equal(outbox.drafts.length, 1);
  assert.ok(state.leadRows.some((r) => r[0] === "Mann's note: call Priya back" && r[16] === "not json"));
  assert.match(String(setting(state, "Last error")), /Couldn't read row 2/);
});

test("replies are only searched for the clients being emailed", () => {
  const { env, state } = booked();
  run(env);
  assert.deepEqual(state.searchedFor, ["priya@example.com"]);
  state.leadRows[0][11] = true;
  state.searchedFor = null;
  run(env);
  assert.equal(state.searchedFor, null);
});

test("an email that keeps failing is given up on after three tries", () => {
  const { env, state, claudeCalls } = booked();
  state.failDraft = true;
  for (let i = 0; i < 5; i++) run(env);
  assert.equal(claudeCalls.length, 3);
  const lead = rowToLead(state.leadRows[0]);
  assert.equal(lead.emails.welcome.state, "skipped");
  assert.match(lead.needsYou, /^Couldn't send Personal note: Drafts are down/);
});

test("one address can't be sent more than five confirmations in six hours", () => {
  const { env, outbox, state } = installed();
  let ok = 0;
  for (let h = 0; h < 6; h++) {
    state.now = T(`2026-10-26T${String(12 + h).padStart(2, "0")}:10:00Z`);
    for (let i = 0; i < 2; i++) if (receive(env, body(R.booking)).success === "true") ok++;
  }
  assert.equal(ok, 5);
  assert.equal(outbox.sent.filter((e) => e.to === "priya@example.com").length, 5);
});

test("without a mailing address, nothing sends on its own and Mann is told why", () => {
  const { env, outbox, state } = booked({ site });
  env.sheet.writeSettingValue("Auto-send starts", "2026-10-26");
  const sentBefore = outbox.sent.length;
  run(env);
  assert.equal(outbox.sent.length, sentBefore);
  assert.equal(outbox.drafts.length, 1);
  assert.match(String(setting(state, "Last error")), /mailing address/);
  const f = makeFakeEnv({ now: INSTALL, site });
  f.env.props.set("ANTHROPIC_API_KEY", "k");
  install(f.env);
  assert.match(String(setting(f.state, "Last error")), /mailing address/);
});

test("Mann's opt-out tick made during a run is kept", () => {
  const { env, state } = booked();
  state.onDraft = () => { if (state.leadRows[0]) state.leadRows[0][11] = true; };
  run(env);
  assert.equal(rowToLead(state.leadRows[0]).optedOut, true);
});

const rowFor = (req, at, patch = {}) => leadToRow(Object.assign(leadFromIncoming(incomingRecord(req, T(at), { messageId: "m-" + at, threadId: "t" }), clock), patch), T(at), clock);

test("requests that never became bookings are removed after 12 months", () => {
  const { env, state } = installed();
  const oldQuote = R.copy(R.quote);
  const client = R.copy(R.booking);
  client.Reference = "NR-CCCC";
  state.leadRows = [
    rowFor(oldQuote, "2025-09-01T15:00:00Z"),
    rowFor(client, "2025-08-01T15:00:00Z", { eventId: "e0", eventStart: "2025-08-05T15:00:00.000Z", firstCleanAt: "2025-08-05T15:00:00.000Z" }),
    rowFor(R.quote, "2025-07-01T15:00:00Z", { optedOut: true, email: "stop@example.com" }),
    rowFor(R.quote, "2026-06-01T15:00:00Z")
  ];
  state.now = T("2026-10-26T18:00:00Z");
  run(env);
  const refs = state.leadRows.map((r) => r[1]);
  assert.equal(refs.length, 3);
  assert.ok(refs.includes("NR-CCCC"));
  assert.ok(!refs.includes("Q-250901110000"));
  assert.ok(state.leadRows.some((r) => r[11] === true));
  assert.ok(state.log.some((l) => /Removed 1 request/.test(l[2])));
});

test("two requests that end up with the same reference are both kept", () => {
  const { env, state } = installed();
  state.now = T("2026-10-26T18:32:00Z");
  const second = R.copy(R.quote);
  second._replyto = second.email = "kim@example.com";
  receive(env, body(R.quote));
  receive(env, body(second));
  run(env);
  const refs = state.leadRows.map((r) => r[1]);
  assert.equal(refs.length, 2);
  assert.notEqual(refs[0], refs[1]);
  run(env);
  assert.equal(state.leadRows.length, 2);
});

test("a calendar failure is reported in Settings instead of stopping silently", () => {
  const { env, state } = booked();
  env.calendar.events = () => { throw new Error("Calendar is down"); };
  run(env);
  assert.match(String(setting(state, "Last error")), /Calendar is down/);
  assert.equal(state.incoming.length, 0);
});
