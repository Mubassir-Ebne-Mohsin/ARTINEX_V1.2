# Artinex launch plan and feature roadmap

## Phase 1 — Launch readiness

- [x] Rebuild real article, category, directory, search and news pages
- [x] Add sourced educational content and original publisher links
- [x] Add static SEO metadata, RSS, sitemap templates and basic accessibility
- [x] Add two optional serverless API routes and automated tests
- [ ] Review and fact-check sample articles, assign actual editorial responsibility
- [ ] Verify original image rights or replace with properly licensed assets
- [ ] Configure actual contact information and review legal pages
- [ ] Create GitHub repository, configure Vercel and the final `SITE_URL`
- [ ] Verify the live RSS endpoint and each source in the deployed environment
- [ ] Test mobile layout, accessibility, performance and all navigation on real devices

## Phase 2 — Consistent editorial growth

- Establish a publishing cadence, topic taxonomy and corrections policy
- Publish original explainers and meaningful sourced reporting
- Add named author biographies, detailed editorial dates and related-event timelines
- Implement image-level alt text and article preview QA checks
- Connect Search Console/Bing Webmaster Tools; consider privacy-conscious analytics
- Expand the model/tool directories only when details can be verified and dated

## Phase 3 — Automation responsibly

- Monitor feed health and source errors; add a dashboard for stale/broken feeds
- Add **editorial review queues** for imported headlines instead of automatic reposting
- Use an approved scheduler/Deploy Hook if scheduled publication is desired
- Add deduplication across sources and a taxonomy for companies/models/topics
- Add authenticated CMS when several editors need rich text, roles and image uploads

## Phase 4 — AI-assisted tools with human review

- Create optional drafts and structured source/claim annotations from official documents
- Add a citation validation step and a correction-history record
- Add advanced search or contextual topic recommendations grounded in site content
- Offer a research paper digest with original links, methodology and explicit uncertainty
- Never silently invent citations, or present AI-generated summaries as verified news

## Phase 5 — Scale

- Move from JSON to a managed editorial CMS or relational database after content volume warrants it
- Add webhook-triggered incremental builds and persistent caching for aggregated feeds
- Use robust indexing, per-source rate limits and abuse protection
- Introduce role-based workflows, approval chains and provenance history
- Track Core Web Vitals, editorial quality metrics and security incidents

## Definition of done for a public launch

A legitimate public publication requires more than passing local tests. Before announcing Artinex: confirm actual deployment and canonical URL, correct legal ownership/contact details, rights to images, verified sources, up-to-date content and current feed retrieval, functioning forms and unsubscribe flows if enabled, and no obvious mobile/accessibility failures. Record approvals in Git history.
