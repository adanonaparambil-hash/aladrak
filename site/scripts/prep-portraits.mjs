/**
 * Team portraits and the two CED section pictures, from studio originals
 * supplied by the client.
 *
 * The originals are tall full-length studio frames and wide reportage frames,
 * and the places they land want quite different shapes, so every crop here is
 * read off the picture with a percentage grid rather than left to
 * `object-cover` to decide:
 *
 *   roster  — aspect-[5/6] head-and-shoulders at 500x600, matching the rest of
 *             the grid. Much tighter than the sources, so these crop on both
 *             axes; `cx` aims the box at the sitter when they are off-centre.
 *   founder — aspect-[4/5] in the founder feature (Team.tsx).
 *   history — the 1986 milestone plate in the history wheel, aspect-[5/4].
 *   hse     — the HSE page hero, a wide band.
 *
 * Fractions are of the ORIGINAL frame. If a source is ever replaced,
 * re-measure with a percentage grid rather than nudging these numbers blind.
 *
 * Sources live in scripts/.src-portraits/ (gitignored, like the other prep
 * staging folders) — the originals run to several MB each and have no business
 * in public/, which ships verbatim to the static export.
 *
 * Run from site/:  node scripts/prep-portraits.mjs
 */
import sharp from "sharp";
import { existsSync } from "node:fs";

const SRC = "scripts/.src-portraits";
if (!existsSync(SRC)) {
  console.error(`missing ${SRC}/ — see the header for what belongs in it`);
  process.exit(1);
}

/**
 * Crop by fractions of the source, then write at an exact size.
 *
 * The guard matters: a crop box whose shape disagrees with the output shape
 * does not fail, it silently stretches a face. Better to stop.
 */
async function cut(src, out, box, w, h, label) {
  const m = await sharp(src).metadata();
  const left = Math.round((box.left ?? 0) * m.width);
  const right = Math.round((box.right ?? 1) * m.width);
  const top = Math.round((box.top ?? 0) * m.height);
  const bottom = Math.round((box.bottom ?? 1) * m.height);
  const cw = right - left;
  const ch = bottom - top;
  if (Math.abs(cw / ch - w / h) > 0.01) {
    throw new Error(
      `${out}: crop is ${(cw / ch).toFixed(3)} but output is ${(w / h).toFixed(3)} — the picture would be squashed`
    );
  }
  await sharp(src)
    .extract({ left, top, width: cw, height: ch })
    .resize(w, h, { kernel: "lanczos3" })
    .jpeg({ quality: 88, mozjpeg: true })
    .toFile(out);
  console.log(`${label.padEnd(9)} ${m.width}x${m.height} -> ${out}  (${w}x${h})`);
}

/**
 * A roster tile: 5:6 head-and-shoulders at 500x600.
 *
 * `top`/`bottom` frame the sitter vertically; the width follows from the 5:6
 * shape and is centred on `cx`. Where the source is too narrow to give that
 * width — Sayed's frame is only 847px wide — the box widens vertically instead
 * of overflowing the frame, which is why this computes rather than takes
 * literal edges.
 */
async function roster(srcName, slug, { top, bottom, cx = 0.5 }, label) {
  const src = `${SRC}/${srcName}`;
  const m = await sharp(src).metadata();
  const AR = 5 / 6;

  let t = Math.round(top * m.height);
  let b = Math.round(bottom * m.height);
  let ch = b - t;
  let cw = Math.round(ch * AR);

  if (cw > m.width) {
    cw = m.width;
    ch = Math.round(cw / AR);
    b = t + ch;
    if (b > m.height) {
      b = m.height;
      t = Math.max(0, b - ch);
      ch = b - t;
      cw = Math.round(ch * AR);
    }
  }

  let left = Math.round(cx * m.width - cw / 2);
  left = Math.max(0, Math.min(m.width - cw, left));

  await cut(
    src,
    `public/images/team/roster/${slug}.jpg`,
    { left: left / m.width, right: (left + cw) / m.width, top: t / m.height, bottom: (t + ch) / m.height },
    500,
    600,
    label
  );
}

/* ---- the roster ---------------------------------------------------------
   Measured off percentage grids; the numbers after each name are where the
   head top and the chin fall in the ORIGINAL, which is what the box is built
   around — the convention across this grid is the head occupying roughly the
   top 40% of the tile, shoulders filling the rest.
   --------------------------------------------------------------------- */
