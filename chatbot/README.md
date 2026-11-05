# The website's chat assistant

An "Ask a question" button on the website (every page except booking) opens a small chat. Visitors ask about prices, what
each clean includes, whether you clean their area, plans, the guarantee and your policies. Claude Haiku 5.5, Anthropic's
fastest model, writes the answers. It works only from the website's own settings, and when someone is ready, it gives
them a booking link with their home already filled in.

**What it can do:** answer from `js/config.js` (prices, extras, plans, the room-by-room checklist, areas and postal codes,
the questions and answers, policies, the guarantee, gift cards and referrals). Every price for a specific home comes
from a small calculator in the Worker that uses the booking form's exact rule (`src/pricing.js`). So the assistant can't
make a price up, and its link opens the booking form at the same total.

**What it can't do:** book, hold or confirm a day or time, see your calendar or past bookings, send email, or promise
anything the website doesn't. It tells people that you confirm every booking yourself, and it asks them not to type
personal details into the chat.

**Privacy:** the conversation stays in the visitor's open browser tab and is gone when they close it. The Worker keeps
no conversations, and its log has only counts (how many messages, how many tokens), never what anyone typed. What a
visitor types goes through Cloudflare to Anthropic to get an answer. The privacy policy says so once the assistant is
switched on (the build adds it).

## What it costs

- **Cloudflare Workers:** free for up to 100,000 requests a day. A chat question is one request.
- **Anthropic (Claude API):** Claude Haiku 5.5 costs $0.10 per million tokens read and $0.50 per million tokens
  written. Each question sends the website's facts (about 5,000 tokens) and a short reply comes back. Most of that is
  cached and re-read at a tenth of the price. A typical question costs about a tenth of a cent ($0.001), so 1,000
  questions a month is about $1 to $2. You pay in advance with credits, and a monthly spend limit (step 1) caps it.

Each visitor can ask up to 12 questions a minute (`[[ratelimits]]` in `wrangler.toml`). The Worker also refuses long
chats and long messages, and it only answers your website's pages (`ALLOWED_ORIGINS`).

## Set it up (about 20 minutes, once)

You need a computer with [Node.js](https://nodejs.org) 22 or newer, and this repository on it.

### 1. Anthropic: an API key with a spend limit

1. Sign up at the Claude Console, [platform.claude.com](https://platform.claude.com), with the business email.
2. Under **Billing**, add a card and buy a small amount of credit (for example $10).
3. Under **Limits**, set a **monthly spend limit** you're comfortable with (for example $10). If anyone ever abuses
   the chat, this is as much as it can cost you. The assistant then says it can't answer and gives your email.
4. Under **API keys**, create a key named `nestnrest-website`. Copy it: it's shown only once. Never put it in the
   website's files, in this repository or in an email. It goes only into Cloudflare, in step 3.

### 2. Cloudflare: a free account

Sign up at [dash.cloudflare.com](https://dash.cloudflare.com). The free plan is enough. Your domain doesn't need to move
to Cloudflare: the Worker gets its own address.

### 3. Put the Worker online

In a terminal, from the repository folder:

```bash
cd chatbot
```

```bash
npm install
```

```bash
npm run check
```

`npm run check` runs the Worker with Anthropic's real SDK against a stand-in for the API. It needs no key and sends nothing.
It should end with "All checks passed".

```bash
npx wrangler login
```

```bash
npx wrangler deploy
```

The deploy prints the Worker's address, like `https://nestnrest-chatbot.YOUR-NAME.workers.dev`. Copy it. Then add the key:

```bash
npx wrangler secret put ANTHROPIC_API_KEY
```

Paste the key from step 1 when it asks. Cloudflare stores it encrypted, and it can't be read back, not even by you.

### 4. Try it before switching it on

Put your Worker's address in place of the example one:

```bash
curl -X POST https://nestnrest-chatbot.YOUR-NAME.workers.dev -H "Origin: https://nestnrestcleaning.com" -H "Content-Type: application/json" -d '{"messages":[{"role":"user","content":"How much is a deep clean for a 2-bedroom condo?"}]}'
```

You should get `{"reply":"..."}` with the same price the website's price box gives. If you get "can't answer right now",
check the key (step 3) and that your Anthropic account has credit.

### 5. Switch it on

In `js/config.js`, put the Worker's address in `assistant.endpoint`:

```js
assistant: {
  endpoint: "https://nestnrest-chatbot.YOUR-NAME.workers.dev"
},
```

Then rebuild, run the checks and publish as usual:

```bash
node tools/build.mjs
```

```bash
node tools/qa/run.mjs chatbot
```

Commit and push. The button appears on the live site after GitHub Pages publishes. Use the assistant or Chatwoot
(`chat` in `js/config.js`), not both: the build stops if both are on.

## Keeping it up to date

The assistant knows what `js/config.js` said the last time you **built the site and deployed the Worker**. The build
rewrites `src/knowledge.json`; the Worker gets the new facts only when you deploy it again. After you change prices,
extras, areas, policies or the questions and answers:

```bash
node tools/build.mjs
```

```bash
cd chatbot && npx wrangler deploy
```

Don't edit `src/knowledge.json` by hand: the next build replaces it.

## Watching, testing, switching off

- **Cost:** the Claude Console's **Usage** page shows what the assistant has spent.
- **Activity:** in Cloudflare, **Workers & Pages > nestnrest-chatbot > Logs** shows each request with counts only.
- **Testing a preview site:** add its address to `ALLOWED_ORIGINS` in `wrangler.toml`, separated by a comma, deploy, and
  take it out again afterwards.
- **Switch it off:** set `assistant.endpoint` back to `""`, build and push. To stop it completely, also delete the
  Worker in Cloudflare and the key in the Claude Console.
- **If the key ever leaks:** delete it in the Claude Console, create a new one and run
  `npx wrangler secret put ANTHROPIC_API_KEY` again.

## Files

```
src/worker.js       the Worker: holds the key (a Cloudflare secret), calls Claude with Anthropic's SDK
src/core.js         the instructions, the two tools (price_quote, check_postal_code), the tool loop and every request check
src/pricing.js      the booking form's price rule and postal check, for the tools
src/knowledge.json  the website's facts, written by node tools/build.mjs (don't edit)
test/sdk-check.mjs  npm run check: the Worker with the real SDK and a stand-in API
wrangler.toml       the Worker's name, allowed website addresses and rate limit
```

The website side is `js/assistant.js` and `css/assistant.css`, which `initAssistant()` in `js/site.js` loads only when
the assistant is on, after the page has loaded. The checks are in
`tools/qa/chatbot.test.mjs`: prices against every price table and the booking form, the request checks, the tool loop
with a stand-in model, and the chat panel on phones and desktops.
