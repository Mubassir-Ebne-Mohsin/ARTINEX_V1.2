# Artinex deployment manual — GitHub → Vercel

This manual assumes **you own the GitHub repository and Vercel project**. We did not log in, push code, publish a URL, change DNS or provision third-party services.

## A. Test your ZIP locally

1. Extract the delivered `Artinex_Enhanced_Project.zip` archive. Open the `Blog-Project` folder in VS Code.
2. Install Node.js **20 or newer** if not already installed, from https://nodejs.org.
3. In a terminal inside `Blog-Project`, run `npm run dev`.
4. Open http://localhost:3000. Verify homepage, `/articles`, `/models`, `/tools`, `/search`, `/studio`, `/news`, an article link and mobile navigation.
5. Stop with Ctrl+C; run `npm test`. No npm package install is required.
6. The live feed needs an outbound internet connection. It can show an unavailable or empty state when upstream RSS sources cannot be fetched. Newsletter registration intentionally returns an unconfigured error until enabled.

## B. Put the project in GitHub

1. Visit https://github.com/new and create a repository, e.g. `artinex-ai`.
2. **IMPORTANT:** The delivered ZIP intentionally omits the old `.git` folder and credentials. This gives you a clean history. Do not push the original `.git` folder without reviewing it.
3. From the project root, use a terminal:

```bash
git init
git branch -M main
git add .
git commit -m "Launch Artinex publication platform"
git remote add origin https://github.com/YOUR_USERNAME/artinex-ai.git
git push -u origin main
```

4. Alternatively, upload the project files to the GitHub repository using its web interface. Keep `content`, `api`, `public`, `scripts` and `vercel.json` in the repository **root**, not one directory too deep.
5. Verify that no `.env` or API keys were committed. `.gitignore` already excludes these files.

## C. Create a Vercel deployment

1. Go to https://vercel.com/new and sign in.
2. Select **Import Git Repository** and choose `artinex-ai`. Allow GitHub access if prompted.
3. Select **Other** as the framework preset if the UI does not recognize the project. Use **Node.js 22.x** (or newer supported Vercel Node runtime).
4. **Root Directory:** the folder containing `package.json` and `vercel.json` (normally `/`).
5. **Build Command:** `npm run build`.
6. **Output Directory:** `dist`.
7. **Install Command:** `npm install` or leave default. There are no third-party npm dependencies.
8. Before deploying, add `SITE_URL` to **Environment Variables** for Production; the correct public origin should include `https://` and no trailing slash. Example: `https://artinex.yourdomain.com`.
9. Click **Deploy**. Wait for the build logs and check that the generated HTML and API functions are included.
10. Open the preview domain. Confirm the homepage, an article page, `/api/news` (JSON), and `/rss.xml`.

> If you do not yet have a final production URL, deploy first, get the Vercel-assigned domain, then add `SITE_URL` with that exact URL and **Redeploy**. Do not leave `SITE_URL=https://your-real-domain.com` in production.

## D. Add a domain and production environment

1. In Vercel Project → **Settings → Domains**, add your domain.
2. Follow the Vercel-displayed DNS instructions at your DNS provider. DNS record types/values depend on whether you use an apex domain or subdomain; copy them from Vercel instead of guessing.
3. After domain verification and TLS activation, update `SITE_URL` to the canonical chosen `https://` domain in **Settings → Environment Variables**.
4. Redeploy the project to regenerate canonicals, the sitemap and editorial RSS links with the final URL.
5. Check `https://YOUR_DOMAIN/sitemap.xml`, `https://YOUR_DOMAIN/robots.txt` and an article page's canonical meta tag.
6. Ensure Git integration auto-deploys new commits to `main` and previews pull requests on non-production branches.

## E. Optional newsletter

1. Create a verified sender/domain and a contacts list/audience in https://resend.com, subject to the provider's current requirements.
2. Create an API key and copy the mailing list's audience ID (a UUID).
3. Add `RESEND_API_KEY` and `RESEND_AUDIENCE_ID` as **server-only Vercel project environment variables**. Do not prefix them with `NEXT_PUBLIC_` or embed them in browser JS.
4. Redeploy. Test a real opt-in email, verify it appears in the correct list, and ensure unsubscribe controls and local privacy policy comply with your needs.
5. Before launch, configure application- or platform-level bot protection/rate limiting for `/api/newsletter`, and review Resend's latest contact-management API behavior.
6. Until both variables exist, the API responds `503` with an honest error and does not collect data.

## F. Live news sources

The seven configured RSS feeds are listed in `content/feeds.json`. Edit the list carefully and verify that each feed is a publisher-provided RSS/Atom URL with permitted usage. The API uses an allowlist, short timeouts, size limits and 15-minute caching; users cannot tell the server to fetch arbitrary URLs. If a feed fails, it is simply skipped (or a friendly empty state is shown). These are original article links, **not scraped or mirrored full articles**.

If a feed repeatedly returns zero items, inspect its public URL, XML format and access policy. Some providers block shared datacenter IPs or change their feed URL. Avoid bypassing access restrictions. Check Vercel Function logs for failures; detailed provider exceptions are intentionally not sent to visitors.

## G. Publishing after deployment

1. Create a new draft through `/studio`, or edit `content/articles.json` using GitHub's editor.
2. Source-check and approve the content; import the JSON via the CLI as shown in `docs/EDITORIAL.md`.
3. Commit/push only content changes.
4. Vercel's Git integration triggers a rebuild. Check the new article URL and sitemap.
5. To edit an existing article, locate its `slug` in `content/articles.json`, edit, update `updatedAt` (YYYY-MM-DD), commit/push, and verify the redeploy.

## H. Troubleshooting

| Symptom | Cause / action |
|---|---|
| Homepage loads but article links 404 | Confirm Vercel's `cleanUrls: true`, output directory `dist`, and successful build. |
| RSS feed empty | Provider blocked/changed the feed, no outbound access, or source has no recent posts. Open `/api/news` for the status and check Function logs. |
| Newsletter says not configured | Add both Resend env variables; check the contact API permission and redeploy. |
| Search results empty | Rebuild after editing `content/articles.json` or `content/entities.json`. |
| SEO contains placeholder links | Set real `SITE_URL` and redeploy. |
| Images do not load | Put images in `public/assets` and use `/assets/your-file.ext` paths. Verify image rights. |
| Custom domain not active | Verify the exact DNS records given by Vercel and TLS status. |
| Changes not appearing | Confirm your latest commit deployed to the intended environment; use hard refresh. |

## I. Post-launch verification

Use browser developer tools, Lighthouse, mobile testing, search console and Vercel logs. Validate accessibility and SEO against your actual deployment. The offline test suite is valuable but **does not prove real DNS, third-party API delivery, real-device responsiveness, legal compliance or high-load security**.
