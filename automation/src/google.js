/* The Google side: Gmail, Calendar, the Sheet, the web app and the timer. Everything else runs through env, so it's tested
   in Node; this file is checked by hand during setup (automation/README.md). */

var TZ = "America/Toronto";
var NR_CLIENTS = "Clients", NR_SETTINGS = "Settings", NR_LOG = "Log", NR_INCOMING = "Incoming", NR_CONFIG = "Config";
var NR_LOG_KEEP = 2000;

function makeGoogleEnv() {
  var props = PropertiesService.getScriptProperties(), book = null, me = null;
  function sheetBook() {
    if (!book) {
      var id = props.getProperty("SHEET_ID");
      if (!id) throw new Error("Choose Nest & Rest → Install / repair in the Sheet first");
      book = SpreadsheetApp.openById(id);
    }
    return book;
  }
  function tab(name) {
    var sh = sheetBook().getSheetByName(name);
    if (!sh) throw new Error("The " + name + " tab is missing: choose Nest & Rest → Install / repair");
    return sh;
  }
  function myEmail() { return me || (me = Session.getEffectiveUser().getEmail().toLowerCase()); }
  function fromMe(message) { return String(message.getFrom()).toLowerCase().indexOf(myEmail()) > -1; }
  function label(name) { return GmailApp.getUserLabelByName(name) || GmailApp.createLabel(name); }
  function mailOptions(email) {
    var o = { htmlBody: email.html, name: email.name };
    if (email.replyTo) o.replyTo = email.replyTo;
    return o;
  }
  function settingRow(sh, key) {
    var last = sh.getLastRow(), keys = last ? sh.getRange(1, 1, last, 1).getValues() : [];
    for (var i = 0; i < keys.length; i++) if (String(keys[i][0]).trim() === key) return i + 1;
    return 0;
  }

  return {
    now: function () { return new Date(); },
    localParts: function (date) {
      var p = Utilities.formatDate(date, TZ, "yyyy|M|d|H|m|u").split("|").map(Number);
      return { year: p[0], month: p[1], day: p[2], hour: p[3], minute: p[4], weekday: p[5] % 7 };
    },
    props: {
      get: function (k) { return props.getProperty(k); },
      set: function (k, v) { props.setProperty(k, String(v)); }
    },
    cache: {
      get: function (k) { return CacheService.getScriptCache().get(k); },
      put: function (k, v, seconds) { CacheService.getScriptCache().put(k, String(v), seconds); }
    },
    http: {
      fetch: function (url, options) {
        var r = UrlFetchApp.fetch(url, options);
        return { status: r.getResponseCode(), body: r.getContentText() };
      }
    },
    sheet: {
      readLeadRows: function () {
        var sh = tab(NR_CLIENTS), last = sh.getLastRow();
        return last < 2 ? [] : sh.getRange(2, 1, last - 1, CLIENT_HEADERS.length).getValues();
      },
      writeLeadRows: function (rows) {
        var sh = tab(NR_CLIENTS), last = sh.getLastRow();
        if (rows.length) {
          sh.getRange(2, 1, rows.length, CLIENT_HEADERS.length).setValues(rows);
          sh.getRange(2, CLIENT_HEADERS.indexOf("Opted out") + 1, rows.length, 1).insertCheckboxes();
        }
        if (last > rows.length + 1) sh.getRange(rows.length + 2, 1, last - rows.length - 1, CLIENT_HEADERS.length).clearContent();
      },
      readSettingsRows: function () {
        var sh = tab(NR_SETTINGS), last = sh.getLastRow();
        return last ? sh.getRange(1, 1, last, 2).getValues() : [];
      },
      writeSettingValue: function (key, value) {
        var sh = tab(NR_SETTINGS), row = settingRow(sh, key);
        if (row) sh.getRange(row, 2).setValue(value);
        else sh.appendRow([key, value]);
      },
      appendLog: function (entries) {
        if (!entries.length) return;
        var sh = tab(NR_LOG);
        sh.getRange(sh.getLastRow() + 1, 1, entries.length, 3).setValues(entries);
        if (sh.getLastRow() > NR_LOG_KEEP + 500) sh.deleteRows(2, sh.getLastRow() - 1 - NR_LOG_KEEP);
      },
      readConfigCache: function () { return String(tab(NR_CONFIG).getRange(1, 1).getValue() || "") || null; },
      writeConfigCache: function (text) { tab(NR_CONFIG).getRange(1, 1).setValue(text); },
      appendIncoming: function (text) { tab(NR_INCOMING).appendRow([new Date().toISOString(), text]); },
      readIncoming: function () {
        var sh = tab(NR_INCOMING), last = sh.getLastRow();
        return last < 2 ? [] : sh.getRange(2, 2, last - 1, 1).getValues().map(function (r) { return String(r[0]); });
      },
      removeIncoming: function (count) { if (count > 0) tab(NR_INCOMING).deleteRows(2, count); },
      setup: function (headers, settingsRows) {
        var b = sheetBook();
        var clients = b.getSheetByName(NR_CLIENTS) || b.insertSheet(NR_CLIENTS, 0);
        clients.getRange(1, 1, 1, headers.length).setValues([headers]).setFontWeight("bold");
        clients.setFrozenRows(1);
        // Plain text everywhere but the checkbox, so dates and links stay exactly as written.
        clients.getRange(2, 1, clients.getMaxRows() - 1, headers.length).setNumberFormat("@");
        clients.hideColumns(headers.indexOf("Data") + 1);
        var settings = b.getSheetByName(NR_SETTINGS) || b.insertSheet(NR_SETTINGS);
        settingsRows.forEach(function (r) {
          if (settingRow(settings, r[0])) return;
          var row = settings.getLastRow() + 1, cell = settings.getRange(row, 2);
          settings.getRange(row, 1).setValue(r[0]).setFontWeight("bold");
          if (typeof r[1] === "string") cell.setNumberFormat("@");
          cell.setValue(r[1]);
          if (typeof r[1] === "boolean") cell.insertCheckboxes();
          if (r[1] === "Off" || r[1] === "Draft" || r[1] === "Auto") cell.setDataValidation(SpreadsheetApp.newDataValidation().requireValueInList(["Off", "Draft", "Auto"]).build());
        });
        settings.setColumnWidth(1, 300);
        var log = b.getSheetByName(NR_LOG) || b.insertSheet(NR_LOG);
        if (!log.getLastRow()) log.appendRow(["When", "Ref", "What happened"]);
        var incoming = b.getSheetByName(NR_INCOMING) || b.insertSheet(NR_INCOMING);
        if (!incoming.getLastRow()) incoming.appendRow(["Received", "Request"]);
        incoming.hideSheet();
        (b.getSheetByName(NR_CONFIG) || b.insertSheet(NR_CONFIG)).hideSheet();
      }
    },
    gmail: {
      send: function (email) {
        var m = GmailApp.createDraft(email.to, email.subject, email.text, mailOptions(email)).send();
        return { messageId: m.getId(), threadId: m.getThread().getId(), sentAt: m.getDate() };
      },
      createDraft: function (email) {
        var d = GmailApp.createDraft(email.to, email.subject, email.text, mailOptions(email));
        return { draftId: d.getId(), threadId: d.getMessage().getThread().getId() };
      },
      getMessageHtml: function (id) { return GmailApp.getMessageById(id).getBody(); },
      findClientMessages: function (since) {
        var out = [];
        GmailApp.search("in:inbox newer_than:3d -from:me", 0, 100).forEach(function (th) {
          th.getMessages().forEach(function (m) {
            if (m.getDate() > since && !m.isDraft() && !fromMe(m)) out.push({ from: m.getFrom(), date: m.getDate(), text: m.getPlainBody(), threadId: th.getId() });
          });
        });
        return out;
      },
      existingDraftIds: function () { return GmailApp.getDrafts().map(function (d) { return d.getId(); }); },
      sentDatesInThread: function (threadId) {
        var th = GmailApp.getThreadById(threadId);
        if (!th) return [];
        return th.getMessages().filter(function (m) { return !m.isDraft() && fromMe(m); }).map(function (m) { return m.getDate(); });
      },
      label: function (threadId, name) {
        var th = GmailApp.getThreadById(threadId);
        if (th) th.addLabel(label(name));
      },
      ensureLabels: function (names) {
        names.forEach(function (n) {
          if (n.indexOf("/") > -1) label(n.split("/")[0]);
          label(n);
        });
      }
    },
    calendar: {
      events: function (from, to) {
        return CalendarApp.getDefaultCalendar().getEvents(from, to).map(function (e) {
          return { id: e.getId(), start: e.getStartTime(), end: e.getEndTime(), description: e.getDescription() || "", guests: e.getGuestList().map(function (g) { return g.getEmail(); }) };
        });
      }
    },
    triggers: {
      reset: function () {
        ScriptApp.getProjectTriggers().forEach(function (t) { if (t.getHandlerFunction() === "runAutomation") ScriptApp.deleteTrigger(t); });
        ScriptApp.newTrigger("runAutomation").timeBased().everyMinutes(5).create();
      }
    }
  };
}

