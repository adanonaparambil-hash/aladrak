/**
 * Card heads for the current-portfolio register.
 *
 * Only six of the sixteen live projects have a photograph anywhere in the
 * archive; the rest render a typographic plate in the component instead of
 * borrowing a picture of a different building. Uniform 16:9 so the grid stays
 * even whichever treatment a card gets.
 *
 * Run from site/:  node scripts/prep-register.mjs
 */
import sharp from "sharp";
import { mkdirSync } from "node:fs";

const W = 880, H = 495;
mkdirSync("public/images/register", { recursive: true });

const HEADS = [
  ["rrk", "public/images/projects/kom-ring-road.jpg"],
  ["ppm", "public/images/projects/public-prosecution.jpg"],
  ["tis", "public/images/projects/tis.jpg"],
  ["cla", "public/images/blog/community-facility-and-labour-accommodation-at-k.jpg"],
  ["dbk", "public/images/blog/bandar-al-khairan-resort-project-launched.jpg"],
  ["zrb", "public/images/blog/zen-residences-at-muscat-bay.jpg"],
];

for (const [code, src] of HEADS) {
  const m = await sharp(src).metadata();
  // the news heads are 525px wide and upscale ~1.7x; a light unsharp keeps them
  // from going to mush at card size
  const soft = m.width < W;
  let p = sharp(src).resize(W, H, { fit: "cover", position: "attention", kernel: "lanczos3" });
  if (soft) p = p.sharpen({ sigma: 1.0, m1: 0.5, m2: 2.0 });
  await p.jpeg({ quality: 86, mozjpeg: true }).toFile(`public/images/register/${code}.jpg`);
  console.log(`${m.width}x${m.height}${soft ? " (upscaled)" : ""} -> register/${code}.jpg`);
}
