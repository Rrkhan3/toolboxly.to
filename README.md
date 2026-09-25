# ToolBoxy — Free Online Tools for Everyone

Static website (HTML5 + CSS3 + vanilla JS). Clean URLs via directory `index.html` structure.

Production domain: https://toolboxy.xyz/

## Clean URL structure
- `/` — homepage
- `/tools` — all tools
- `/tools/age-calculator` — individual tool
- `/about`, `/contact`, `/privacy`, `/terms`, `/categories`, `/popular`

## Deploy
Upload the **contents** of this folder to the web root. Ensure the host serves `index.html` for directories.

Redirects for old `.html` URLs:
- Netlify / Cloudflare Pages: `_redirects`
- Apache: `.htaccess`

## Local testing
Root-relative paths (`/css/...`, `/js/...`) require an HTTP server (not `file://`):

```bash
cd toolboxy
python3 -m http.server 8080
```

Open http://127.0.0.1:8080/

## Ads
Configured in `js/ads.js` only.

## Tools
43 tools. No build step.
