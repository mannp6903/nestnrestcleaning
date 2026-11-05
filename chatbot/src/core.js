// The chatbot's logic, without the network: checking each request, the instructions and facts the model works from, its
// two tools, and the tool loop. worker.js passes in the call to Claude (createMessage), so tools/qa/chatbot.test.mjs can
// run all of this with a stand-in model and no API key.
import { quote, checkArea } from "./pricing.js";

export const MODEL = "claude-haiku-5-5";
// Limits on what one visitor can send, so a chat can't grow into an expensive request.
export const LIMITS = { messages: 20, chars: 1000, totalChars: 12000, bodyBytes: 24000, modelCalls: 4 };

// What the model is told. Everything in it comes from knowledge.json (the website's own settings), and it never changes
// between requests, so Anthropic's prompt cache can reuse it.
export function systemPrompt(K) {
  const B = K.business;
  const facts = {
    business: { name: B.name, owner: B.owner, email: B.email, phone: B.phoneDisplay || "not published: use email", hours: B.hours,
      area: K.serviceArea.label, reply_time: B.replyPromise, website: K.siteUrl },
    prices_reviewed: K.pricingVersion,
    tax: K.taxRate ? `Prices are before ${Math.round(K.taxRate * 100)}% HST` : "No HST charged",
    payment: "Nothing to pay to book and no deposit. Pay after the clean by Interac e-Transfer, credit or debit card, or cash.",
    services: Object.entries(K.services).map(([key, s]) => ({ key, name: s.name, from_price: `$${s.base} for ${key === "detail" ? "the kitchen and one bathroom of a condo" : "a 1-bedroom, 1-bathroom condo"}`,
      hours_from: s.hours, about: s.intro, ideal_for: s.idealFor, page: `${K.siteUrl}/services/${s.slug}/` })),
    priced_by_quote: Object.values(K.quoteServices).map((q) => ({ name: q.name, about: q.short, page: `${K.siteUrl}/services/${q.slug}/` }))
      .concat([{ name: "Cleaning for realtors and property managers", about: "Listing-prep, move-out and between-tenant cleans.", page: `${K.siteUrl}/realtors/` }]),
    home_types: Object.fromEntries(Object.entries(K.homeTypes).map(([k, h]) => [k, `${h.label} (${Math.round((h.factor - 1) * 100)}% more than a condo)`])),
    extras: K.addons.map((a) => ({ id: a.id, name: a.name, price: `+$${a.price}`, covers: a.limit, by_service: a.status })),
    plans: Object.fromEntries(Object.entries(K.frequencies).map(([k, f]) => [k, f.discount ? `${f.label}: ${f.discount}% off every visit (regular cleaning only)` : f.label])),
    founding_offer: K.offers.founding && K.offers.founding.active ? K.offers.founding.text + " Not combined with a plan discount on the first visit: the larger one applies." : "none right now",
    referral: `$${K.offers.referral} off for both the existing client and the friend they refer, once the friend's first clean is done and paid.`,
    gift_cards: `${K.siteUrl}/gift/ (never expire; amounts ${K.offers.gift.amounts.map((x) => "$" + x).join(", ")})`,
    room_by_room_checklist: K.checklist,
    checklist_columns: "Each task row is [task, regular, deep, move-in/move-out]: yes = included, add = paid extra, empty = not part of that clean. Kitchen & Bath Detailing follows the deep column for the kitchen and bathrooms only.",
    unusual_homes: K.homeChecks.map((c) => c.quote ? `${c.label}: priced by quote (Residence Care)` : `${c.label}: ${c.note}`),
    guarantee: K.policies.guarantee,
    changes: `Free to change or cancel up to ${K.policies.cancelNoticeHours} hours before. Later changes, or if we can't get in at the agreed time, may cost ${K.policies.lateCancelFee}.`,
    damage: `Report any damage within ${K.policies.damageReportHours} hours.`,
    access_codes: `Never sent through the website. ${B.ownerFirstName} asks for codes by text once a clean is confirmed and deletes them within ${K.policies.accessCodeDeleteDays} days of the last scheduled clean.`,
    postal_areas_served: K.serviceArea.districts.map((d) => `${d.name}: ${d.prefixes.join(", ")}`),
    neighbourhoods: K.areas.map((a) => `${a.name}: ${a.neighbourhoods.join(", ")}`),
    questions_and_answers: K.faqs,
    policies_page: `${K.siteUrl}/policies/`,
    booking_page: `${K.siteUrl}/book/`,
    pricing_page: `${K.siteUrl}/pricing/`
  };
  return `You are the website assistant for ${B.name}, a home cleaning business in ${K.serviceArea.label}, Toronto. It is owned and run by ${B.owner}, who does every clean himself. You answer questions from visitors to ${K.siteUrl}.

How to answer:
- Be warm, clear and brief: one to four short sentences, in Canadian English. Use plain text only: no markdown, no bullet symbols, no headings. Write links as full URLs.
- Use only the facts below. If something isn't covered, say you're not sure and suggest emailing ${B.ownerFirstName} at ${B.email}. Never guess or invent a price, time, availability, policy or promise.
- For the price of a specific home, call price_quote and use its numbers exactly as given. You may quote the "from" prices below without it. Every price is an estimate that ${B.ownerFirstName} confirms before the clean, and there's nothing to pay until after it.
- To check whether a postal code is in the service area, call check_postal_code.
- You can't book, hold a spot or confirm a day or time. To book, give the booking_link from price_quote, or ${K.siteUrl}/book/. ${B.ownerFirstName} confirms every request ${B.replyPromise}.
- Don't ask for personal details (names, phone numbers, addresses, access codes), and don't repeat any a visitor shares; point them to the booking form instead.
- For a problem with a past clean, damage or a complaint, give the guarantee and ask them to email ${B.ownerFirstName}.
- Homes over about 3,000 sq ft, offices and Airbnb turnovers are priced by quote: give the page for each.
- Stay on ${B.name} and home cleaning, and politely decline anything else. If asked, say you're an AI assistant and that ${B.ownerFirstName} reads every booking request himself.

Facts, from the website's own settings:
${JSON.stringify(facts)}`;
}

