# aladrak

Al Adrak Trading & Contracting — corporate website.

Next.js 16 + Tailwind v4 + GSAP. The app lives in `site/`.

```bash
npm --prefix site install
npm --prefix site run dev      # http://localhost:3000
```

Source media archives (`Images/`, `vedio/`) are deliberately not tracked — see .gitignore.

## Live site

<https://adanonaparambil-hash.github.io/aladrak/>

Published by `.github/workflows/pages.yml` on every push to `main`. GitHub Pages
is a static file host, so the app is built as a static export (`output: "export"`
in `site/next.config.ts`) and the resulting `site/out` directory is deployed.
Nothing is committed back — the build output stays an artefact.

Pages must be enabled once per repository, under Settings → Pages → Source →
"GitHub Actions". The workflow cannot do this itself; its token is not permitted
to create the Pages site.

### Two things to know before editing

**Asset paths must go through `asset()`.** Pages serves this repo from the
`/aladrak/` subdirectory. Next.js rewrites its own URLs for that, and the paths
given to `next/image` and `next/link` — but this site uses neither, so every
image, video, poster and nav link is a hand-written string that Next never
touches. All of them go through `asset()` in `site/lib/asset.ts`:

```tsx
import { asset } from "@/lib/asset";

<img src={asset("/images/logo.png")} />
```

A hardcoded `src="/images/…"` or `href="/news"` will work perfectly on localhost
and 404 in production, which is the worst way for this to fail. The prefix comes
from `NEXT_PUBLIC_BASE_PATH`, set by the workflow from the repository name and
left unset locally — which is also all that pointing a custom domain here would
need to change.

**The year count is fixed at build time.** `site/lib/anniversary.ts` derives it
from the founding year, and the page used to re-render daily so it rolled over on
its own. A static export has no server, so the workflow does it instead: it
rebuilds on a New Year schedule with `TZ=Asia/Muscat` (so the count turns over as
the year begins in Oman, not four hours later) plus monthly, because GitHub
disables scheduled workflows on repositories idle for 60 days.

### Bandwidth

The site is ~109MB and a desktop visit pulls ~37MB, most of it `hero-web.mp4` at
30MB. Against Pages' ~100GB/month that is roughly 2,700 visits. GitHub also asks
that Pages not be used as free hosting for a business, so the static build is
worth moving to Cloudflare Pages or Netlify for production use — it is portable
as-is.
