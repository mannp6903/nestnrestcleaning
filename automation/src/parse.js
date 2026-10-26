/* Reads the request table back out of Mann's new-request email, and turns a queued request into a lead. */

function decodeEntities(s) {
  return s.replace(/&#x([0-9a-f]+);/gi, function (m, h) { return String.fromCharCode(parseInt(h, 16)); })
    .replace(/&#(\d+);/g, function (m, d) { return String.fromCharCode(+d); })
    .replace(/&nbsp;/g, " ").replace(/&quot;/g, '"').replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&");
}

function cellText(html) {
  var t = decodeEntities(html.replace(/<br\s*\/?>/gi, "\n").replace(/<[^>]*>/g, ""));
  return t.split("\n").map(function (line) { return line.replace(/[ \t]+/g, " ").trim(); }).join("\n").trim();
}

function parseRequestTable(html) {
  var out = {};
  String(html || "").split(/<tr[\s>]/i).slice(1).forEach(function (row) {
    var cells = [], re = /<t[hd][^>]*>([\s\S]*?)<\/t[hd]>/gi, m;
    while ((m = re.exec(row))) cells.push(cellText(m[1]));
    if (cells.length === 2) out[cells[0]] = cells[1];
  });
  return out;
}

function notesFrom(fields) {
  var n = String(fields.Notes || "").trim();
  return n === "None" || n === "—" ? "" : n;
}

function leadFromIncoming(record, clock) {
  var f = record.fields, booking = record.form === "booking", received = new Date(record.receivedAt);
  var name = String(f.Name || "").trim(), email = String(f.email || "").trim();
  if (!/@/.test(email)) email = "";
  var lead = {
    ref: "", kind: booking ? "booking" : "quote", form: f.Service || "", receivedAt: received.toISOString(),
    name: name, firstName: name.split(/\s+/)[0] || "", email: email, phone: f.Phone || "", area: "",
    sourceMessageId: record.messageId || "", requested: "", access: "", pets: "", referrer: "", hasNotes: !!record.hasNotes,
    needsYou: "", optedOut: false, eventId: "", eventStart: "", firstCleanAt: "", emails: {}, clientRepliedAt: "", failures: 0, lastAction: ""
  };
  if (booking) {
    lead.ref = f.Reference || "";
    lead.area = ((/\(([^)]+)\)/.exec(f["Postal code"] || "")) || [])[1] || "";
    if (f.Date && f.Date !== "Picking a time on the calendar") lead.requested = f.Date + (f["Arrival window"] ? ", " + f["Arrival window"] : "");
    lead.access = f["Getting in"] || "";
    lead.pets = f.Pets || "";
    lead.referrer = f["Referred by"] && f["Referred by"] !== "None" ? f["Referred by"] : "";
  } else {
    var p = clock.local(received), two = function (n) { return (n < 10 ? "0" : "") + n; };
    lead.ref = "Q-" + two(p.year % 100) + two(p.month) + two(p.day) + two(p.hour) + two(p.minute) + two(received.getUTCSeconds());
    lead.area = String(f["Postal code"] || "").replace(/\s/g, "").slice(0, 3).toUpperCase();
  }
  return lead;
}
