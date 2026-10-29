// The Google Sheet script (tools/sheet/Code.gs), run in Node against stand-in Google services.
import { test, assert } from "./lib.mjs";
import { loadScript } from "./gas-fakes.mjs";

const ATT = "abcdefghijklmnop1234";
function booking(over = {}, fields = {}) {
  return {
    form: "booking", reference: "NR-AB12", attempt: ATT, honey: "", email: "p@example.com",
    fields: { Service: "Deep Cleaning", Name: "Priya Sample", Phone: "647 555 0123", Address: "1 Example St", "Postal code": "M1P 1A1", Notes: "None", ...fields },
    ...over
  };
}
function fresh(opts) { const g = loadScript(opts); g.ctx.setup(); return g; }

export default async function () {
  test("saves a booking as one row under the right headers", async () => {
    const g = fresh();
    const res = g.ctx.handleRequest_(booking());
    assert(res.ok === true && res.duplicate === false && res.reference === "NR-AB12", "result: " + JSON.stringify(res));
    const s = g.sheet("Bookings");
    assert(s.rows.length === 1, "expected 1 row, got " + s.rows.length);
    const row = s.rows[0];
    assert(row.Reference === "NR-AB12" && row.Name === "Priya Sample" && row.Status === "Received" && row.Received === "2026-10-29 10:00", "row: " + JSON.stringify(row));
    assert(row.Attempt === ATT && row.Email === "p@example.com", "attempt and email: " + JSON.stringify(row));
    assert(s.headers.slice(0, 5).join("|") === "Reference|Received|Status|Confirmed time|Final price", "first headers: " + s.headers.join("|"));
    assert(s.headers.slice(-3).join("|") === "Attempt|Alert email|Receipt email", "last headers: " + s.headers.join("|"));
  });

  test("same attempt twice saves one row", async () => {
    const g = fresh();
    const a = g.ctx.handleRequest_(booking());
    const b = g.ctx.handleRequest_(booking());
    assert(b.ok === true && b.duplicate === true && b.reference === a.reference, "second answer: " + JSON.stringify(b));
    assert(g.sheet("Bookings").rows.length === 1, "a retry must not add a row");
  });

  test("reference clash gets a fresh reference", async () => {
    const g = fresh();
    g.ctx.handleRequest_(booking());
    const b = g.ctx.handleRequest_(booking({ attempt: "zyxwvutsrqponmlk9876" }));
    assert(b.ok === true && b.reference !== "NR-AB12" && /^NR-[A-Z0-9]{4}$/.test(b.reference), "clash answer: " + JSON.stringify(b));
    assert(g.sheet("Bookings").rows.length === 2, "a different attempt is a different request");
    const c = g.ctx.handleRequest_(booking({ attempt: "qwertyuiopasdfgh5555", reference: "bad" }));
    assert(c.ok === true && /^NR-[A-Z0-9]{4}$/.test(c.reference), "a malformed reference gets a proper one: " + JSON.stringify(c));
    const gift = g.ctx.handleRequest_({ form: "gift", reference: "GIFT-AB12", attempt: "giftattempt0000001", honey: "", email: "g@example.com", fields: { "Your name": "Gale", "Your phone": "647 555 0100", Amount: "$100" } });
    const gift2 = g.ctx.handleRequest_({ form: "gift", reference: "GIFT-AB12", attempt: "giftattempt0000002", honey: "", email: "g@example.com", fields: { "Your name": "Gale", "Your phone": "647 555 0100", Amount: "$100" } });
    assert(gift.reference === "GIFT-AB12" && /^GIFT-[A-Z0-9]{4}$/.test(gift2.reference) && gift2.reference !== "GIFT-AB12", "a gift clash keeps the GIFT prefix: " + gift2.reference);
  });

  test("missing required fields are refused", async () => {
    const g = fresh();
    const a = g.ctx.handleRequest_(booking({}, { Address: "" }));
    assert(a.ok === false && /Address/.test(a.error), "missing address: " + JSON.stringify(a));
    const b = g.ctx.handleRequest_(booking({}, { Phone: "—" }));
    assert(b.ok === false && /Phone/.test(b.error), "a dash counts as missing: " + JSON.stringify(b));
    assert(g.sheet("Bookings").rows.length === 0, "refused requests save nothing");
    const q = g.ctx.handleRequest_({ form: "quote", reference: "NR-QQ11", attempt: "quoteattempt000001", honey: "", email: "q@example.com", fields: { Service: "Residence Care", Name: "Quinn", Phone: "—" } });
    assert(q.ok === true, "a quote with a name and an email is enough: " + JSON.stringify(q));
    const q2 = g.ctx.handleRequest_({ form: "quote", reference: "NR-QQ12", attempt: "quoteattempt000002", honey: "", email: "", fields: { Service: "Residence Care", Name: "Quinn", Phone: "—" } });
    assert(q2.ok === false, "a quote with no phone and no email is refused");
    const r = g.ctx.handleRequest_({ form: "review", reference: "NR-RV11", attempt: "reviewattempt00001", honey: "", email: "", fields: { Name: "Rae" } });
    assert(r.ok === false && /Rating/.test(r.error), "a review needs a rating: " + JSON.stringify(r));
    const t = g.ctx.handleRequest_({ form: "pricetext", reference: "NR-PT11", attempt: "pricetextattempt01", honey: "", email: "", fields: { Quote: "Deep, $235" } });
    assert(t.ok === false && /Text this price to/.test(t.error), "a price text needs a phone: " + JSON.stringify(t));
    assert(g.ctx.handleRequest_(booking({ form: "other" })).ok === false, "unknown form refused");
    assert(g.ctx.handleRequest_(booking({ attempt: "short" })).ok === false, "malformed attempt refused");
  });

  test("spam trap answers ok and saves nothing", async () => {
    const g = fresh();
    const res = g.ctx.handleRequest_(booking({ honey: "x" }));
    assert(res.ok === true, "bots get the ordinary answer");
    assert(g.sheet("Bookings").rows.length === 0, "nothing saved for a bot");
  });

  test("formula-looking values are stored as text", async () => {
    const g = fresh();
    g.ctx.handleRequest_(booking({}, { Notes: '=HYPERLINK("x")', Name: "+1 Bob", Address: "@home", "Referred by": "-5" }));
    const row = g.sheet("Bookings").rows[0];
    assert(row.Notes === "'=HYPERLINK(\"x\")" && row.Name === "'+1 Bob" && row.Address === "'@home" && row["Referred by"] === "'-5", "row: " + JSON.stringify(row));
  });

  test("a new field label adds a column at the end", async () => {
    const g = fresh();
    g.ctx.handleRequest_(booking({}, { "Gate colour": "Blue" }));
    const s = g.sheet("Bookings");
    assert(s.headers[s.headers.length - 1] === "Gate colour" && s.rows[0]["Gate colour"] === "Blue", "headers: " + s.headers.slice(-4).join("|"));
  });

  test("writes by header name after Mann moves columns", async () => {
    const g = fresh();
    const head = g.raw("Bookings").cells[0];
    const n = head.indexOf("Name"), p = head.indexOf("Phone");
    [head[n], head[p]] = [head[p], head[n]];
    g.ctx.handleRequest_(booking());
    const row = g.sheet("Bookings").rows[0];
    assert(row.Name === "Priya Sample" && row.Phone === "647 555 0123", "row after the move: " + JSON.stringify(row));
  });

  test("keeps accents, emoji and quotes intact", async () => {
    const g = fresh();
    g.ctx.handleRequest_(booking({}, { Name: "Zoë O'Brien 😊", Notes: '"Ring twice"' }));
    const row = g.sheet("Bookings").rows[0];
    assert(row.Name === "Zoë O'Brien 😊" && row.Notes === '"Ring twice"', "row: " + JSON.stringify(row));
  });

  test("long values are cut and big bodies refused", async () => {
    const g = fresh();
    g.ctx.handleRequest_(booking({}, { Notes: "a".repeat(2500) }));
    assert(g.sheet("Bookings").rows[0].Notes.length === 2000, "long notes cut to 2,000 characters");
    const big = g.ctx.handleRequest_(booking({ attempt: "bigbodyattempt0001" }, { Notes: "b".repeat(25000) }));
    assert(big.ok === false && big.error === "Too large", "big body: " + JSON.stringify(big));
    assert(g.sheet("Bookings").rows.length === 1, "the big body saved nothing");
  });

  test("setup twice changes nothing", async () => {
    const g = fresh();
    const before = ["Bookings", "Quotes", "Gifts", "Reviews", "Price texts"].map((t) => g.sheet(t) && g.sheet(t).headers.join("|"));
    g.ctx.setup();
    const after = ["Bookings", "Quotes", "Gifts", "Reviews", "Price texts"].map((t) => g.sheet(t) && g.sheet(t).headers.join("|"));
    assert(before.every(Boolean), "setup creates all five tabs");
    assert(JSON.stringify(before) === JSON.stringify(after), "a second setup changes headers");
    assert(g.raw("Bookings").frozen === 1, "header row frozen");
    const v = g.raw("Bookings").validations.at(-1);
    assert(v && v.row === 2 && v.rule.list.join("|") === "Received|Confirmed|Other time offered|Declined|Cancelled|Done", "status dropdown: " + JSON.stringify(v));
  });

  test("doPost answers JSON", async () => {
    const g = fresh();
    const out = g.ctx.doPost({ postData: { contents: JSON.stringify(booking()) } });
    assert(out.mime === "application/json" && JSON.parse(out.getContent()).ok === true, "doPost: " + out.getContent());
    const bad = JSON.parse(g.ctx.doPost({ postData: { contents: "nope" } }).getContent());
    assert(bad.ok === false && bad.error === "Unreadable request", "bad JSON: " + JSON.stringify(bad));
  });

  // ---- Emails, retries and the morning reminder ----
  const quote = (ref, attempt, email = "q@example.com") => ({ form: "quote", reference: ref, attempt, honey: "", email, fields: { Service: "Residence Care", Name: "Quinn", Phone: "647 555 0199" } });
  const gift = (ref, attempt, email = "g@example.com") => ({ form: "gift", reference: ref, attempt, honey: "", email, fields: { "Your name": "Gale", "Your phone": "647 555 0100", Amount: "$100" } });
  const toOwner = (g) => g.mails.filter((m) => m.to === "nestnrestcleaning@gmail.com");
  const toCustomer = (g, who) => g.mails.filter((m) => m.to === who);

  test("alert goes to the owner with every field", async () => {
    const g = fresh();
    g.ctx.handleRequest_(booking());
    const a = toOwner(g);
    assert(a.length === 1 && a[0].subject === "New booking request NR-AB12", "alert: " + JSON.stringify(a.map((m) => m.subject)));
    assert(a[0].body.includes("Address: 1 Example St") && a[0].body.includes("Name: Priya Sample") && a[0].body.includes("Open the sheet: https://docs.google.com/spreadsheets/d/TEST/edit"), "alert body: " + a[0].body);
    assert(a[0].replyTo === "p@example.com", "reply-to: " + a[0].replyTo);
    assert(g.sheet("Bookings").rows[0]["Alert email"] === "Sent", "alert cell");
    const h = fresh({ props: { OWNER_EMAIL: "x@example.com" } });
    h.ctx.handleRequest_(booking());
    assert(h.mails.some((m) => m.to === "x@example.com" && m.subject === "New booking request NR-AB12"), "OWNER_EMAIL overrides the owner address");
  });

  test("receipt wording is fixed per form", async () => {
    const g = fresh();
    g.ctx.handleRequest_(booking());
    g.ctx.handleRequest_(quote("NR-QU01", "quoteattempt000001"));
    g.ctx.handleRequest_(gift("GIFT-GF01", "giftattempt0000001"));
    const b = toCustomer(g, "p@example.com")[0], q = toCustomer(g, "q@example.com")[0], f = toCustomer(g, "g@example.com")[0];
    assert(b.subject === "We got your request NR-AB12" && b.body.startsWith("We got your request NR-AB12. It's not confirmed yet. Mann will reply within 2 hours during business hours to agree your time and final price."), "booking receipt: " + JSON.stringify(b));
    assert(q.subject === "We got your quote request NR-QU01" && q.body.startsWith("We got your quote request NR-QU01. Mann will reply within one business day."), "quote receipt: " + JSON.stringify(q));
    assert(f.subject === "We got your gift card request GIFT-GF01" && f.body.startsWith("We got your gift card request GIFT-GF01. Mann will text you within 2 hours during business hours to confirm and send an Interac e-Transfer request."), "gift receipt: " + JSON.stringify(f));
    assert(b.body.includes("Nest & Rest Cleaning"), "receipts are signed");
    g.ctx.handleRequest_({ form: "review", reference: "NR-RV01", attempt: "reviewattempt00001", honey: "", email: "r@example.com", fields: { Name: "Rae", Rating: "5 / 5" } });
    g.ctx.handleRequest_({ form: "pricetext", reference: "NR-PT01", attempt: "pricetextattempt01", honey: "", email: "t@example.com", fields: { "Text this price to": "647 555 0111" } });
    g.ctx.handleRequest_(booking({ reference: "NR-NE01", attempt: "noemailattempt0001", email: "" }));
    assert(g.sheet("Reviews").rows[0]["Receipt email"] === "Not needed" && g.sheet("Price texts").rows[0]["Receipt email"] === "Not needed", "no receipts for reviews and price texts");
    assert(g.sheet("Bookings").rows[1]["Receipt email"] === "Not needed", "no receipt without an email");
    assert(!g.mails.some((m) => m.to === "r@example.com" || m.to === "t@example.com"), "nothing sent to review or price-text addresses");
  });

  test("receipt never carries submitted text", async () => {
    const g = fresh();
    g.ctx.handleRequest_(booking({}, { Name: "Visit evil.example now", Notes: "click here" }));
    const r = toCustomer(g, "p@example.com")[0];
    assert(r && !/evil|click here|Visit/.test(r.subject + r.body), "receipt: " + JSON.stringify(r));
  });

  test("one receipt per address per hour, 50 a day", async () => {
    const g = fresh();
    g.ctx.handleRequest_(booking());
    g.setNow(new Date("2026-10-29T14:10:00Z"));
    g.ctx.handleRequest_(booking({ reference: "NR-AB13", attempt: "secondattempt00001" }));
    assert(g.sheet("Bookings").rows[1]["Receipt email"] === "Not needed (limit)", "second receipt within the hour is skipped");
    assert(g.sheet("Bookings").rows[1]["Alert email"] === "Sent", "Mann still gets the alert");
    g.setNow(new Date("2026-10-29T15:11:00Z"));
    g.ctx.handleRequest_(booking({ reference: "NR-AB14", attempt: "thirdattempt000001" }));
    assert(g.sheet("Bookings").rows[2]["Receipt email"] === "Sent", "after an hour the address gets a receipt again");
    const h = fresh();
    for (let i = 0; i < 51; i++) h.ctx.handleRequest_(booking({ reference: "NR-" + String(1000 + i).slice(-4).replace(/^1/, "A"), attempt: "dailyattempt" + String(100000 + i), email: "c" + i + "@example.com" }));
    const rows = h.sheet("Bookings").rows;
    assert(rows.length === 51 && rows[49]["Receipt email"] === "Sent" && rows[50]["Receipt email"] === "Not needed (limit)", "daily cap: " + rows.slice(48).map((r) => r["Receipt email"]).join(" | "));
  });

  test("mail failure keeps the row and the retry sends it", async () => {
    const g = fresh({ mailFailures: 2 });
    const res = g.ctx.handleRequest_(booking());
    assert(res.ok === true, "the customer's request still counts as received");
    let row = g.sheet("Bookings").rows[0];
    assert(row["Alert email"] === "Not sent (will retry, tries: 1)" && row["Receipt email"] === "Not sent (will retry, tries: 1)", "after the failure: " + row["Alert email"] + " / " + row["Receipt email"]);
    g.ctx.retryEmails();
    row = g.sheet("Bookings").rows[0];
    assert(row["Alert email"] === "Sent" && row["Receipt email"] === "Sent", "after the retry: " + row["Alert email"] + " / " + row["Receipt email"]);
    assert(toOwner(g).length === 1 && toCustomer(g, "p@example.com").length === 1, "one alert and one receipt in the end");
  });

  test("gives up after 5 tries", async () => {
    const g = fresh({ mailFailures: 999 });
    g.ctx.handleRequest_(booking({ email: "" }));
    for (let i = 0; i < 3; i++) g.ctx.retryEmails();
    assert(g.sheet("Bookings").rows[0]["Alert email"] === "Not sent (will retry, tries: 4)", "after 4 tries: " + g.sheet("Bookings").rows[0]["Alert email"]);
    g.ctx.retryEmails();
    assert(g.sheet("Bookings").rows[0]["Alert email"] === "Failed (gave up after 5 tries)", "after 5 tries: " + g.sheet("Bookings").rows[0]["Alert email"]);
    g.failMail(0);
    g.ctx.retryEmails();
    assert(g.mails.length === 0, "a failed email is not retried again");
    g.ctx.morningReminder();
    assert(g.mails.length === 1 && g.mails[0].body.includes("NR-AB12"), "the morning email lists the failed one");
  });

  test("reminder lists only rows still Received after 2 hours", async () => {
    const g = fresh();
    g.setNow(new Date("2026-10-29T11:00:00Z"));
    g.ctx.handleRequest_(booking({ reference: "NR-OLD1", attempt: "oldattempt00000001", email: "" }));
    g.setNow(new Date("2026-10-29T13:00:00Z"));
    g.ctx.handleRequest_(booking({ reference: "NR-NEW1", attempt: "newattempt00000001", email: "" }));
    g.setNow(new Date("2026-10-29T09:00:00Z"));
    g.ctx.handleRequest_(booking({ reference: "NR-DUN1", attempt: "doneattempt0000001", email: "" }));
    const raw = g.raw("Bookings"), statusCol = raw.cells[0].indexOf("Status");
    raw.cells.find((l) => l[0] === "NR-DUN1")[statusCol] = "Confirmed";
    g.setNow(new Date("2026-10-29T14:00:00Z"));
    g.mails.length = 0;
    g.ctx.morningReminder();
    assert(g.mails.length === 1 && g.mails[0].to === "nestnrestcleaning@gmail.com" && g.mails[0].subject === "Waiting for your reply: 1", "reminder: " + JSON.stringify(g.mails.map((m) => m.subject)));
    assert(g.mails[0].body.includes("NR-OLD1") && !g.mails[0].body.includes("NR-NEW1") && !g.mails[0].body.includes("NR-DUN1"), "reminder body: " + g.mails[0].body);
    const h = fresh();
    h.ctx.morningReminder();
    assert(h.mails.length === 0, "no email when nothing is waiting");
  });

  test("setup installs each trigger once", async () => {
    const g = fresh();
    g.ctx.setup();
    const retry = g.triggers.filter((t) => t.fn === "retryEmails"), morning = g.triggers.filter((t) => t.fn === "morningReminder");
    assert(retry.length === 1 && retry[0].everyMinutes === 15, "retry trigger: " + JSON.stringify(retry));
    assert(morning.length === 1 && morning[0].atHour === 9 && morning[0].everyDays === 1 && morning[0].timezone === "America/Toronto", "morning trigger: " + JSON.stringify(morning));
  });

  test("rows Mann adds by hand are never emailed", async () => {
    const g = fresh();
    const raw = g.raw("Bookings"), head = raw.cells[0];
    const line = head.map(() => "");
    line[head.indexOf("Reference")] = "PHONE-1";
    line[head.indexOf("Name")] = "Walk-in client";
    line[head.indexOf("Email")] = "walkin@example.com";
    raw.cells.push(line);
    g.ctx.retryEmails();
    assert(g.mails.length === 0, "emails sent for a hand-added row: " + JSON.stringify(g.mails.map((m) => m.to + " " + m.subject)));
  });
}
