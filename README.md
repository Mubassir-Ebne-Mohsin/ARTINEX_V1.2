# ARTINEX — Intelligence, in context.

A modern, source-conscious AI publication built from the original Artinex HTML/CSS/JavaScript blog. It ships as **fast static HTML plus two optional Vercel serverless APIs**, with **zero npm runtime dependencies**.

> **Launch status:** Working Vercel-oriented starter, not a deployed or independently audited production service. Review all starter editorial content and source/image rights. Live feed requests, Resend delivery, domain DNS and real Vercel deployment require internet access/your accounts and have not been end-to-end verified in this offline build environment.

## What is included

- Redesigned homepage with the original **Artinex** name and reused legacy project artwork
- 12 educational sample articles in 11 dynamic categories, each with a dedicated, SEO-friendly HTML page
- Article reading time, table of contents, references, tags, sharing, and related/previous/next links
- Live external AI headlines (7 allowlisted original publisher/research RSS feeds), which link to publishers
- 6 AI company profiles, 6 model-family profiles and 10 tool profiles, with official URLs
- Keyword search covering articles, models, companies, tools and topics
- RSS for Artinex original/educational articles, optional canonical URLs and sitemap
- Search/filter pages, dark/light/system mode, responsive layouts and accessibility affordances
- Optional Resend contact-list integration, with explicit unavailable state until configured
- Browser-local editorial studio to draft/export articles and a safe CLI import workflow
- Editorial policy, sourcing, privacy, terms, contact and disclaimer pages
- Tests for routing/assets, headline parsing and newsletter request validation

## Requirements

- **Node.js 20 or newer** (Node 22 recommended)
- npm bundled with Node
- Git and a GitHub account for continuous deployment (recommended)
- Vercel account for hosting
- **No database, paid news API, React, Next.js or dependency installation is required**

## Run locally (Windows, macOS or Linux)

```bash
cd Blog-Project
npm run dev
```

Open **http://localhost:3000**. The `dev` command builds the pages and starts a local server, including local versions of the API routes. After editing a JSON content file, stop the server with Ctrl+C and rerun `npm run dev` to regenerate pages.

Other commands:

```bash
npm run build          # Generate production files in dist/
npm run start          # Serve the existing dist/ locally
npm test               # Build + test generated routes and APIs
npm run article:add -- my-draft.json                # Import as draft
npm run article:add -- my-draft.json --publish      # Validate + publish
```

Dependencies are deliberately limited to Node built-ins, so an `npm install` is not necessary. `npm install` is harmless and generates a lock file if desired.

## Important content warning

The included 12 articles are **starter editorial examples** written for demonstration and need human editorial review before public launch. They are **not dated breaking-news reports**. Relevant source links are given; claims must still be checked. The company's/model's pricing, release dates and benchmarks are *not invented*; specific changing information is intentionally deferred to official links.

**The live news wire is separate** from these articles, and its titles link directly to outside publisher pages. It does not copy article bodies, and it does not claim AI-summarized or verified reporting.

## Production configuration

Set `SITE_URL` to your real `https://` domain **before running the production build in Vercel**. Without it, canonical tags are omitted, the sitemap is empty, and the local editorial RSS uses an obvious placeholder URL.

`.env.example` lists all variables; **do not commit `.env` or credentials**. Local Node does not auto-load `.env`, so set variables in your shell or use Node's `--env-file` option; the official Vercel deployment reads them from its project Environment Variables.

| Variable | Required? | Purpose | Example | Obtain from |
| --- | --- | --- | --- | --- |
| `SITE_URL` | Required for correct public SEO | Build-time canonical/sitemap/RSS base | `https://ai.yourdomain.com` | Your Vercel deployment or connected custom domain |
| `RESEND_API_KEY` | Only for newsletters | Secret server-side contact API key | `re_...` | https://resend.com/api-keys |
| `RESEND_AUDIENCE_ID` | Only for newsletters | Mailing-list audience UUID | `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx` | https://resend.com/audiences (or the applicable Resend contacts/list interface) |
| `PORT` | Optional, local only | Local preview port | `3000` | Choose a free local port |

