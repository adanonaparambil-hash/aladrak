// 1) Retry all blog images via weserv  2) Convert jina markdown → news-data.json
import { execSync } from "child_process";
import fs from "fs";
import path from "path";
import sharp from "sharp";

const SP =
  "C:/Users/ITS48/AppData/Local/Temp/claude/E--ITS48-Development-Adraklive/432726eb-ce0b-4e09-a9db-09477f691682/scratchpad";
const items = JSON.parse(fs.readFileSync(`${SP}/blog-items.json`, "utf8"));
const outDir = "public/images/blog";
fs.mkdirSync(outDir, { recursive: true });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const slugify = (s) =>
  s.toLowerCase().replace(/&amp;/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 48);

const posts = [];
for (let i = 0; i < items.length; i++) {
  const it = items[i];
  const cleanTitle = it.t1.replace(/\u200b/g, "").replace(/\.{3}$/, "").trim();
  const slug = slugify(cleanTitle) || `post-${i}`;
  const imgOut = path.join(outDir, `${slug}.jpg`);

  // image (thumb first — guaranteed to exist; then try full-size upgrade)
  if (!fs.existsSync(imgOut)) {
    for (const cand of [it.img.replace("/thumb-", "/"), it.img]) {
      try {
        const tmp = path.resolve("news-tmp.img");
        execSync(
          `curl -sL --max-time 45 "https://images.weserv.nl/?url=${encodeURIComponent("www.aladrak.com/" + cand)}" -o "${tmp}"`,
          { stdio: "pipe" }
        );
        if (fs.statSync(tmp).size > 4000) {
          await sharp(tmp)
            .resize({ width: 1200, withoutEnlargement: true })
            .flatten({ background: "#f5f2ea" })
            .jpeg({ quality: 78, mozjpeg: true })
            .toFile(imgOut);
          break;
        }
      } catch {}
      await sleep(600);
    }
    await sleep(900);
  }

  // article body from jina markdown
  let body = [];
  const mdFile = `${SP}/blog-articles/${slug}.md`;
  if (fs.existsSync(mdFile)) {
    const md = fs.readFileSync(mdFile, "utf8");
    const content = md.split("Markdown Content:")[1] || "";
    body = content
      .split(/\n{1,}/)
      .map((l) => l.replace(/!\[[^\]]*\]\([^)]*\)/g, "").replace(/\[([^\]]*)\]\([^)]*\)/g, "$1").replace(/[*_#>]+/g, "").trim())
      .filter(
        (l) =>
          l.length > 80 &&
          !/^(\d{1,2} \w+ \d{4})$/.test(l) &&
          !/Quick Links|All Rights Reserved|aladrak\.com|Cookie|Subscribe/i.test(l)
      );
  }
  const title = cleanTitle.replace(/&amp;/g, "&");
  posts.push({
    slug,
    date: it.t0,
    title,
    img: fs.existsSync(imgOut) ? `/images/blog/${slug}.jpg` : null,
    body: body.length ? body : [it.t2 + "…"],
  });
  console.log(`${i + 1}/${items.length}`, slug, fs.existsSync(imgOut) ? "img✓" : "IMG✗", body.length, "paras");
}

fs.rmSync("news-tmp.img", { force: true });
fs.writeFileSync("lib/news-data.json", JSON.stringify(posts, null, 2));
console.log("WROTE lib/news-data.json", posts.length);
