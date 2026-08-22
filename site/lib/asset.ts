/**
 * Prefix a site-root path with the deploy's base path.
 *
 * GitHub Pages serves a project repo from a subdirectory, so the site's root is
 * `/aladrak/`, not `/`. Next.js rewrites its OWN URLs for that (bundles, fonts,
 * routes) once `basePath` is set in next.config.ts, and it rewrites the paths
 * given to `next/image` and `next/link` — but this site uses neither. Every
 * photograph, video, poster and nav link here is a hand-written string in a
 * plain <img>, <video> or <a>, and Next never touches those. Left alone they
 * resolve against the domain root and 404 in production while working perfectly
 * on localhost, which is the worst way for this to fail.
 *
 * So every such path goes through here. The prefix comes from the same env var
 * that feeds next.config.ts, which means:
 *   - `npm run dev` leaves it unset and returns paths unchanged;
 *   - the Pages workflow sets `/aladrak` and the whole site follows;
 *   - pointing aladrak.com at Pages later means unsetting it again, with no
 *     code change anywhere.
 *
 * Paths must start with "/" — a bare or relative path would resolve against the
 * current URL and is almost certainly a mistake, so it is returned untouched
 * rather than silently mangled.
 */
export const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export function asset(path: string): string {
  if (!BASE_PATH || !path.startsWith("/")) return path;
  return `${BASE_PATH}${path}`;
}
