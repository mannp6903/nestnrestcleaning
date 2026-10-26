/* The three things the script does: receive a form request from the website, run every 5 minutes, and install itself.
   Everything Google-specific comes in through env (see google.js), so this file runs the same in tests. */

var LABELS = { draft: "Nest auto/draft ready", sent: "Nest auto/sent", needsYou: "Nest auto/needs you" };
var CONFIG_MAX_AGE = 6 * 3600000;
var MAIN_DAY = 86400000;
// Personal emails that carry Claude's paragraph.
var PARAGRAPH_KINDS = ["welcome", "requestAck", "quoteReply"];
// A free Gmail account sends to about 100 people a day. Below this many, confirmations stop and personal emails wait as drafts,
// keeping the rest for Mann's new-request emails.
var QUOTA_RESERVE = 15;
var MAIN_RETRIES = 3;
var NO_ADDRESS = "Add your mailing address to business.mailingAddress in js/config.js: Canada's anti-spam law needs it in every email. Until then, personal emails wait as drafts";

// What's missing before the automation may send on its own.
function setupProblems(env, site) {
  var out = [];
  if (!site.business.mailingAddress) out.push(NO_ADDRESS);
  if (site.automation.aiReplies && !env.props.get("ANTHROPIC_API_KEY")) out.push("Add ANTHROPIC_API_KEY in Project Settings → Script Properties");
  return out;
}

// The site's published settings, refreshed at most every 6 hours, with the last good copy kept in the Sheet.
function loadSiteConfig(env, now) {
  var cached = null;
  if (now - Number(env.props.get("CONFIG_FETCHED_AT") || 0) < CONFIG_MAX_AGE) {
    cached = env.sheet.readConfigCache();
    var fresh = parseSiteConfig(cached);
    if (fresh) return fresh;
  }
  try {
    var r = env.http.fetch(SITE_CONFIG_URL, { method: "get", muteHttpExceptions: true }), site = r.status === 200 ? parseSiteConfig(r.body) : null;
    if (site) {
      env.sheet.writeConfigCache(r.body);
      env.props.set("CONFIG_FETCHED_AT", String(now.getTime()));
      return site;
    }
  } catch (e) { /* fall back to the saved copy */ }
  var saved = parseSiteConfig(cached || env.sheet.readConfigCache());
  if (saved) return saved;
  throw new Error("Can't read the site settings at " + SITE_CONFIG_URL);
}

function parseSiteConfig(text) {
  try {
    var site = JSON.parse(text);
    return site && site.business && site.automation ? site : null;
  } catch (e) { return null; }
}

function receive(env, bodyText) {
  var now = env.now(), clock = makeClock(env.localParts), log = [];
  var note = function (ref, message) { log.push([clock.formatStamp(now), ref || "", message]); };
  var answer = function (res) {
    if (log.length) { try { env.sheet.appendLog(log); } catch (e) { /* the answer matters more than the log */ } }
    return res;
  };
  var payload;
  try { payload = JSON.parse(bodyText); } catch (e) { payload = null; }
  var check = checkRequest(payload);
  if (!check.ok) {
    note("", "Refused a form request: " + check.error);
    return answer({ success: "false", message: "Bad request" });
  }
  if (check.spam) return answer({ success: "true" });
  var ref = String(payload.Reference || ""), site;
  try { site = loadSiteConfig(env, now); } catch (e) {
    note(ref, e.message);
    return answer({ success: "false", message: "Please email us" });
  }
  var keys = rateLimitKeys(payload, now), counts = keys.map(function (k) { return Number(env.cache.get(k) || 0); });
  var day = clock.dayKey(now).replace(/-/g, ""), dayCount = String(env.props.get("RL_DAY") || "").split(":");
  var today = dayCount[0] === day ? Number(dayCount[1]) || 0 : 0;
  if (isOverLimit(counts) || today >= RATE_LIMITS.perDay) {
    note(ref, "Refused a " + payload._form + " request: too many " + (today >= RATE_LIMITS.perDay ? "today" : "in the last hour"));
    return answer({ success: "false", message: "Too many requests. Please email us." });
  }
  var left = env.gmail.remainingQuota();
  if (left < 2) {
    note(ref, "Refused a " + payload._form + " request: Gmail's daily email limit is used up");
    return answer({ success: "false", message: "Please email us" });
  }
  keys.forEach(function (k, i) { env.cache.put(k, String(counts[i] + 1), k.indexOf("rl:email6h:") === 0 ? 21600 : 3600); });
  env.props.set("RL_DAY", day + ":" + (today + 1));
  var conf = confirmationEmail(payload, site), problem = leadProblem(payload, site), sent;
  if (conf.email && left < QUOTA_RESERVE) conf = { email: null, problem: "Confirmation not sent: Gmail's daily email limit is nearly used up." };
  if (conf.problem) note(ref, conf.problem);
  if (problem) note(ref, problem);
  try { sent = env.gmail.send(notificationEmail(payload, site, [problem, conf.problem].filter(Boolean).join(" "))); } catch (e) {
    note(ref, "Couldn't email the new " + payload._form + " request: " + e.message);
    return answer({ success: "false", message: "Please email us" });
  }
  if (conf.email) {
    try { env.gmail.send(conf.email); } catch (e) { note(ref, "Couldn't send the client's confirmation: " + e.message); }
  }
  var record = problem ? null : incomingRecord(payload, now, sent);
  if (record) {
    try { env.sheet.appendIncoming(JSON.stringify(record)); } catch (e) { note(ref, "Couldn't queue the request for its personal email: " + e.message); }
  }
  return answer({ success: "true" });
}

