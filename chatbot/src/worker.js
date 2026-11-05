// The Cloudflare Worker behind the website's chat assistant. It holds the Anthropic API key (a Worker secret, never in the
// website's files) and answers with Claude Haiku 5.5, from the website's own settings (knowledge.json). Setup: chatbot/README.md.
import Anthropic from "@anthropic-ai/sdk";
import K from "./knowledge.json" with { type: "json" };
import { handle } from "./core.js";

// Rate limits and overloads are worth retrying shortly; everything else (a bad key, a bad request) needs a person.
function classifyError(error) {
  if (error instanceof Anthropic.RateLimitError) return "busy";
  if (error instanceof Anthropic.InternalServerError) return "busy";
  if (error instanceof Anthropic.AuthenticationError) return "down";
  if (error instanceof Anthropic.BadRequestError) return "down";
  if (error instanceof Anthropic.APIError) return error.status === 529 ? "busy" : "down";
  return "down";
}

export default {
  async fetch(request, env) {
    const client = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY, maxRetries: 1, timeout: 25 * 1000 });
    return handle(request, env, {
      K,
      createMessage: (params) => client.messages.create(params),
      classifyError,
      log: (entry) => console.log(JSON.stringify(entry))
    });
  }
};
