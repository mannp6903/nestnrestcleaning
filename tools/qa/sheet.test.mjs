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
}