await roster("anoop-das.png", "anoop", { top: 0.08, bottom: 0.70, cx: 0.48 }, "roster"); // head 13%, chin 35%
await roster("riyas-mohamed.jpeg", "riyas", { top: 0.17, bottom: 0.82, cx: 0.52 }, "roster"); // head 22%, chin 47%
await roster("richard-sequeira.png", "richard", { top: 0.02, bottom: 0.65, cx: 0.50 }, "roster"); // head 6%, chin 28%
await roster("sayed-iftequar-ali.jpeg", "iftikhar", { top: 0.05, bottom: 0.70, cx: 0.50 }, "roster"); // head 9%, chin 31%
await roster("visakh-ub.jpeg", "visakh", { top: 0.03, bottom: 0.68, cx: 0.50 }, "roster"); // head 7%, chin 28%
await roster("gnanasekaran-t.png", "gnanasekaran", { top: 0.12, bottom: 0.76, cx: 0.50 }, "roster"); // head 16%, chin 38%
/* Tibi's source arrives at 1145x1374 — already exactly 5:6, so this is the one
   that could have gone in untouched. It shouldn't: at full frame his head sits
   13%–46% down the tile, where the rest of this grid runs about 6%–42%, which
   reads as him being further from the camera than everyone beside him. Trimming
   the empty wall off the top lifts him into line. */
await roster("tibi-john.png", "tibi", { top: 0.05, bottom: 1.0, cx: 0.52 }, "roster"); // head 13%, chin 46%

/* ---- Dr. Thomas Alexander, founder feature ------------------------------
   3376x6000. Massar tops out at ~7%, chin ~27%, hands ~85%. Full width;
   2%–72.33% puts a little air above the massar and ends just above the hands.
   --------------------------------------------------------------------- */
await cut(
  `${SRC}/thomas-alexander.jpg`,
  "public/images/team/founder.jpg",
  { top: 0.02, bottom: 0.72333 },
  1400,
  1750,
  "founder"
);

/* ---- Mahmood Al Ghafri --------------------------------------------------
   3376x5500. Massar ~7%, chin ~31%, crossed arms ~55%. Kept as an explicit
   box rather than routed through roster(): the horizontal centre was tuned
   between his head (~57%) and the body's own centre so the frame sits on him
   without clipping a shoulder.
   --------------------------------------------------------------------- */
await cut(
  `${SRC}/mahmood-al-ghafri.jpg`,
  "public/images/team/roster/mahmood.jpg",
  { top: 0.04, bottom: 0.62, left: 0.1464, right: 0.9336 },
  500,
  600,
  "roster"
);

/* ---- the 1986 milestone in the history wheel ----------------------------
   Until now this plate borrowed the founder's team portrait, so one picture
   carried both "this is our chairman today" and "this is where 1986 began".
   This is a warm, archival-toned editorial portrait of him seated — it reads
   as the beginning of the story rather than as a staff photograph, and the
   two uses are now separate files that can move independently.

   1600x1066 (1.50) cut to the plate's own 5:4: full height, centred, which
   keeps him left-of-frame with the office falling away behind.
   --------------------------------------------------------------------- */
{
  const src = `${SRC}/ced-history.jpeg`;
  const m = await sharp(src).metadata();
  const cw = Math.round(m.height * 1.25);
  const left = Math.round((m.width - cw) / 2);
  await cut(
    src,
    "public/images/timeline/m-1986-founder.jpg",
    { left: left / m.width, right: (left + cw) / m.width },
    1400,
    1120,
    "history"
  );
}

/* ---- the HSE page hero --------------------------------------------------
   Fifth cut, and the first one with the company's own leadership in it. The
   page's whole thesis is "safety is led in person, not delegated", and this
   is the CED on a site safety walk in full PPE, watching a machine being
   demonstrated — the claim and its evidence in one frame.

   1600x899 upscaled 1.2x to the hero's 1920x780 band. The crop keeps every
   head in the group: 35% of the vertical overflow comes off the top, which
   leaves the roof structure above them and trims floor from the bottom. Its
   left third is an out-of-focus back rather than a face, which is where the
   heading and lead paragraph sit.
   --------------------------------------------------------------------- */
{
  const src = `${SRC}/ced-hse-walk.jpeg`;
  const HW = 1920, HH = 780;
  const m = await sharp(src).metadata();
  const sc = Math.max(HW / m.width, HH / m.height);
  const sw = Math.round(m.width * sc), sh = Math.round(m.height * sc);
  await sharp(src)
    .resize(sw, sh, { kernel: "lanczos3" })
    .extract({
      left: Math.round((sw - HW) / 2),
      top: Math.max(0, Math.min(sh - HH, Math.round((sh - HH) * 0.35))),
      width: HW,
      height: HH,
    })
    // a 1.2x upscale; light unsharp keeps the hi-vis edges crisp
    .sharpen({ sigma: 0.8, m1: 0.4, m2: 1.6 })
    .jpeg({ quality: 86, mozjpeg: true })
    .toFile("public/images/hse/hse-hero-ced-walk.jpg");
  console.log(`hse-hero  ${m.width}x${m.height} -> public/images/hse/hse-hero-ced-walk.jpg  (${HW}x${HH})`);
}
