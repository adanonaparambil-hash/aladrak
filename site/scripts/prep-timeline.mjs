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

/* 1995 previously carried the Al Kamil Filling Station film print. It is a fine
   picture, but the man standing in it is the same man standing in the 1990
   print directly before it, so the wheel showed him twice in a row. This is the
   Knowledge Oasis ring-road job: earthworks, retaining wall and a crew in Al
   Adrak yellow — infrastructure being built, which is what the 1995 line is
   about. The print stays in the repo; nothing else used it, but it is the
   company's own archive. */
await cover("public/images/projects/kom-ring-road.jpg", "era-1995-infrastructure.jpg");

/* 2017 is a 525x295 news thumbnail and already tightly framed: filling the 5:4
   plate throws away 30% of its width, and both outer faces — the man on the
   left and the woman on the right — live in exactly that 30%. So it is fitted
   to the plate's width instead and sat on the section's own ink, the same
   treatment the award wordmarks get. The bands above and below are invisible
   against the section; a cropped-off face is not. */
await contain("public/images/blog/adrak-developers-marks-first-key-handove.jpg", "m-2017-key-handover.jpg", { pad: 0 });

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
// swapped from the school render to the actual GEMS/Adrak signing-ceremony
// photograph — the milestone is the partnership being signed, not the building
await cover("public/images/blog/gems-adrak-signing-ceremony.jpg", "m-2026-gems.jpg");

/* 1990 is the company's own photograph of a two-storey block going up, with a man
   standing in front of it. The client asked for the building alone, without him.
   Painting him out would mean inventing masonry in an archive photograph, so he is
   cropped out instead: he fills the lower middle of the frame (x 480-880, y 325-779),
   and the right-hand wing's arcade beyond him is clear of him entirely — his
   shoulder reaches x ~790 at the foot of this box. The box is 5:4 to match the plate,
   560x448 of the 1400x779 original, so it is enlarged about 2x; the photograph was
   soft to begin with and a light unsharp mask keeps it from smearing.
   The original is staged in scripts/.src-timeline/ (gitignored).

   Reported 20 Oct as unclear on the wheel, and it was: the print is faded as well
   as soft, and at this size the plate was a flat repeated facade with almost no
   tonal separation — pale blockwork against a pale sky. The framing is unchanged
   (the client's "without him" still stands); what is corrected is the fade. The
   linear pass pulls the black point down and the modulate restores the colour the
   print lost, which is what makes the arcade and the window reveals read at all.
   Sharpening eases off slightly at the same time: on a soft 2x enlargement the
   old 2.2 was biting into grain rather than detail.

   NOTE, if a sharper plate is ever wanted: it cannot come from this crop. Keeping
   the man out of frame forces a 560px region out of a 1400px original — the 2x
   enlargement IS the blur, and no amount of sharpening recovers it. The whole
   frame at 974x779 (he stands centre-right) enlarges only 1.13x and is visibly
   sharper. That is a decision about the photograph, not the code. */
await sharp("scripts/.src-timeline/era-1990-site.jpg")
  .extract({ left: 840, top: 100, width: 560, height: 448 })
  .resize(W, H, { kernel: "lanczos3" })
  .linear(1.18, -14)
  .modulate({ saturation: 1.22 })
  .sharpen({ sigma: 1.1, m1: 0.5, m2: 1.9 })
  .jpeg({ quality: 90, mozjpeg: true })
  .toFile(`${OUT}/era-1990-site.jpg`);
console.log("region  1400x779 -> era-1990-site.jpg (the building, without the man)");
