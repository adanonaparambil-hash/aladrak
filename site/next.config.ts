import type { NextConfig } from "next";

/**
 * GitHub Pages serves a project site from a subdirectory —
 * https://<account>.github.io/<repo>/ — so the whole app has to know it lives
 * under a prefix. That prefix is supplied by the deploy workflow as
 * NEXT_PUBLIC_BASE_PATH and consumed in exactly two places: here, for Next's own
 * bundles and routing, and in `lib/asset.ts`, for the hand-written `/images/...`
 * and `/videos/...` paths that Next does not rewrite for us.
 *
 * It is deliberately an env var rather than a hard-coded "/aladrak":
 *   - local `npm run dev` leaves it unset, so development stays at the root and
 *     nothing has to change to work on the site;
 *   - pointing a custom domain (aladrak.com) at Pages later means serving from
 *     the root again — unset the variable and the whole site follows, with no
 *     code change.
 */
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const nextConfig: NextConfig = {
  /**
   * Pages is a static file host: no Node.js server, so the app is prerendered to
   * plain HTML/CSS/JS in `out/`. Everything this site does — GSAP, Lenis, the
   * canvas intro, the modals — is client-side already, so nothing is lost.
   */
  output: "export",
  basePath,
  assetPrefix: basePath || undefined,
  /**
   * `next/image`'s default loader needs a server to resize on demand. The site
   * uses plain <img> throughout, so this changes nothing today; it is here so
   * that reaching for next/image later fails loudly in review rather than
   * silently at build time.
   */
  images: { unoptimized: true },
  /**
   * Emit `careers/index.html` instead of `careers.html`. Pages resolves a bare
   * `/careers/` to the directory's index, so this is what makes the extensionless
   * URLs actually work on this host.
   */
  trailingSlash: true,
};

export default nextConfig;
