/**
 * Bake the History wheel's photo plates to the wheel's own 5:4.
 *
 * The plate is a fixed `aspect-[5/4]` box with `object-cover object-top`, so a
 * source of any other shape is cropped by the browser with no say from us. The
 * modern-chapter sources are news photographs of wildly different shapes — a
 * portrait award handover (960x1280), a 3:1 aerial, a wordmark on black — and
 * leaving the crop to CSS cut the handshake out of one and left nothing but
 * empty desert in another. Deciding each crop here, once, with the picture in
 * front of us is the difference.
 *
 * Two treatments:
 *   cover   — photographs. Fill the plate; `top` is the fraction of the vertical
 *             overflow trimmed from above, so a group shot can sit on the people.
 *   contain — award wordmarks. Never cut a logo; sit it on the section's own ink
 *             (--color-ink) so the letterbox is invisible.
 *
 * Run from site/:  node scripts/prep-timeline.mjs
 */
import sharp from "sharp";
import { mkdirSync } from "node:fs";

const W = 1100, H = 880;
const INK = { r: 0x0a, g: 0x0f, b: 0x0c, alpha: 1 };
const OUT = "public/images/timeline";
mkdirSync(OUT, { recursive: true });

async function cover(src, out, { top = 0.5, sharpen = false } = {}) {
  const m = await sharp(src).metadata();
  const s = Math.max(W / m.width, H / m.height);
  const sw = Math.round(m.width * s), sh = Math.round(m.height * s);
  let p = sharp(src)
    .resize({ width: sw, height: sh, kernel: "lanczos3" })
    .extract({
      left: Math.round((sw - W) / 2),
      top: Math.max(0, Math.min(sh - H, Math.round((sh - H) * top))),
      width: W, height: H,
    });
  // the news thumbnails are only 525px wide, so they are upscaled ~2x; a light
  // unsharp mask is the difference between "soft" and "smeared"
  if (sharpen) p = p.sharpen({ sigma: 1.1, m1: 0.6, m2: 2.2 });
  await p.jpeg({ quality: 88, mozjpeg: true }).toFile(`${OUT}/${out}`);
  console.log(`cover   ${m.width}x${m.height} -> ${out}`);
}

async function contain(src, out, { pad = 0.08, trim = false } = {}) {
  let b = sharp(src);
  // the Forbes wordmark ships with thin white bleed bars; on the ink they read
  // as rendering artefacts rather than as part of the logo
  if (trim) b = b.trim({ threshold: 40 });
  const badge = await b
    .resize({ width: Math.round(W * (1 - pad * 2)), height: Math.round(H * (1 - pad * 2)), fit: "inside", kernel: "lanczos3" })
    .sharpen({ sigma: 0.9 })
    .toBuffer();
  await sharp({ create: { width: W, height: H, channels: 3, background: INK } })
    .composite([{ input: badge, gravity: "centre" }])
    .jpeg({ quality: 90, mozjpeg: true }).toFile(`${OUT}/${out}`);
  console.log(`contain -> ${out}`);
}

await contain("public/images/awards/award-forbes.jpg", "m-2019-forbes.jpg", { pad: 0.07, trim: true });
// the panoramic site shot cropped square was mostly empty desert; the aerial of
// the silo field is the picture that actually says "greenfield dairy city"
await cover("public/images/blog/mazoon-dairy-project-16-sq-km-greenfield-develop.jpg", "m-2020-mazoon.jpg", { sharpen: true });
// the badge is dead-centre, so filling the plate loses only its glow
await cover("public/images/awards/award-golden.jpg", "m-2021-golden.jpg", { sharpen: true });
// portrait: 0.42 keeps the award handover in frame instead of the banner above it
await cover("public/images/Adrak Developers.jpeg", "m-2022-adrak-developers.jpg", { top: 0.42 });
await cover("public/images/blog/dossier-construction-awards-2023.jpg", "m-2023-dossier.jpg", { sharpen: true });
await cover("public/images/blog/sultan-haitham-city-a-new-milestone-in-urban-dev.jpg", "m-2024-sultan-haitham-city.jpg", { sharpen: true });
await cover("public/images/Thumrait.jpg", "m-2025-thumrait.jpg");
await cover("public/images/blog/gems-international-school-hai-al-naseem.jpg", "m-2026-gems.jpg");
