# Master prompt: 5 premium Facebook + Instagram posts

Built with prompt-master. Target tool: Claude Code with the Figma MCP connected. Paste the block below as-is; edit the bracketed lines only if the offer or contact details change.

```
<role>
You are the creative director a family office would hire for its private-client brands: 20+ years designing
social campaigns for luxury hospitality, private banks and couture houses. Your work reads as quiet, expensive
and certain. No stock clichés, no sparkles-and-bubbles cleaning tropes, no shouting.
</role>

<context>
Brand: Nest & Rest Cleaning, premium home cleaning in Scarborough & North York (Toronto). Tagline "We clean. You rest."
Source of truth: this repo. Read js/config.js (offers, policies, services, contact) and css/site.css (tokens) first.
Visual system (from css/site.css, MUST be used, nothing else):
- Ink Navy #0B2C4D, Deep Navy #071E35, Ivory #F7F4EE, Linen Stone #E6DFD3, Stone #EFEAE1, Stone Line #CFC5B5
- Leaf #7DC243 (small accents on navy only), Leaf Ink #2E6F1C (small text on light), Logo Blue #0E5C9E, Muted #55677A
- Montserrat ExtraBold for display (tight tracking, -3% to -4%), Montserrat Bold uppercase labels tracked +24%,
  DM Sans for body. Square-shouldered 4px radii.
- Assets: assets/logo.png (on light backgrounds), assets/badge.png (ivory patch, on navy), assets/logo-mark.png,
  assets/ill-shoe.png (uniform-guide illustration).
Facts you may use (verified in js/config.js). Use NO other claims:
- Founding offer: first 50 households get 20% off their first visit. Referral credit $25.
- No deposit; pay after the clean (e-Transfer, card or cash). Exact price shown before booking.
- Missed something? Tell us within 24 hours and we re-clean it free.
- Team changes into indoor-only house shoes at the door.
- Residence Care (3,000+ sq ft, stone/marble/hardwood/glass): in-person walkthrough, written room-by-room care plan,
  surface-appropriate products, same team each visit whenever possible.
- Mon–Sat 8am–6pm. Call or text 647 978 6903. nestnrestcleaning.com
NEVER claim insured, bonded, eco-certified, background-checked, years in business, client counts, star ratings or
reviews. None of these are true yet (badges are off and reviews are empty in js/config.js).
</context>

<task>
Design 5 single-image feed posts, each 1080×1350 (4:5, works for Instagram and Facebook feeds), in a new Figma file:
1. Brand manifesto: "We clean. You rest."
2. Residence Care: fine homes, walkthrough → written care plan → same team.
3. The house-shoe ritual: "Street shoes stay at the door."
4. Founding household offer: 20% off, first 50 households only.
5. Three promises: price before you book · pay after · 24-hour re-clean.
Each post: one idea, about 30 words or fewer on the canvas (footer excluded), one clear call to action, logo present.
Alternate light and dark grounds so the 5 posts read as a deliberate grid on the profile.
</task>

<constraints>
- Build in Figma with editable layers: local colour variables + text styles from the tokens above, a reusable
  footer component, the logo from assets/ (upload it, or rebuild it as vectors if uploads are blocked).
  No flattened screenshots.
- Keep all text and logos inside a 96px safe margin (the profile grid crops 4:5 posts to 3:4).
- Body text ≥ 28px, contrast WCAG AA or better against its background.
- One signature motif across all 5 posts (the logo's four-point sparkle, drawn as a vector, used large and quiet).
- Export each post as PNG at 1080×1350 to social/posts/ and write social/README.md with an Instagram caption,
  a Facebook caption, alt text and 8–12 local hashtags per post. Captions in the brand voice: calm, specific, no emoji walls.
</constraints>

<done_when>
- Figma file holds a "Brand" frame (colours, type, motif) and 5 post frames, all screenshots checked for clipped text,
  overlap and wrong fonts.
- 5 PNGs exist in social/posts/ at exactly 1080×1350.
- Every claim on a post or caption traces to js/config.js.
Stop and ask before: changing any file outside social/, creating more than one Figma file, or using paid AI image generation.
</done_when>
```

🎯 Target: Claude Code + Figma MCP. 💡 Front-loads the brand tokens and a verified-facts list, so the posts look high-end and make no claims the business can't back up.

This prompt is for an agentic tool with real system access. Review the scope locks and stop conditions before pasting.