// The website's forms post here (the web app). Bookings and quotes are answered in seconds; the personal emails follow on the next run.
function doPost(e) {
  var res;
  try { res = receive(makeGoogleEnv(), e && e.postData ? e.postData.contents : ""); } catch (err) { res = { success: "false", message: "Please email us" }; }
  return ContentService.createTextOutput(JSON.stringify(res)).setMimeType(ContentService.MimeType.JSON);
}

// Open the web app's address in a browser to check it's deployed.
function doGet() {
  return ContentService.createTextOutput("Nest & Rest Cleaning forms: working.");
}

function runAutomation() {
  var lock = LockService.getScriptLock();
  if (!lock.tryLock(10000)) return;
  try { run(makeGoogleEnv()); } finally { lock.releaseLock(); }
}

function installAutomation() {
  var active = SpreadsheetApp.getActive();
  PropertiesService.getScriptProperties().setProperty("SHEET_ID", active.getId());
  install(makeGoogleEnv());
  active.toast("Installed. The automation checks for work every 5 minutes.", "Nest & Rest", 10);
}

function pauseAutomation() {
  makeGoogleEnv().sheet.writeSettingValue("Automation on", false);
  SpreadsheetApp.getActive().toast("Paused. Requests and confirmations still work; tick Automation on in Settings to restart.", "Nest & Rest", 10);
}

function onOpen() {
  SpreadsheetApp.getUi().createMenu("Nest & Rest")
    .addItem("Run now", "runAutomation")
    .addItem("Pause everything", "pauseAutomation")
    .addItem("Install / repair", "installAutomation")
    .addToUi();
}
