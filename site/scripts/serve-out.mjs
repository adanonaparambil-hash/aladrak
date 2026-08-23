/**
 * Serve the static export locally, so the production build can be checked
 * without deploying it.
 *
 * `next start` cannot do this: with `output: "export"` there is no server to
 * start. And `next dev` is not a substitute here — dev runs React in strict
 * mode with double-invoked effects and hot module replacement, both of which
 * change how GSAP's ScrollTrigger pinning interacts with React's DOM. A bug that
 * only appears in the production bundle is invisible in dev, which is exactly
 * the situation this was written for.
 */
import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { join, extname, normalize } from "node:path";

const ROOT = process.argv[2] ?? "out";
const PORT = Number(process.argv[3] ?? 4000);

const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
  ".mp4": "video/mp4",
  ".woff2": "font/woff2",
  ".pdf": "application/pdf",
  ".txt": "text/plain; charset=utf-8",
};

createServer(async (req, res) => {
  try {
    const url = decodeURIComponent((req.url ?? "/").split("?")[0]);
    // keep the resolved path inside ROOT
    let file = join(ROOT, normalize(url).replace(/^(\.\.[/\\])+/, ""));
    try {
      if ((await stat(file)).isDirectory()) file = join(file, "index.html");
    } catch {
      // fall through to the 404 below
    }
    const body = await readFile(file);
    res.writeHead(200, {
      "Content-Type": TYPES[extname(file)] ?? "application/octet-stream",
      "Cache-Control": "no-store",
    });
    res.end(body);
  } catch {
    res.writeHead(404, { "Content-Type": "text/plain" });
    res.end("not found");
  }
}).listen(PORT, () => console.log(`serving ${ROOT} on http://localhost:${PORT}`));
