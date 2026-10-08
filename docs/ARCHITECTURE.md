# Artinex architecture, audit and security notes

## What was found in the user's ZIP

**Original technology stack:** one `Index.html`, one `Style.css`, one `Index.js`, local image assets and no `package.json`, framework, application routes, database, CMS, API, real article pages or deployment configuration. `main.py` was empty; `ErDiagram.py` was unrelated to the functioning site. The existing contact form submitted to a hard-coded third-party Formspree URL with unverified ownership, and multiple "Learn more" buttons were not connected to content pages. Navigation was anchor-based. Images and the Artinex visual name existed and were useful.

**Preserved:** Artinex branding, original content themes (Midjourney, pharmaceuticals, Sora, Copilot), owned ZIP image files, and the original HTML/CSS/JS source under `legacy/` for reference. Original `.git` history was intentionally not shipped in the updated distributable, to avoid unknowingly sharing remote configuration/history.

**Refactored:** the single-page layout into semantic, accessible page templates; blog post previews into actual educational article pages; old desktop-fixed CSS into responsive styling; JavaScript into focused behaviors; anonymous demo buttons into valid internal links; and deployment into Vercel-friendly, Node-generated static HTML.

**Removed from live site:** nonfunctional legacy buttons, heavy hover scaling, dependency on Font Awesome just to render a menu, fixed-page dimensions, unverified contact submission destination, and the empty Python backend.

## Chosen technology stack

| Layer | Technology | Why |
|---|---|---|
| Frontend | HTML5, CSS3, vanilla browser JS | Preserves original approach and provides fast loading with no dependency maintenance |
| Build | Node.js ES modules | Static prerendered routes, metadata, XML RSS/sitemap and a generated search index |
| Backend | Vercel Node API functions | Only live news and optionally newsletter require server-side work |
| Database | None in launch version | Small editorial site can keep reviewed content under Git version control |
| Content/CMS | `content/*.json` + browser draft studio + GitHub commit workflow | Human-reviewed publication without unauthenticated hosted editing |
| News API | RSS/Atom from curated feeds | Stable, source-attributed headlines with links to publishers |
| Newsletter | Optional Resend Contacts API | Server-side secret, external subscriber storage |
| Search | Browser-side lightweight index | Instant enough for the starter volume; no external service |
| Styling | Custom responsive CSS and system theme | Brand consistency, control, small bundle |
| Authentication | GitHub permission control for publishing | No need for potentially vulnerable homegrown admin login |
| Hosting | Vercel static output + functions | Free-tier-friendly small publication deployment |
| Analytics | Not bundled | Privacy by default; add knowingly when needed |

## Content pipeline

```text
Editor → Draft (browser local) → Export JSON → Verify → Import / GitHub review
   → content/articles.json → npm run build → dist/pages + sitemap + search + RSS
   → Vercel static CDN → reader

Official feeds → GET /api/news → allowlisted fetch with timeout & size cap
   → safe title/link/date parser → dedupe/sort/cache → browser live wire

Newsletter form → POST /api/newsletter → validate consent + email + origin
   → Resend Contacts API (only if configured) → list; no local database
```

## SEO and content quality

Public article URLs prerender at build time, with unique title and description metadata, semantic h1/h2 tags, BlogPosting JSON-LD, internal links and source lists. The homepage includes organization schema. Category and tag routes are precomputed. When `SITE_URL` is configured at build time, canonicals, OG URL/image, sitemap locations and editorial RSS links use the actual domain. Without it, no fake canonical domain is declared and the sitemap remains empty. The RSS placeholder is intentionally obvious so deployment configuration cannot be confused with a real domain.

## Security model

- No client-side secrets, no SQL/database injection surface, and no client-supplied feed URLs for server-side requests.
- Newsletter enforces JSON content type, strict email shape, explicit consent, request-size cap and same-origin browser requests. There is an inert honeypot for basic bots.
- Third-party titles/descriptions are HTML-escaped before DOM rendering. Static editorial JSON is escaped at build time. URLs are protocol-checked and outbound links use `noopener noreferrer`.
- No public content mutation endpoint exists: editing access is controlled by GitHub repository permissions.
- Security headers include nosniff, frame denial, referrer restrictions and a minimal permissions policy.
- This architecture still needs deployment-specific rate limiting/WAF for the sign-up endpoint; it has not received a penetration test or third-party dependency audit.
- External fonts are optional; system fonts provide a fallback. Images come from the project's supplied assets; audit their redistribution rights before launch.

## Performance and access needs

- Static HTML means search engines and browsers do not have to execute JavaScript to see article text.
- A generated JSON search index can be replaced by hosted search when the collection grows.
- Images are local. Article-card images are lazy-loaded; the lead image is kept eager.
- Mobile menu, keyboard focus, contrast and reduced-motion styling are provided. Real-device WCAG testing is still recommended.
- Feed API imposes source timeouts and a server cache, plus CDN revalidation hints. Cache can cold-start independently across Vercel function instances. Upstream feeds may throttle or fail.
- The local RSS parser is intentionally bounded and limited to title/link/date extraction. It is **not** a full XML validator; if complex feeds become important, migrate to a maintained parser after adding and reviewing the dependency.

## Known limitations / incomplete external integration

1. Live RSS success cannot be guaranteed until verified on your deployed Vercel project with internet access.
2. Newsletter needs your Resend account/credentials and a real opt-in/unsubscribe compliance process; local tests cover validation but not delivery.
3. The studio saves drafts only in your browser, not across devices. Publishing is Git based; no role-based hosted CMS.
4. Future publication dates become visible only after a build on or after that date; auto-redeploy scheduling is not included.
5. The starter has no automatic original-news writing, AI fact checking, search suggestions, proprietary journalism or price crawler.
6. The site's privacy and terms are starter text needing real owner details, legal review and a verified contact method.
7. Real Lighthouse, Core Web Vitals, accessibility audits and production load tests must run on an actual deployment.

## Further recommended security work

Add rate limiting or WAF at Vercel, configure abuse monitoring, recheck third-party feed URLs periodically, verify image licensing, set up error reporting and monitor Vercel function logs. If adding user accounts or a full CMS, use a reputable managed authentication provider and enforce server-side authorization.
