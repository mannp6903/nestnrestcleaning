// An in-memory stand-in for Gmail, Calendar, Sheets and the rest of Google, with the same env interface google.js builds.
import { torontoParts, site } from "./load.mjs";

const okParagraph = () => ({ status: 200, body: JSON.stringify({ stop_reason: "end_turn", content: [{ type: "text", text: JSON.stringify({ paragraph: "Thank you for the note about your cat. I'll start in the kitchen.", needs_mann: false, reason: "" }) }] }) });

export function makeFakeEnv({ now, events = [], messages = [], claude = okParagraph } = {}) {
  const state = {
    now: new Date(now), props: {}, cache: {}, leadRows: [], settingsRows: null, log: [], configCache: null, configStatus: 200,
    incoming: [], triggers: 0, labels: new Set(), labelled: [], html: {}, drafts: {}, sentInThread: {}, events, messages, failSend: null,
    failDraft: false, quota: 100, searchedFor: null
  };
  const outbox = { drafts: [], sent: [] }, claudeCalls = [];
  let seq = 0;
  const env = {
    now: () => new Date(state.now),
    localParts: torontoParts,
    props: { get: (k) => (k in state.props ? state.props[k] : null), set: (k, v) => { state.props[k] = String(v); } },
    cache: { get: (k) => (k in state.cache ? state.cache[k] : null), put: (k, v) => { state.cache[k] = String(v); } },
    http: {
      fetch(url, options) {
        if (url === globalThis.SITE_CONFIG_URL) return state.configStatus === 200 ? { status: 200, body: JSON.stringify(site) } : { status: state.configStatus, body: "Not found" };
        if (url === "https://api.anthropic.com/v1/messages") {
          const payload = JSON.parse(options.payload);
          claudeCalls.push(payload);
          return claude(payload);
        }
        throw new Error("Unexpected fetch: " + url);
      }
    },
    sheet: {
      readLeadRows: () => state.leadRows.map((r) => r.slice()),
      writeLeadRows: (rows) => { state.leadRows = rows.map((r) => r.slice()); },
      readSettingsRows: () => state.settingsRows.map((r) => r.slice()),
      writeSettingValue: (k, v) => { const row = state.settingsRows.find((r) => r[0] === k); if (row) row[1] = v; else state.settingsRows.push([k, v]); },
      appendLog: (entries) => { state.log.push(...entries); },
      readConfigCache: () => state.configCache,
      writeConfigCache: (t) => { state.configCache = t; },
      appendIncoming: (t) => { state.incoming.push(t); },
      readIncoming: () => state.incoming.slice(),
      removeIncoming: (n) => { state.incoming.splice(0, n); },
      setup: (headers, rows) => {
        state.headers = headers;
        state.settingsRows = state.settingsRows || [];
        rows.forEach(([k, v]) => { if (!state.settingsRows.some((r) => r[0] === k)) state.settingsRows.push([k, v]); });
      }
    },
    gmail: {
      send(email) {
        if (state.failSend && state.failSend(email)) throw new Error("Gmail is down");
        state.quota--;
        const messageId = "m" + ++seq, threadId = "t" + seq;
        outbox.sent.push({ messageId, threadId, ...email });
        state.html[messageId] = email.html;
        return { messageId, threadId, sentAt: new Date(state.now) };
      },
      createDraft(email) {
        if (state.failDraft) throw new Error("Drafts are down");
        const draftId = "d" + ++seq, threadId = "t" + seq;
        outbox.drafts.push({ draftId, threadId, ...email });
        state.drafts[draftId] = threadId;
        return { draftId, threadId };
      },
      getMessageHtml: (id) => { if (!(id in state.html)) throw new Error("No message " + id); return state.html[id]; },
      findClientMessages: (since, emails) => {
        state.searchedFor = emails.slice();
        const addr = (from) => (/<([^>]+)>/.exec(from) || [null, from])[1].trim().toLowerCase();
        return state.messages.filter((m) => m.date > since && emails.includes(addr(m.from)));
      },
      remainingQuota: () => state.quota,
      existingDraftIds: () => Object.keys(state.drafts),
      sentDatesInThread: (t) => state.sentInThread[t] || [],
      label: (t, name) => { state.labelled.push([t, name]); },
      ensureLabels: (names) => names.forEach((n) => state.labels.add(n))
    },
    calendar: { events: (from, to) => state.events.filter((e) => e.start >= from && e.start <= to) },
    triggers: { reset: () => { state.triggers = 1; } }
  };
  return { env, outbox, state, claudeCalls };
}