// The two tools. Both run here, on the website's own rules, so a price or an area answer is never the model's guess.
export function tools(K) {
  return [
    {
      name: "price_quote",
      description: "Exact price for one home, worked out with the website's own price rule: the regular price, the first-visit price, the price per visit on a plan, the time on site and a booking link with the home filled in. Use it for any price for a specific home.",
      strict: true,
      input_schema: {
        type: "object",
        properties: {
          service: { type: "string", enum: Object.keys(K.services), description: "regular, deep, move (move-in or move-out) or detail (kitchen and bathrooms only)" },
          home: { type: "string", enum: Object.keys(K.homeTypes), description: "condo (condo or apartment), town (townhouse) or house" },
          bedrooms: { type: "integer", description: "Bedrooms, 1 to 8. A studio counts as 1. Ignored for detail." },
          bathrooms: { type: "integer", description: "Full bathrooms, 1 to 6." },
          extras: { type: "array", items: { type: "string", enum: K.addons.map((a) => a.id) }, description: "Extras the visitor wants or mentions; empty if none. Use pets when they mention pets that shed a lot." },
          plan: { type: "string", enum: Object.keys(K.frequencies), description: "once, unless they ask about cleaning weekly, every 2 weeks or every 4 weeks" }
        },
        required: ["service", "home", "bedrooms", "bathrooms", "extras", "plan"],
        additionalProperties: false
      }
    },
    {
      name: "check_postal_code",
      description: "Whether a postal code is in the service area, from its first three characters.",
      strict: true,
      input_schema: {
        type: "object",
        properties: { postal_code: { type: "string", description: "The postal code the visitor gave, for example M1B 2K3 or M1B" } },
        required: ["postal_code"],
        additionalProperties: false
      }
    }
  ];
}

function runTool(K, name, input) {
  try {
    if (name === "price_quote") return quote(K, input || {});
    if (name === "check_postal_code") return checkArea(K, (input || {}).postal_code);
    return { error: "Unknown tool." };
  } catch (e) {
    return { error: "That couldn't be worked out. Suggest the price box on the website instead." };
  }
}

// The visitor's conversation, checked: alternating user and assistant turns, starting and ending with the visitor, plain
// text, within the limits. Returns the messages for the API, or an error to send back.
export function checkMessages(body) {
  const list = body && Array.isArray(body.messages) ? body.messages : null;
  if (!list || !list.length) return { error: "Send at least one message." };
  if (list.length > LIMITS.messages) return { error: "This chat is too long. Please start a new one." };
  let total = 0;
  const out = [];
  for (let i = 0; i < list.length; i++) {
    const m = list[i] || {};
    const want = i % 2 === 0 ? "user" : "assistant";
    const text = typeof m.content === "string" ? m.content.trim() : "";
    if (m.role !== want || !text) return { error: "That chat couldn't be read. Please start a new one." };
    if (text.length > LIMITS.chars) return { error: `Please keep each message under ${LIMITS.chars} characters.` };
    total += text.length;
    out.push({ role: want, content: text });
  }
  if (out[out.length - 1].role !== "user") return { error: "That chat couldn't be read. Please start a new one." };
  if (total > LIMITS.totalChars) return { error: "This chat is too long. Please start a new one." };
  return { messages: out };
}

const textOf = (content) => content.filter((b) => b.type === "text").map((b) => b.text).join("\n").trim();

