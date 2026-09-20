/**
 * The Sunday briefing, for the "Life at Adrak" strip on the home page.
 *
 * Two photographs of the same gathering arrived together — a wide shot of the
 * atrium, and a closer frame of the Chief Executive Director at the podium.
 * Only the wide one is used. The close frame was laid over its top-right
 * corner as a card for a while, so that his face could be made out; at every
 * size it read as a small picture stuck onto a large one, and it was dropped.
 * Its source stays staged beside this one in case it is ever wanted again.
 *
 * The wide shot is cut to 16:10 — the tile's own shape — so `object-cover` has
 * nothing left to decide. The source is 16:9, which is wider, so the trim
 * comes off the sides and the full height of the room is kept.
 *
 * The box is a fraction of the ORIGINAL frame. If the source is replaced,
 * re-measure rather than nudging the numbers blind.
 *
 * Sources live in scripts/.src-life/ (gitignored, like the other prep staging
 * folders): they are unreferenced once cropped, and public/ ships verbatim
 * into the static export.
 *
 * Run from site/:  node scripts/prep-life.mjs
 */
import sharp from "sharp";
import { existsSync } from "node:fs";

const SRC = "scripts/.src-life";
if (!existsSync(SRC)) {
  console.error(`missing ${SRC}/ — see the header for what belongs in it`);
  process.exit(1);
}

const OUT = "public/images/life";

/* ---- the wide shot, cut to the tile's own 16:10 --------------------------- */
{
  const src = `${SRC}/sunday-briefing-wide.jpeg`;
  const m = await sharp(src).metadata();
  const cw = Math.round(m.height * 1.6);
  if (cw > m.width) throw new Error(`${src} is taller than 16:10 — trim the height instead`);
  const left = Math.round((m.width - cw) / 2);

  await sharp(src)
    .extract({ left, top: 0, width: cw, height: m.height })
    .resize(1120, 700, { kernel: "lanczos3" })
    .jpeg({ quality: 84, mozjpeg: true })
    .toFile(`${OUT}/life-briefing.jpg`);
  console.log(`wide     ${m.width}x${m.height} -> ${OUT}/life-briefing.jpg  (1120x700)`);
}
