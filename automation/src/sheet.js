/* The "Nest & Rest clients" Sheet: one row per lead, the Settings tab, and each row's status.
   The script rewrites every column except "Needs you" and "Opted out", which Mann can edit. */

var CLIENT_HEADERS = ["Received", "Ref", "Type", "Service", "Name", "Email", "Phone", "Area", "Booked time", "Status", "Needs you", "Opted out",
  "First clean", "Review requested", "Last action", "Last email", "Data"];
var KIND_LABELS = { welcome: "Personal note", requestAck: "Booking request reply", quoteReply: "Quote reply",
  quoteNudge: "Quote nudge", reminder: "Reminder", review: "Review request" };
var DEFAULT_MODES = { welcome: "Auto", requestAck: "Draft", quoteReply: "Draft", quoteNudge: "Auto", reminder: "Auto", review: "Auto" };
// Settings tab: label, setting name, default, lowest and highest allowed.
var SETTING_NUMBERS = [
  ["Quote nudge after (days)", "quoteNudgeDays", 2, 1, 30],
  ["Quote nudge time (hour, 0-23)", "quoteNudgeHour", 10, 0, 23],
  ["Reminder time, day before (hour, 0-23)", "reminderHour", 18, 0, 23],
  ["Review request time, day after (hour, 0-23)", "reviewHour", 11, 0, 23]
];

function emailSent(lead, key) { var e = lead.emails[key]; return !!(e && e.state === "sent"); }

function statusOf(lead, now) {
  var keys = Object.keys(lead.emails);
  if (lead.optedOut) return "Opted out";
  if (lead.needsYou) return "Needs you";
  if (keys.some(function (k) { return lead.emails[k].state === "draft"; })) return "Draft ready";
  if (lead.clientRepliedAt) return "Paused (client replied)";
  if (lead.kind === "booking") {
    if (emailSent(lead, "review")) return "Reviewed";
    if (lead.eventId && keys.some(function (k) { return k.indexOf("reminder:" + lead.eventId + ":") === 0 && emailSent(lead, k); })) return "Reminder sent";
    if (lead.eventStart) return "Booked";
    if (lead.requested) return emailSent(lead, "requestAck") ? "Sent" : "New";
    return "Waiting for time";
  }
  if (emailSent(lead, "quoteNudge")) return new Date(now) - new Date(lead.emails.quoteNudge.at) >= 14 * 86400000 ? "Done" : "Nudged";
  if (emailSent(lead, "quoteReply")) return "Quote sent";
  return "New";
}

function leadToRow(lead, now, clock) {
  var newest = null, review = lead.emails.review;
  Object.keys(lead.emails).forEach(function (k) {
    var e = lead.emails[k];
    if (e.threadId && (!newest || e.at > newest.at)) newest = e;
  });
  return [
    clock.formatStamp(new Date(lead.receivedAt)), lead.ref, lead.kind === "booking" ? "Booking" : "Quote", lead.form, lead.name, lead.email, lead.phone, lead.area,
    lead.eventStart ? clock.formatWhen(new Date(lead.eventStart)) : "", statusOf(lead, now), lead.needsYou, !!lead.optedOut,
    lead.firstCleanAt ? clock.dayKey(new Date(lead.firstCleanAt)) : "",
    review && review.state !== "skipped" && review.at ? clock.dayKey(new Date(review.at)) : "",
    lead.lastAction, newest ? "https://mail.google.com/mail/u/0/#all/" + newest.threadId : "", JSON.stringify(lead)
  ];
}

function rowToLead(row) {
  var lead = JSON.parse(row[16]);
  lead.needsYou = String(row[10] == null ? "" : row[10]).trim();
  lead.optedOut = row[11] === true || String(row[11]).toUpperCase() === "TRUE";
  return lead;
}

function defaultSettingsRows(now, clock) {
  var rows = [["Automation on", true], ["Auto-send starts", clock.dayKey(clock.addDays(now, 14))]];
  Object.keys(KIND_LABELS).forEach(function (k) { rows.push([KIND_LABELS[k], DEFAULT_MODES[k]]); });
  SETTING_NUMBERS.forEach(function (n) { rows.push([n[0], n[2]]); });
  return rows.concat([["Last run", ""], ["Last error", ""]]);
}

function parseSettings(rows, clock) {
  var v = {}, problems = [];
  rows.forEach(function (r) { v[String(r[0]).trim()] = r[1]; });
  var s = { on: true, autoSendFrom: null, modes: {}, problems: problems };
  var on = String(v["Automation on"]).toUpperCase();
  if (on === "TRUE" || on === "FALSE") s.on = on === "TRUE";
  else problems.push("Automation on should be ticked or unticked");
  var start = v["Auto-send starts"], m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(start == null ? "" : start).trim());
  if (start && typeof start.getTime === "function") {
    var p = clock.local(start);
    s.autoSendFrom = clock.at(p.year, p.month, p.day, 0, 0);
  } else if (m) {
    s.autoSendFrom = clock.at(+m[1], +m[2], +m[3], 0, 0);
  } else if (String(start == null ? "" : start).trim()) {
    problems.push("Auto-send starts should be a date like 2026-11-09");
  }
  Object.keys(KIND_LABELS).forEach(function (k) {
    var raw = String(v[KIND_LABELS[k]] == null ? "" : v[KIND_LABELS[k]]).trim().toLowerCase();
    var mode = { off: "Off", draft: "Draft", auto: "Auto" }[raw];
    if (!mode) problems.push(KIND_LABELS[k] + " should be Off, Draft or Auto");
    s.modes[k] = mode || DEFAULT_MODES[k];
  });
  SETTING_NUMBERS.forEach(function (n) {
    var x = Number(v[n[0]]);
    var ok = v[n[0]] !== "" && v[n[0]] != null && Math.floor(x) === x && x >= n[3] && x <= n[4];
    if (!ok) problems.push(n[0] + " should be a whole number from " + n[3] + " to " + n[4]);
    s[n[1]] = ok ? x : n[2];
  });
  return s;
}
