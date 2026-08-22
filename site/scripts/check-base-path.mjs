/**
 * Fail the build if any link or asset in the export escapes the base path.
 *
 * GitHub Pages serves this site from a subdirectory. Next.js rewrites its own
 * URLs, but every hand-written `src` and `href` here is a plain string that has
 * to go through `asset()` (see lib/asset.ts). Miss one and it points at the
 * domain root: the page still builds, still passes review locally, and 404s only
 * in production. That is precisely how the site shipped with a header whose every
 * nav link left the site, and with none of its photographs.
 *
 * So this walks the built HTML and flags any root-absolute URL that does not
 * begin with the base path. It is the check that catches the whole class, rather
 * than the two instances that happened to be noticed.
 *
 * No-op when NEXT_PUBLIC_BASE_PATH is unset — a root deploy has nothing to check.
 */
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
const OUT = process.argv[2] ?? "out";

if (!BASE) {
  console.log("check-base-path: NEXT_PUBLIC_BASE_PATH unset — nothing to check.");
  process.exit(0);
}

/** Schemes and forms that are not root-absolute paths, so cannot be affected. */
const EXEMPT = /^(?:[a-z][a-z0-9+.-]*:|\/\/|#|\?|[^/])/i;

function htmlFiles(dir) {
  const found = [];
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) found.push(...htmlFiles(p));
    else if (name.endsWith(".html")) found.push(p);
  }
  return found;
}

const ATTR = /(?:src|href|poster)="([^"]+)"/g;
const problems = [];

for (const file of htmlFiles(OUT)) {
  const html = readFileSync(file, "utf8");
  for (const [, url] of html.matchAll(ATTR)) {
    if (EXEMPT.test(url)) continue;
    // root-absolute from here on
    if (url === BASE || url.startsWith(BASE + "/") || url.startsWith(BASE + "#")) continue;
    problems.push({ file, url });
  }
}

if (problems.length) {
  console.error(
    `\ncheck-base-path: ${problems.length} URL(s) point outside "${BASE}" and will 404 in production.\n` +
      `Wrap the path in asset() from lib/asset.ts.\n`
  );
  const seen = new Set();
  for (const { file, url } of problems) {
    const key = url;
    if (seen.has(key)) continue;
    seen.add(key);
    console.error(`  ${url}\n    in ${file}`);
  }
  process.exit(1);
}

console.log(`check-base-path: all URLs sit under "${BASE}".`);
