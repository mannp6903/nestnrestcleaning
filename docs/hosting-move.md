# Moving the site off GitHub Pages

Phase 4 of [the redesign blueprint](redesign-blueprint-2026-11.md). The site runs on GitHub Pages today. GitHub's own terms say
Pages isn't meant for running "your online business" or a site "primarily directed at… facilitating commercial transactions", and
a site that takes booking requests sits close to that line. Cloudflare Pages and Netlify serve exactly the same files, have free
plans for a site this size (check their current limits when you sign up), and let you set things GitHub Pages can't, such as
custom headers.

Nothing in the website changes: every page is already built into the repository, so the new host just serves the same files.

## Before you start

- You need access to wherever nestnrestcleaning.com is registered, to change its DNS.
- Keep GitHub Pages running until the new host works. Visitors won't notice the switch.

## Cloudflare Pages (or Netlify, the same idea)

1. Make a free account and create a **Pages** project (on Netlify, a **site**), connected to the GitHub repository
   `mannp6903/nestnrestcleaning`, branch `main`.
2. Build settings: **no framework, no build command**, and the **root of the repository** as the folder to publish. (You run
   `node tools/build.mjs` yourself before pushing, as now, so the host has nothing to build.)
3. Open the address the host gives you (something like `nestnrestcleaning.pages.dev`) and check the home page, a service page,
   booking (send a test request) and the price box.
4. Add the custom domain **nestnrestcleaning.com** in the project's settings, and change the DNS records the host asks for
   at your domain registrar. HTTPS is set up for you.
5. Once the domain works on the new host (give DNS up to a day), switch off GitHub Pages in the repository's settings
   (**Settings → Pages**). Leave the `CNAME` file; it does no harm.
6. Update the "Hosting" section of the README to say where the site now runs.

## Settings to leave alone

- **Don't switch on any "block AI bots" or "AI crawl control" setting.** It would stop ChatGPT, Claude, Perplexity and others
  from reading the site, which undoes the work of making the pages easy for them to quote. `robots.txt` already says who may
  read the site; the host shouldn't override it.
- Don't turn on anything that rewrites the pages (HTML "optimisation" or minifying): the build already does what's needed, and
  the tests check the pages as built.

## After the move

- Every push to `main` publishes the site, as it does now.
- Google Search Console and Bing Webmaster Tools keep working: the address doesn't change.
