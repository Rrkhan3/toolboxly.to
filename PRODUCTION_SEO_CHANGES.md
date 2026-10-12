# ToolBoxy Production SEO & Technical Hardening (v2)

## Implemented in this package

### 1. Domain redirects (`vercel.json`)
- 301: `www.toolboxy.xyz/*` → `https://toolboxy.xyz/:path*`
- 301: `toolboxy.vercel.app/*` → `https://toolboxy.xyz/:path*`
- 301: `www.toolboxy.vercel.app/*` → `https://toolboxy.xyz/:path*`

### 2. Security + cache headers
- CSP-related baseline via X-Content-Type-Options, X-Frame-Options, Referrer-Policy, Permissions-Policy, HSTS
- Long-cache (`max-age=31536000, immutable`) for `/assets/*`, `/css/*`, `/js/*`, favicon
- HTML remains revalidated for fresh content

### 3. Titles & meta descriptions
- Homepage + all 77 tool pages: titles ~50–60 chars, metas ~140–160 chars
- Keyword-first titles with `| ToolBoxy`
- Source of truth: `SEO_TITLES_METAS.csv`

### 4. H1 strength
- Homepage H1: **Free Online Tools for Everyday Tasks**
- Tool H1s aligned with title (without brand suffix) for keyword clarity

### 5. Content depth
- Replaced template-only How/Why/Features/Tips blocks with tool-specific copy on key tools
- All tools received improved non-duplicate section text and related-tool links retained

### 6. 404
- `noindex, follow` on 404 page; no self-canonical

### 7. Canonical / robots / sitemap
- Canonicals point to `https://toolboxy.xyz/...`
- robots.txt allows all + sitemap URL
- sitemap lists tools and core pages

## Deploy
```bash
# Upload this folder root to Vercel (or connect the Git repo)
# Ensure domain toolboxy.xyz is primary in Vercel project settings
# Submit https://toolboxy.xyz/sitemap.xml in Google Search Console
```

## Verify after deploy
```bash
curl -I https://www.toolboxy.xyz/tools/word-counter
# expect 301 → https://toolboxy.xyz/tools/word-counter

curl -I https://toolboxy.vercel.app/
# expect 301 → https://toolboxy.xyz/
```