The Resend API in this project uses `POST https://api.resend.com/contacts` with `audience_id`. Confirm the current contacts management flow in your Resend account before enabling. **Implement rate limiting or Vercel WAF before marketing the sign-up widely.** Configure unsubscribe management/consent requirements with the provider, and review privacy regulations where you publish.

## Publishing workflow at a glance

1. Visit `/studio` in your local site. Draft an article and download its JSON file. This studio saves only to your browser; **it is not a public authenticated CMS**.
2. Add verified **Key takeaways** to the downloaded JSON file. Provide an actual source list and accurate categories/tags.
3. Run `npm run article:add -- path/to/article.json --publish` from the project root.
4. Run `npm test`, preview locally, then `git add content/articles.json && git commit -m "Add sourced AI article" && git push`.
5. Vercel builds from GitHub and publishes your new article automatically. No layout or application code change is necessary.

You can also edit `content/articles.json` directly in GitHub. `status: "draft"` hides an article; `status: "published"` and `publishedAt` not in the future display it. New categories/tags become pages automatically.

**Editorial authority:** You are responsible for verification, rights, corrections, dates, legal policies and deployment configuration.

## Folder structure

```text
Blog-Project/
  api/
    news.js            # Live allowlisted feed aggregator; GET /api/news
    newsletter.js      # Optional Resend registration; POST /api/newsletter
    _rss.js            # RSS/Atom parse helper (not a public endpoint)
  content/
    articles.json      # Sourced editorial articles and publication states
    entities.json      # Companies, model families, tools
    feeds.json         # Trusted RSS feed registry
    pages.json         # Policy/contact/about page text
    site.json          # Brand, navigation, general site text
  docs/                # Full project, editorial, deployment and roadmap manuals
  legacy/              # Original Index.html, Index.js and Style.css
  public/
    assets/             # Original project image assets
    app.js              # Navigation, theme, live feed, search, form UI
    studio.js           # Browser-only draft studio
    styles.css          # Responsive publication design
    favicon.svg
  scripts/
    build.mjs           # Static page generator, SEO metadata, RSS, sitemap
    dev-server.mjs      # Local preview + local API routing
    publish.mjs         # Import and validate article draft JSON
  tests/
    site.test.mjs
  dist/                 # Generated by npm run build; deployed to Vercel (ignored in Git)
  vercel.json           # Build/static output and security headers
  .env.example
  package.json
```

## Architecture & limitations

Content is stored as version-controlled JSON. A Node build step produces pre-rendered HTML for public pages. Search uses a locally generated JSON index and no paid search service. Fresh headlines are retrieved only from a hard-coded allowlist of external feeds, with a 15-minute server and edge cache. Resend is a **separate optional** write integration; without keys there is an honest unavailable error and nothing is stored.

This is optimized for a small editorial site and straightforward Git-to-Vercel publishing. It is not yet a multi-user database CMS, has no roles/authenticated site editing, no scheduled AI-written news posts, no automatic fact-checking, and no confirmed newsletter delivery without configuration. Vercel infrastructure and upstream sources may be unavailable or change formats.

## Full manuals

- [Deployment — GitHub → Vercel → DNS → production](docs/DEPLOYMENT.md)
- [Editorial/Admin — publish, edit, draft, sources, images](docs/EDITORIAL.md)
- [Architecture/Audit — stack, decisions, security, performance](docs/ARCHITECTURE.md)
- [Launch checklist, roadmap and limitations](docs/ROADMAP.md)

## Version history

- 2.0: Rebuilt from the original 2024 single-page Artinex sample; preserved original source assets and template in `legacy/`.
#   A r t i n e x _ V 1 . 2  
 