// Claude's paragraph, or why there isn't one. needsYou is set whenever Mann should look before it goes out.
function writeParagraph(env, kind, lead, fields, site) {
  var key = env.props.get("ANTHROPIC_API_KEY") || "", r;
  if (!key) return { paragraph: "", needsYou: "Couldn't write the personal paragraph: ANTHROPIC_API_KEY isn't set" };
  var req = buildClaudeRequest(kind, lead, fields, site, key);
  try {
    var res = env.http.fetch(req.url, req.options);
    r = readClaudeResponse(res.status, res.body);
  } catch (e) { r = { ok: false, error: e.message }; }
  if (!r.ok) return { paragraph: "", needsYou: "Couldn't write the personal paragraph: " + r.error };
  var check = checkParagraph(r.paragraph);
  if (!check.ok) return { paragraph: "", needsYou: "Couldn't write the personal paragraph: " + check.reasons.join(", ") };
  return { paragraph: r.paragraph, needsYou: r.needsMann ? r.reason || "Claude asked you to check this one" : "" };
}

function run(env) {
  var now = env.now(), clock = makeClock(env.localParts), log = [], errors = [], counts = { drafted: 0, sent: 0 };
  var note = function (ref, message) { log.push([clock.formatStamp(now), ref || "", message]); errors.push((ref ? ref + ": " : "") + message); };
  var settings = parseSettings(env.sheet.readSettingsRows(), clock);
  var finish = function (suffix) {
    env.sheet.writeSettingValue("Last run", clock.formatStamp(now) + (suffix || ""));
    env.sheet.writeSettingValue("Last error", errors.concat(settings.problems).join("; "));
    if (log.length) env.sheet.appendLog(log);
    return { drafted: counts.drafted, sent: counts.sent, errors: errors };
  };
  if (!settings.on) return finish(" (paused)");
  var site;
  try { site = loadSiteConfig(env, now); } catch (e) { note("", e.message); return finish(); }

  // Take new leads from the Incoming tab. They're written to Clients before Incoming is cleared, so none is lost.
  // A row the script can't read (a note typed into the tab, say) is left exactly as it is, and the rest carry on.
  var leads = [], unreadable = [], incoming = env.sheet.readIncoming();
  env.sheet.readLeadRows().forEach(function (row, i) {
    if (row.every(function (v) { return v === "" || v === null || v === false; })) return;
    try { leads.push(rowToLead(row)); } catch (e) {
      unreadable.push(row);
      note("", "Couldn't read row " + (i + 2) + " of Clients, so left it as it is");
    }
  });
  incoming.forEach(function (text) {
    try {
      var lead = leadFromIncoming(JSON.parse(text), clock);
      if (!leads.some(function (l) { return l.ref === lead.ref; })) leads.push(lead);
    } catch (e) { note("", "Couldn't read a queued request: " + e.message); }
  });
  var save = function () {
    // An "Opted out" tick Mann made while this run was going is kept (CASL): re-read the column just before writing.
    env.sheet.readLeadRows().forEach(function (row) {
      try {
        var current = rowToLead(row);
        if (current.optedOut) leads.forEach(function (l) { if (l.ref === current.ref) l.optedOut = true; });
      } catch (e) { /* unreadable rows are kept as they are */ }
    });
    env.sheet.writeLeadRows(leads.map(function (l) { return leadToRow(l, now, clock); }).concat(unreadable));
  };
  if (incoming.length) {
    save();
    env.sheet.removeIncoming(incoming.length);
  }

  var events = env.calendar.events(new Date(now.getTime() - 2 * MAIN_DAY), new Date(now.getTime() + 90 * MAIN_DAY));
  // Replies and opt-outs only matter from clients the automation might still email.
  var watching = [];
  leads.forEach(function (l) {
    var e = (l.email || "").toLowerCase();
    if (e && !l.optedOut && isActiveLead(l, now) && watching.indexOf(e) === -1) watching.push(e);
  });
  var messages = watching.length ? env.gmail.findClientMessages(new Date(now.getTime() - 3 * MAIN_DAY), watching) : [];
  var pending = [];
  leads.forEach(function (l) {
    Object.keys(l.emails).forEach(function (k) { if (l.emails[k].state === "draft") pending.push(l.emails[k]); });
  });
  var draftIds = pending.length ? env.gmail.existingDraftIds() : [], sentByThread = {};
  pending.forEach(function (e) {
    if (draftIds.indexOf(e.draftId) === -1 && !sentByThread[e.threadId]) sentByThread[e.threadId] = env.gmail.sentDatesInThread(e.threadId);
  });
  var plan = planRun({ leads: leads, events: events, messages: messages, existingDraftIds: draftIds, sentByThread: sentByThread, settings: settings, now: now, clock: clock });

  plan.todo.forEach(function (t) {
    var lead = leads.filter(function (l) { return l.ref === t.ref; })[0], label = KIND_LABELS[t.kind];
    try {
      var paragraph = "", mode = t.mode;
      if (PARAGRAPH_KINDS.indexOf(t.kind) > -1) {
        var fields = parseRequestTable(env.gmail.getMessageHtml(lead.sourceMessageId));
        if (site.automation.aiReplies) {
          var p = writeParagraph(env, t.kind, lead, fields, site);
          paragraph = p.paragraph;
          if (p.needsYou) lead.needsYou = p.needsYou;
        } else if (lead.hasNotes) {
          lead.needsYou = lead.needsYou || "Client wrote notes: add a line before sending";
        }
        if (lead.needsYou) mode = "draft";
      }
      var email = composeEmail(t.kind, lead, { site: site, clock: clock, event: t.event, paragraph: paragraph });
      if (mode === "auto" && (env.gmail.remainingQuota() < QUOTA_RESERVE || !site.business.mailingAddress)) mode = "draft";
      if (mode === "auto") {
        var s = env.gmail.send(email);
        lead.emails[t.key] = { state: "sent", at: new Date(s.sentAt).toISOString(), draftId: "", threadId: s.threadId };
        env.gmail.label(s.threadId, LABELS.sent);
        lead.lastAction = label + " sent";
        counts.sent++;
      } else {
        var d = env.gmail.createDraft(email);
        lead.emails[t.key] = { state: "draft", at: now.toISOString(), draftId: d.draftId, threadId: d.threadId };
        env.gmail.label(d.threadId, lead.needsYou ? LABELS.needsYou : LABELS.draft);
        lead.lastAction = label + " drafted";
        counts.drafted++;
      }
      lead.failures = 0;
      save(); // recorded straight away, so a crash later in the run can't send it twice
    } catch (e) {
      lead.failures = (lead.failures || 0) + 1;
      note(lead.ref, "Couldn't do the " + label.toLowerCase() + ": " + e.message);
      if (lead.failures >= MAIN_RETRIES) {
        // Given up: no more tries (each one could call Claude again), and Mann is told.
        lead.needsYou = "Couldn't send " + label + ": " + e.message;
        lead.emails[t.key] = { state: "skipped", at: now.toISOString(), draftId: "", threadId: "" };
        lead.failures = 0;
        save();
      }
    }
  });
  if (!site.business.mailingAddress) errors.push(NO_ADDRESS);
  plan.needsYouThreads.forEach(function (th) {
    try { env.gmail.label(th, LABELS.needsYou); } catch (e) { note("", "Couldn't label a client's reply: " + e.message); }
  });
  save();
  return finish();
}

function install(env) {
  var now = env.now(), clock = makeClock(env.localParts);
  env.sheet.setup(CLIENT_HEADERS, defaultSettingsRows(now, clock));
  env.gmail.ensureLabels(Object.keys(LABELS).map(function (k) { return LABELS[k]; }));
  env.triggers.reset();
  var problems;
  try { problems = setupProblems(env, loadSiteConfig(env, now)); } catch (e) { problems = [e.message]; }
  env.sheet.writeSettingValue("Last error", problems.join("; "));
}