// One visitor turn: the model answers, calling the tools as often as it needs (up to LIMITS.modelCalls requests).
export async function answer(K, history, createMessage) {
  const messages = history.map((m) => ({ ...m }));
  const system = systemPrompt(K), toolDefs = tools(K);
  const usage = { calls: 0, input: 0, output: 0, cacheRead: 0 };
  for (let call = 0; call < LIMITS.modelCalls; call++) {
    const response = await createMessage({
      model: MODEL,
      max_tokens: 2048,
      // Chat replies don't need deep reasoning, and low effort keeps them fast and cheap.
      output_config: { effort: "low" },
      cache_control: { type: "ephemeral" },
      system,
      tools: toolDefs,
      messages
    });
    usage.calls++;
    usage.input += response.usage?.input_tokens || 0;
    usage.output += response.usage?.output_tokens || 0;
    usage.cacheRead += response.usage?.cache_read_input_tokens || 0;
    if (response.stop_reason === "refusal") return { reply: `Sorry, I can't help with that here. For anything about your clean, email ${K.business.ownerFirstName} at ${K.business.email}.`, usage };
    if (response.stop_reason !== "tool_use") {
      const reply = textOf(response.content);
      return { reply: reply || `Sorry, I don't have an answer for that. Please email ${K.business.ownerFirstName} at ${K.business.email}.`, usage };
    }
    // Pass the whole reply back (thinking blocks included, unchanged), then every tool result in one message.
    messages.push({ role: "assistant", content: response.content });
    const results = response.content.filter((b) => b.type === "tool_use").map((b) => ({
      type: "tool_result", tool_use_id: b.id, content: JSON.stringify(runTool(K, b.name, b.input))
    }));
    messages.push({ role: "user", content: results });
  }
  return { reply: `Sorry, that took too long to work out. The price box at ${K.siteUrl}/pricing/ gives an exact price in seconds.`, usage };
}

// CORS: only the website's own pages can call the chatbot from a browser.
export function allowedOrigin(request, env) {
  const origin = request.headers.get("Origin") || "";
  const allowed = String(env.ALLOWED_ORIGINS || "").split(",").map((s) => s.trim()).filter(Boolean);
  return allowed.includes(origin) ? origin : "";
}
const corsHeaders = (origin) => ({
  "Access-Control-Allow-Origin": origin, "Access-Control-Allow-Methods": "POST, OPTIONS", "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Max-Age": "86400", Vary: "Origin"
});
const json = (status, data, origin) => new Response(JSON.stringify(data), {
  status, headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store", ...(origin ? corsHeaders(origin) : {}) }
});

// The whole request: CORS, method, size and shape checks, the answer, and friendly errors. classifyError turns an SDK error
// into "busy" (try again shortly) or "down" (something's wrong): worker.js does it with the SDK's typed error classes.
export async function handle(request, env, { K, createMessage, classifyError = () => "down", log = () => {} }) {
  const origin = allowedOrigin(request, env);
  if (request.method === "OPTIONS") return origin ? new Response(null, { status: 204, headers: corsHeaders(origin) }) : new Response(null, { status: 403 });
  if (!origin) return json(403, { error: "This chat only works on the website." });
  if (request.method !== "POST") return json(405, { error: "Use POST." }, origin);
  // About a dozen questions a minute from one visitor, with Cloudflare's rate limiter (LIMITER in wrangler.toml). The
  // website check above can be faked by a script; this can't. The address is only used for counting, never stored here.
  if (env.LIMITER) {
    let allowed = true;
    try { allowed = (await env.LIMITER.limit({ key: request.headers.get("CF-Connecting-IP") || "unknown" })).success; } catch (e) { /* counting failed: answer anyway */ }
    if (!allowed) return json(429, { error: "That's a lot of questions at once. Please wait a minute and try again." }, origin);
  }
  if (Number(request.headers.get("Content-Length") || 0) > LIMITS.bodyBytes) return json(413, { error: "That message is too long." }, origin);
  let body;
  try {
    const raw = await request.text();
    if (raw.length > LIMITS.bodyBytes) return json(413, { error: "That message is too long." }, origin);
    body = JSON.parse(raw);
  } catch (e) {
    return json(400, { error: "That chat couldn't be read. Please start a new one." }, origin);
  }
  const checked = checkMessages(body);
  if (checked.error) return json(400, { error: checked.error }, origin);
  try {
    const result = await answer(K, checked.messages, createMessage);
    // Counts only: never what anyone typed.
    log({ ok: true, turns: checked.messages.length, ...result.usage });
    return json(200, { reply: result.reply }, origin);
  } catch (e) {
    const kind = classifyError(e);
    log({ ok: false, kind, status: e && e.status });
    const reach = `email ${K.business.ownerFirstName} at ${K.business.email}`;
    return kind === "busy"
      ? json(503, { error: `I'm a bit busy right now. Please try again in a minute, or ${reach}.` }, origin)
      : json(502, { error: `Sorry, I can't answer right now. Please ${reach}.` }, origin);
  }
}
