// Runs the Worker exactly as Cloudflare would (src/worker.js with the real Anthropic SDK), with Anthropic's API answered by a
// stand-in, so it needs no API key, costs nothing and sends nothing anywhere. It checks what the SDK actually sends and how
// the SDK's errors reach visitors. Run it after `npm install`, before a deploy: npm run check
import worker from "../src/worker.js";

let failed = 0;
const check = (ok, what) => { console.log((ok ? "ok   " : "FAIL ") + what); if (!ok) failed++; };

// Anthropic's API, played locally: each call takes the next answer from `script` and keeps the request it got.
const sent = [];
let script = [];
const realFetch = globalThis.fetch;
globalThis.fetch = async (input, init = {}) => {
  const url = typeof input === "string" ? input : input.url;
  if (!url.startsWith("https://api.anthropic.com/")) throw new Error("Unexpected request to " + url);
  const headers = new Headers(init.headers || (typeof input === "string" ? {} : input.headers));
  const body = init.body != null ? init.body : typeof input === "string" ? "" : await input.text();
  sent.push({ url, headers, body: body ? JSON.parse(body) : null });
  const [status, data] = script.shift() || [500, { type: "error", error: { type: "api_error", message: "No answer scripted" } }];
  return new Response(JSON.stringify(data), { status, headers: { "content-type": "application/json", "request-id": "req_test" } });
};

const msg = (content, stop_reason = "end_turn") => [200, { id: "msg_test", type: "message", role: "assistant", model: "claude-haiku-5-5", content, stop_reason, stop_sequence: null,
  usage: { input_tokens: 20, output_tokens: 10, cache_creation_input_tokens: 0, cache_read_input_tokens: 0 } }];
const err = (status, type, message) => [status, { type: "error", error: { type, message } }];
const env = { ANTHROPIC_API_KEY: "sk-ant-test-not-a-real-key", ALLOWED_ORIGINS: "https://nestnrestcleaning.com" };
const askWorker = (question) => worker.fetch(new Request("https://nestnrest-chatbot.example.workers.dev/", {
  method: "POST", headers: { Origin: "https://nestnrestcleaning.com", "Content-Type": "application/json" },
  body: JSON.stringify({ messages: [{ role: "user", content: question }] })
}), env);

const logs = [];
const realLog = console.log;
console.log = (...a) => { if (typeof a[0] === "string" && a[0].startsWith("{")) logs.push(a[0]); else realLog(...a); };

try {
  // A price question: the model calls the price tool, the Worker answers it, the model replies.
  script = [
    msg([{ type: "thinking", thinking: "Price it.", signature: "sig" }, { type: "tool_use", id: "toolu_01", name: "price_quote",
      input: { service: "regular", home: "condo", bedrooms: 2, bathrooms: 1, extras: [], plan: "biweekly" } }], "tool_use"),
    msg([{ type: "text", text: "A regular clean of your 2-bedroom condo is $140 for the first visit." }])
  ];
  let res = await askWorker("How much is a 2 bedroom condo every 2 weeks?");
  let data = await res.json();
  check(res.status === 200 && data.reply.includes("$140"), "a price question gets the model's reply: " + JSON.stringify(data));
  check(sent.length === 2 && sent[0].url === "https://api.anthropic.com/v1/messages", "two calls to /v1/messages");
  const first = sent[0];
  const key = first.headers.get("x-api-key") || (first.headers.get("authorization") || "").replace(/^Bearer /, "");
  check(key === env.ANTHROPIC_API_KEY, "the key from the Worker secret is used");
  check(/^\d{4}-\d{2}-\d{2}$/.test(first.headers.get("anthropic-version") || ""), "the API version header is set: " + first.headers.get("anthropic-version"));
  check(first.body.model === "claude-haiku-5-5", "model: " + first.body.model);
  check(first.body.output_config && first.body.output_config.effort === "low", "effort: low");
  check(first.body.cache_control && first.body.cache_control.type === "ephemeral", "prompt caching is on");
  check(typeof first.body.system === "string" && first.body.system.includes("Nest & Rest"), "the instructions are sent");
  check(first.body.tools.length === 2 && first.body.tools.every((t) => t.strict === true), "both tools, strict");
  const second = sent[1].body;
  check(second.messages[1].content[0].type === "thinking" && second.messages[1].content[0].signature === "sig", "the thinking block goes back unchanged");
  const result = second.messages[2].content[0];
  check(result.type === "tool_result" && JSON.parse(result.content).first_visit_price === "$140", "the tool result has the site's price: " + result.content);
  check(res.headers.get("Access-Control-Allow-Origin") === "https://nestnrestcleaning.com", "the website may read the answer");
  check(logs.length === 1 && !logs[0].includes("condo") && !logs[0].includes("140"), "the log has counts only: " + logs[0]);

  // The SDK's own errors, as visitors see them. Rate limits and overloads are retried once by the SDK first.
  for (const [label, answers, status, words] of [
    ["rate limit", [err(429, "rate_limit_error", "Too many"), err(429, "rate_limit_error", "Too many")], 503, "try again"],
    ["overloaded", [err(529, "overloaded_error", "Overloaded"), err(529, "overloaded_error", "Overloaded")], 503, "try again"],
    ["bad key", [err(401, "authentication_error", "invalid x-api-key")], 502, "can't answer"],
    ["bad request", [err(400, "invalid_request_error", "messages: bad")], 502, "can't answer"]
  ]) {
    sent.length = 0;
    script = answers.slice();
    res = await askWorker("hi");
    data = await res.json();
    check(res.status === status && data.error.includes(words) && data.error.includes("nestnrestcleaning@gmail.com") && !/x-api-key|messages:/.test(data.error),
      `${label}: ${res.status} "${data.error}" after ${sent.length} call(s)`);
  }
  check(!logs.some((l) => l.includes("sk-ant")), "the key never reaches the log");
} catch (e) {
  failed++;
  realLog("FAIL the Worker threw: " + (e && e.stack || e));
} finally {
  globalThis.fetch = realFetch;
  console.log = realLog;
}
console.log(failed ? `\n${failed} check(s) failed` : "\nAll checks passed: the Worker is ready to deploy.");
process.exit(failed ? 1 : 0);
