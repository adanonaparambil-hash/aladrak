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

/* ---- the team in the lobby, for the second tile ---------------------------
 *
 * 1289x708, 1.82:1, against a 16:10 tile. Cropping it to fit would be the
 * simple thing and the wrong one: it is a crowd photograph, and any crop wide
 * enough to matter slices people at both edges in half — at the centre cut the
 * man on the far left loses his face down the middle. So the picture is kept
 * WHOLE, set on a 16:10 canvas, and the strip left above and below is filled
 * with a blurred copy of the photograph itself. The room's white wall
 * runs off the top and its dark floor off the bottom, so the extension reads as
 * more room rather than as a frame.
 *
 * Done in the file rather than in the component, so the gallery's plain
 * object-cover tile needs no special case for this one picture.
 */
{
  const src = `${SRC}/team-group.webp`;
  const CW = 1120, CH = 700;
  const m = await sharp(src).metadata();
  const ph = Math.round((CW * m.height) / m.width);          // photo height at full canvas width
  const photo = await sharp(src).resize(CW, ph, { kernel: "lanczos3" }).toBuffer();
  // the photo STRETCHED to the canvas, then blurred past recognition: its top row is
  // the wall and its bottom row is the floor, so both seams meet their own colour.
  // (Cover-scaling it instead, and dimming, left a grey bar above a white wall.)
  const backdrop = await sharp(src).resize(CW, CH, { fit: "fill" }).blur(30).toBuffer();

  await sharp(backdrop)
    .composite([{ input: photo, left: 0, top: Math.round((CH - ph) / 2) }])
    .jpeg({ quality: 86, mozjpeg: true })
    .toFile(`${OUT}/life-team.jpg`);
  console.log(`team     ${m.width}x${m.height} -> ${OUT}/life-team.jpg  (${CW}x${CH}, photo ${CW}x${ph} centred)`);
}
