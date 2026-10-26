/* Decides, on each run, which personal emails are due for each lead, and whether each goes out as a draft or on its own.
   Pure: it reads and updates the leads, and returns the work to do. */

var PLAN_HOUR = 3600000;
var PLAN_DAY = 86400000;
var PLAN_LATE_LIMIT = PLAN_DAY; // nudges and review requests more than a day late are dropped
var PLAN_ACTIVE_DAYS = 120;
// Emails that belong to the conversation: a lead marked Needs you gets these as drafts. Reminders and reviews belong to the clean.
var CONVERSATION_KINDS = ["welcome", "requestAck", "quoteReply", "quoteNudge"];

function planEmailOf(from) {
  var m = /<([^>]+)>/.exec(String(from || ""));
  return (m ? m[1] : String(from || "")).trim().toLowerCase();
}

function sameEmail(a, b) { return !!a && !!b && a.toLowerCase() === b.toLowerCase(); }
function byStart(a, b) { return new Date(a.start) - new Date(b.start); }
// Calendar events with "walkthrough" in the title are visits for a quote, not cleans: no reminder or review, but they count as booked.
function isWalkthrough(ev) { return /walkthrough/i.test(ev.title || ""); }
function hasGuest(ev, email) { return (ev.guests || []).some(function (g) { return sameEmail(String(g), email); }); }

// The moment that is `days` calendar days after `date`'s Toronto day, at `hour` o'clock Toronto time.
function dayOffsetAt(clock, date, days, hour) {
  var p = clock.local(date), d = clock.local(clock.addDays(clock.at(p.year, p.month, p.day, 12, 0), days));
  return clock.at(d.year, d.month, d.day, hour, 0);
}

function assignEvents(leads, events) {
  var out = {}, bookings = leads.filter(function (l) { return l.kind === "booking" && l.ref; });
  events.forEach(function (ev) {
    if (isWalkthrough(ev)) return;
    var desc = ev.description || "";
    var owner = bookings.filter(function (l) { return desc.indexOf(l.ref) > -1; })[0];
    if (!owner) {
      var guests = (ev.guests || []).map(function (g) { return String(g).toLowerCase(); });
      owner = bookings.filter(function (l) { return l.email && guests.indexOf(l.email.toLowerCase()) > -1; })
        .sort(function (a, b) { return a.receivedAt < b.receivedAt ? 1 : -1; })[0];
    }
    if (owner) (out[owner.ref] = out[owner.ref] || []).push(ev);
  });
  Object.keys(out).forEach(function (k) { out[k].sort(byStart); });
  return out;
}

// The clean a booking request led to: the event carrying its reference or, more usually, an event Mann put on the
// calendar for the client's email address after the request came in (not an older clean already on the calendar).
function matchEvents(leads, events, now, assigned) {
  leads.forEach(function (l) {
    if (l.kind !== "booking" || !l.ref) return;
    var ev = events.filter(function (e) { return !isWalkthrough(e) && (e.description || "").indexOf(l.ref) > -1; }).sort(byStart)[0];
    if (!ev) {
      ev = ((assigned || {})[l.ref] || []).filter(function (e) {
        return e.created && new Date(e.created) >= new Date(l.receivedAt).getTime() - 60000;
      })[0];
    }
    if (ev) {
      l.eventId = ev.id;
      l.eventStart = new Date(ev.start).toISOString();
    } else if (l.eventStart && new Date(l.eventStart) > now) {
      // Gone from the calendar before it happened: cancelled.
      l.eventId = "";
      l.eventStart = "";
    }
    if (l.eventStart && new Date(l.eventStart) <= now && !l.firstCleanAt) l.firstCleanAt = l.eventStart;
  });
}

// Only the client's own words count: quoted earlier emails, including our footer, are ignored.
function isOptOut(text) {
  var lines = String(text || "").split(/\r?\n/), own = [];
  for (var i = 0; i < lines.length; i++) {
    var t = lines[i].trim();
    if (/^On .+wrote:$/.test(t) || (/^On /.test(t) && /wrote:$/.test(String(lines[i + 1] || "").trim())) || /^-+ ?Original Message/i.test(t) ||
      /^From: /.test(t) || t.indexOf("This email is from Nest & Rest Cleaning") > -1) break;
    if (t.charAt(0) === ">") continue;
    own.push(t);
  }
  return /unsubscribe/i.test(own.join("\n")) || own.some(function (l) { return l.toLowerCase() === "stop"; });
}

function firstSentAt(lead) {
  var first = null;
  Object.keys(lead.emails).forEach(function (k) {
    var e = lead.emails[k];
    if (e.state === "sent" && e.at && (!first || new Date(e.at) < first)) first = new Date(e.at);
  });
  return first;
}

function applyMessages(leads, messages) {
  var threads = [];
  messages.forEach(function (m) {
    var from = planEmailOf(m.from), date = new Date(m.date), flagged = false;
    var mine = leads.filter(function (l) { return sameEmail(l.email, from); });
    if (!mine.length) return;
    if (isOptOut(m.text)) {
      mine.forEach(function (l) { l.optedOut = true; });
      return;
    }
    mine.forEach(function (l) {
      var first = firstSentAt(l);
      if (!first || date <= first) return;
      if (l.clientRepliedAt && date <= new Date(l.clientRepliedAt)) return;
      l.clientRepliedAt = date.toISOString();
      l.needsYou = l.needsYou || "Client replied";
      flagged = true;
    });
    if (flagged && m.threadId && threads.indexOf(m.threadId) === -1) threads.push(m.threadId);
  });
  return threads;
}

