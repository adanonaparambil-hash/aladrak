/**
 * The Sunday briefing, for the "Life at Adrak" strip on the home page.
 *
 * Two photographs of the same gathering arrived together, and the tile has to
 * carry both: a wide shot of the atrium that shows how many people are in the
 * room, and a closer frame in which the Chief Executive Director is actually
 * recognisable at the podium. Neither works alone — the wide shot reduces him
 * to a few pixels, and the close frame says nothing about the scale of it.
 *
 * So the wide shot becomes the tile and the close frame becomes a card laid
 * over its top-right corner, where the picture is empty building rather than
 * audience. That is why the two crops below are quite different jobs:
 *
 *   wide   — 16:10 to match the tile exactly, so `object-cover` has nothing
 *            left to decide. The source is 16:9, which is wider, so the trim
 *            comes off the sides and the full height of the room is kept.
 *   podium — tight on the speaker. The card renders around 180px across, so a
 *            crop any looser than this loses his face to the screen behind him.
 *
 * Fractions and pixel boxes are of the ORIGINAL frames. If either source is
 * replaced, re-measure rather than nudging these numbers blind.
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

/* ---- the podium, tight enough to read at card size ------------------------ */
{
  const src = `${SRC}/sunday-briefing-podium.jpeg`;
  const m = await sharp(src).metadata();

  /* the speaker's head, measured off a percentage grid of the 1280x720 frame */
  const speaker = { x: 622, y: 296 };

  /* 3:2 rather than 4:3, and he sits in the upper third rather than the middle.
     Both are for the same reason: the wall behind him is a blank projection
     screen, and a squarer box centred on him filled half the card with flat
     grey. Sitting him high trades that grey for the row of heads along the
     bottom, so the card reads as a room. */
  const cw = 280;
  const ch = Math.round((cw * 2) / 3);
  const left = Math.round(speaker.x - cw / 2);
  const top = Math.round(speaker.y - ch * 0.27);
  if (left < 0 || top < 0 || left + cw > m.width || top + ch > m.height) {
    throw new Error(`${src}: the podium box falls outside the frame`);
  }

  /* The card is ~46% of the tile, so ~270px at 1920 and ~350px at 2560. This
     is an upscale of a phone frame either way — there is no more detail in the
     source — but it holds at the size it is actually drawn. */
  await sharp(src)
    .extract({ left, top, width: cw, height: ch })
    .resize(720, 480, { kernel: "lanczos3" })
    .jpeg({ quality: 88, mozjpeg: true })
    .toFile(`${OUT}/life-briefing-podium.jpg`);
  console.log(`podium   ${m.width}x${m.height} -> ${OUT}/life-briefing-podium.jpg  (720x480)`);
}
