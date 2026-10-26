import test from "node:test";
import assert from "node:assert/strict";
import "./load.mjs";
import { makeFakeEnv } from "./fake-env.mjs";
import * as R from "./fixtures/requests.mjs";

const INSTALL = "2026-10-26T12:00:00Z";
const T = (s) => new Date(s);
const NOV2 = T("2026-11-02T15:00:00Z");
const calEvent = { id: "e1", start: NOV2, end: NOV2, description: "Booking NR-AB12: Deep Cleaning", guests: ["priya@example.com"] };
const body = (o) => JSON.stringify(o);
const setting = (state, k) => state.settingsRows.find((r) => r[0] === k)[1];

function installed(opts = {}) {
  const f = makeFakeEnv({ now: INSTALL, ...opts });
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
  const f = makeFakeEnv({ now: INSTALL });
  install(f.env);
  assert.equal(setting(f.state, "Last error"), "Add ANTHROPIC_API_KEY in Project Settings → Script Properties");
});
