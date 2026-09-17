/**
 * Team portraits, from studio originals supplied by the client.
 *
 * The originals are very tall (0.56–0.61) full-length studio frames, and the
 * two places they land want quite different shapes, so every crop here is read
 * off the picture rather than left to `object-cover`:
 *
 *   founder — aspect-[4/5] in the founder feature (Team.tsx), AND aspect-[5/4]
 *             in the 1986 milestone of the history wheel. The wheel's landscape
 *             frame shows the top ~64% of whatever this file is, so the crop is
 *             framed to survive being cut there: head near the top with a
 *             little air, and 64% down still lands on the chest rather than on
 *             a face sliced at the jaw.
 *   roster  — aspect-[5/6] head-and-shoulders at 500x600, matching the rest of
 *             the grid. That is a much tighter box than the source, so this one
 *             crops on both axes.
 *
 * Fractions are of the ORIGINAL frame; re-measure with a percentage grid if a
 * source is ever replaced, rather than nudging these numbers blind.
 *
 * Sources live in scripts/.src-portraits/ (gitignored, like the other prep
 * staging folders) — the originals are 5–8 MB each and have no business in
 * public/, which ships verbatim to the static export.
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
 * `box` is {top, bottom, left, right} as 0–1 fractions; omitted edges are the
 * frame's own.
 */
async function cut(src, out, box, w, h) {
  const m = await sharp(src).metadata();
  const left = Math.round((box.left ?? 0) * m.width);
  const right = Math.round((box.right ?? 1) * m.width);
  const top = Math.round((box.top ?? 0) * m.height);
  const bottom = Math.round((box.bottom ?? 1) * m.height);
  const cw = right - left;
  const ch = bottom - top;
  const got = (cw / ch).toFixed(3);
  const want = (w / h).toFixed(3);
  if (Math.abs(cw / ch - w / h) > 0.01) {
    throw new Error(`${out}: crop is ${got}, output is ${want} — the crop box and the output shape disagree, so the picture would be squashed`);
  }
  await sharp(src)
    .extract({ left, top, width: cw, height: ch })
    .resize(w, h, { kernel: "lanczos3" })
    .jpeg({ quality: 88, mozjpeg: true })
    .toFile(out);
  console.log(`${m.width}x${m.height} -> ${out}  (${w}x${h}, crop ${got})`);
}

/* Dr. Thomas Alexander — 3376x6000. Massar tops out at ~7%, chin ~27%,
   hands ~85%. Full width; 2%–72.33% puts a little air above the massar and
   ends just above the hands. The wheel's top-64% cut of that lands at ~47%
   of the original — mid-chest. */
await cut(
  `${SRC}/thomas-alexander.jpg`,
  "public/images/team/founder.jpg",
  { top: 0.02, bottom: 0.72333 },
  1400,
  1750
);

/* Mahmood Al Ghafri — 3376x5500. Massar ~7%, chin ~31%, crossed arms ~55%.
   The roster is head-and-shoulders, so this crops both axes: 4%–62% tall,
   and horizontally centred at 54% (between his head at ~57% and the body's
   own centre) so the frame sits on him without clipping a shoulder. */
await cut(
  `${SRC}/mahmood-al-ghafri.jpg`,
  "public/images/team/roster/mahmood.jpg",
  { top: 0.04, bottom: 0.62, left: 0.1464, right: 0.9336 },
  500,
  600
);