function syncDrafts(leads, existingDraftIds, sentByThread) {
  leads.forEach(function (l) {
    Object.keys(l.emails).forEach(function (k) {
      var e = l.emails[k];
      if (e.state !== "draft" || existingDraftIds.indexOf(e.draftId) > -1) return;
      var sentAt = (sentByThread[e.threadId] || []).map(function (d) { return new Date(d); })
        .filter(function (d) { return d >= new Date(e.at); }).sort(function (a, b) { return a - b; })[0];
      if (sentAt) {
        e.state = "sent";
        e.at = sentAt.toISOString();
      } else {
        e.state = "skipped";
      }
    });
  });
}

function dueEmails(lead, ctx) {
  var out = [], s = ctx.settings, now = ctx.now, clock = ctx.clock;
  var has = function (k) { return !!lead.emails[k]; };
  var onTime = function (at) { return now >= at && now - at <= PLAN_LATE_LIMIT; };
  if (lead.kind === "booking") {
    // A request gets its reply straight away; once Mann puts the clean on the calendar, the personal note confirms it.
    if (lead.eventId) {
      if (new Date(lead.eventStart) > now && !has("welcome")) out.push({ kind: "welcome", key: "welcome", event: { id: lead.eventId, start: new Date(lead.eventStart) }, at: now });
      var welcomeDue = out.length > 0;
    } else if (lead.requested && !has("requestAck")) {
      out.push({ kind: "requestAck", key: "requestAck", event: null, at: now });
    }
    var events = ctx.assigned[lead.ref] || [], welcome = lead.emails.welcome;
    events.forEach(function (ev) {
      var start = new Date(ev.start), key = "reminder:" + ev.id + ":" + clock.dayKey(start);
      var at = dayOffsetAt(clock, start, -1, s.reminderHour);
      // Once per clean, whichever of the client's requests it was sent under; and only on the day before ("See you tomorrow").
      var sentBefore = ctx.leads.some(function (l) { return sameEmail(l.email, lead.email) && l.emails[key]; }) || has(key);
      // Not straight after the personal note, which already gave the day and time.
      var justNoted = ev.id === lead.eventId && (welcomeDue || (welcome && now - new Date(welcome.at) < 12 * PLAN_HOUR));
      if (!sentBefore && !justNoted && now >= at && now < start && clock.dayKey(now) === clock.dayKey(at)) out.push({ kind: "reminder", key: key, event: ev, at: at });
    });
    var reviewed = ctx.leads.some(function (l) { return sameEmail(l.email, lead.email) && l.emails.review; });
    var first = events[0];
    if (!reviewed && first && new Date(first.start) <= now) {
      var reviewAt = dayOffsetAt(clock, new Date(first.start), 1, s.reviewHour);
      if (onTime(reviewAt)) out.push({ kind: "review", key: "review", event: first, at: reviewAt });
    }
  } else {
    if (!has("quoteReply")) out.push({ kind: "quoteReply", key: "quoteReply", event: null, at: now });
    var reply = lead.emails.quoteReply;
    var booked = ctx.leads.some(function (l) { return l.kind === "booking" && sameEmail(l.email, lead.email) && (l.eventId || (ctx.assigned[l.ref] || []).length); }) ||
      (ctx.events || []).some(function (e) { return hasGuest(e, lead.email); });
    if (reply && reply.state === "sent" && !has("quoteNudge") && !lead.clientRepliedAt && !booked) {
      var nudgeAt = dayOffsetAt(clock, new Date(reply.at), s.quoteNudgeDays, s.quoteNudgeHour);
      if (onTime(nudgeAt)) out.push({ kind: "quoteNudge", key: "quoteNudge", event: null, at: nudgeAt });
    }
  }
  return out;
}

function deliveryMode(kind, lead, settings, now) {
  var mode = settings.modes[kind];
  if (mode === "Off") return "off";
  if (lead.needsYou && CONVERSATION_KINDS.indexOf(kind) > -1) return "draft";
  if (!settings.autoSendFrom || now < settings.autoSendFrom) return "draft";
  return mode === "Auto" ? "auto" : "draft";
}

function isActiveLead(lead, now) {
  return now - new Date(lead.receivedAt) <= PLAN_ACTIVE_DAYS * PLAN_DAY || (!!lead.eventStart && new Date(lead.eventStart) > now);
}

function planRun(input) {
  var leads = input.leads, now = input.now, settings = input.settings;
  if (!settings.on) return { todo: [], needsYouThreads: [] };
  syncDrafts(leads, input.existingDraftIds, input.sentByThread);
  // A client who said stop stays stopped, whichever request they send next.
  var stopped = {};
  leads.forEach(function (l) { if (l.optedOut && l.email) stopped[l.email.toLowerCase()] = true; });
  leads.forEach(function (l) { if (l.email && stopped[l.email.toLowerCase()]) l.optedOut = true; });
  var assigned = assignEvents(leads, input.events), todo = [], reviewing = {};
  matchEvents(leads, input.events, now, assigned);
  var threads = applyMessages(leads, input.messages);
  leads.forEach(function (l) {
    if (l.optedOut || !l.email) return;
    var events = assigned[l.ref] || [];
    if (!isActiveLead(l, now) && !events.length) return;
    dueEmails(l, { leads: leads, assigned: assigned, events: input.events, settings: settings, now: now, clock: input.clock }).forEach(function (d) {
      if (d.kind === "review") {
        if (reviewing[l.email.toLowerCase()]) return;
        reviewing[l.email.toLowerCase()] = true;
      }
      var mode = deliveryMode(d.kind, l, settings, now);
      if (mode !== "off") todo.push({ ref: l.ref, kind: d.kind, key: d.key, mode: mode, event: d.event });
    });
  });
  return { todo: todo, needsYouThreads: threads };
}
