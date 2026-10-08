# Artinex editorial & admin manual

Artinex is **Git-based content management** for a single editor or a small team. GitHub is the permissioned publishing interface; no publicly writable admin endpoints or database are deployed. The included `/studio` is a browser-local writing/export helper, not an authenticated live CMS.

## 1. Day-to-day publishing

1. Identify a topic or a legitimate news development. Prefer the **original publisher, research paper, official documentation or government source**.
2. Check names, dates, capabilities, quotations and uncertainties. Do not treat an AI-generated summary as evidence.
3. Open the local `/studio` page; fill in headline, category, author, date, excerpt, sources, tags and section body.
4. Use **Save local draft** to keep progress on the current browser/device. The draft is kept in `localStorage` and may be lost if site data is cleared. Export a JSON backup.
5. Click **Download article JSON**. Edit the downloaded JSON file and add a concise `takeaways` array with reviewed statements. Add/adjust section paragraphs and human-readable source labels.
6. Import using `npm run article:add -- path/to/draft.json --publish`. This prevents slug duplicates and ensures a published story has a source, excerpt and takeaway.
7. Preview with `npm run dev`, then run `npm test`. Fix any errors.
8. Commit `content/articles.json` in GitHub. Vercel rebuilds automatically when the Git integration is configured.
9. Open the published page, click each source link, and verify the headline, category, date, image, mobile layout, schema and share metadata.

## 2. Create or edit articles directly

Open `content/articles.json` and maintain a JSON **array of article objects**. Keep a unique URL-safe slug. The core structure is:

```json
{
  "slug": "an-original-article-slug",
  "title": "A specific, accurate headline",
  "subtitle": "A supporting deck",
  "excerpt": "What the reader will learn.",
  "category": "Research",
  "tags": ["Evaluation", "LLMs"],
  "author": "Named editor or Artinex Editorial",
  "publishedAt": "2026-10-08",
  "updatedAt": "2026-10-08",
  "status": "draft",
  "kind": "Analysis",
  "featured": false,
  "image": "/assets/your-image.jpg",
  "takeaways": ["A verified point backed by the cited material."],
  "sections": [
    { "heading": "Context", "paragraphs": ["Context, accurately stated."] },
    { "heading": "Evidence", "paragraphs": ["Evidence and limitations."], "bullets": ["A useful factual point."] }
  ],
  "sources": [
    { "label": "Original primary source", "url": "https://example.org/original-source" }
  ]
}
```

`status` must be `published` for display. Future `publishedAt` dates stay hidden until a subsequent build happens **after** that date; this static implementation does not run an automatic daily rebuild. To publish on schedule without manual action, set up a Vercel Deploy Hook and authorized GitHub Actions scheduler or an external CMS scheduling service. Do not claim automatic scheduling until actually configured.

Do not insert HTML into JSON; the build escapes all article strings. Sections render as headings, paragraphs, lists and source links, with automatic table of contents.

## 3. Categories and tags

Categories and tags are **dynamic**. Put a meaningful `category` and `tags` array on a published article; the build generates `/category/category-slug` and `/tag/tag-slug` pages automatically. You do not need to edit navigation for every new topic.

For a permanent top-level navigation item, change `content/site.json` → `nav`. A topic page without published articles will not be created. Keep category names consistent to avoid near-duplicates like "AI Agent" and "AI Agents".

## 4. Images

Store your licensed artwork in `public/assets/`. Article fields use absolute asset paths, such as `/assets/my-illustration.webp`. Avoid external hotlinks, copyrighted news photography without permission, and fake photojournalism. Provide suitable alt text when images convey essential content; the default article hero alt currently derives from the headline and should be refined for specific cases as you expand the schema.

## 5. AI companies, models and tools

Edit `content/entities.json`:

- `companies`: company name, kind, official site, overview, reference link and topics.
- `models`: developer, model-family type, overview, official documentation and topics.
- `tools`: company, use case, category, official website and conservative pricing text.

The generator automatically builds directory and detail pages. Avoid making unsourced claims about model launch dates, benchmark rankings, context length, funding and pricing; verify primary sources and date every changing field before adding it.

## 6. Live headline feeds

Edit `content/feeds.json` to curate sources. Each entry needs a recognizable `name`, verified `url`, `category`, and `homepage`. `api/news.js` reads this fixed list server-side; visitors cannot supply arbitrary feed URLs. Headlines should be read at the original publisher, not copied to your editorial archive without original reporting, permission and verification.

The news wire is a **link aggregator**, not an AI content-generation robot. Maintain a clear distinction between automatically collected titles and reviewed original editorial articles. Do not manufacture "breaking" labels or future-dated stories.

## 7. Corrections and source quality

For published corrections:

1. Review the evidence and update the inaccurate section in `articles.json`.
2. Set `updatedAt` to the true correction date and describe significant corrections visibly in the article body. The data model supports `updatedAt`; there is no automated correction ledger yet.
3. Verify source links and avoid dead or misleading references.
4. Redeploy and record the change in GitHub commit history.

A useful article structure is: **headline → summary → context → evidence → uncertainty → analysis → sources**. Label preprints, unverified claims, opinion and speculation honestly.

## 8. Analytics, moderation and scaling

There are no comments or social login. No invasive analytics are bundled. Add a privacy-conscious platform (e.g. Vercel Web Analytics) only after reviewing its current terms, integrating the actual implementation and updating the privacy policy. This project does not fabricate page views or reader metrics.

For multi-editor roles, image uploads, scheduling and rich text, migrate `content/articles.json` to a properly authenticated headless CMS when volume requires it. Keep the generated static page and source-attribution concepts.
