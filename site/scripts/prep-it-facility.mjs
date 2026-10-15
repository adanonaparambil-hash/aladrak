/**
 * The IT & Data Centre card in the facilities grid.
 *
 * The only picture the client has is a crop from their printed brochure:
 * 512x584, portrait, with the brochure's own caption box (white-on-grey,
 * "IT & Data Centers — Tier IV Data Centre with 180 fully loaded cabinets...")
 * sitting over the lower right of the frame, from about y=418 down.
 *
 * The cards are 4:3 landscape, so the tile is a 512x384 band taken from the TOP
 * of the picture — above the caption box, so none of its text survives into the
 * card (the card prints its own, and two captions would fight). That band keeps
 * the whole point of the shot: both rows of cabinets and the raised-floor aisle
 * running away to the end wall.
 *
 * The source is small. Lanczos-resampled to 1024x768 it is soft rather than
 * sharp, but it holds at the card's on-screen size; a larger original would
 * replace this, not need a different crop (top 0, 4:3, full width).
 *
 * Source lives in scripts/.src-facilities/ (gitignored). Run from site/:
 *   node scripts/prep-it-facility.mjs
 */
import sharp from "sharp";
import { existsSync } from "node:fs";

const SRC = "scripts/.src-facilities/it-data-centre.png";
if (!existsSync(SRC)) {
  console.error(`missing ${SRC} — see the header`);
  process.exit(1);
}

const TOP = 24;      // a little ceiling is fine; the caption box starts near 418
const W = 512;
const H = 384;       // 4:3

if (TOP + H > 410) throw new Error("the crop would reach the brochure caption box");

await sharp(SRC)
  .extract({ left: 0, top: TOP, width: W, height: H })
  .resize(1024, 768, { kernel: "lanczos3" })
  .jpeg({ quality: 86, mozjpeg: true })
  .toFile("public/images/facilities/it-data-centre.jpg");
console.log("wrote public/images/facilities/it-data-centre.jpg (1024x768)");

/**
 * The second photograph: the head-office data centre cabinets.
 *
 * 270x259 — smaller still than the aisle shot, and with the brochure's
 * "Head office Data Center" caption printed across its bottom-left (text spans
 * about y=245-255) plus a thin white page edge down the left side. Both are
 * cropped away; the cabinets' feet end around y=243, so the cut sits right at
 * them.
 *
 * Doubled with Lanczos — about as far as a source this size will stretch
 * before it turns to mush — and left near-square on purpose. The facility
 * viewer's frame is a wide band that crops with object-cover, which would turn
 * this into a thin strip magnified five times; the gallery entry carries
 * fit: "contain" so the viewer shows it whole instead. See FacilityMedia.tsx.
 */
const HO = "scripts/.src-facilities/head-office-data-centre.png";
if (existsSync(HO)) {
  const L = 4, T = 0, CW = 262, CH = 243;   // clear of the caption (starts y=245)
  if (T + CH > 244) throw new Error("the crop would reach the brochure caption");
  await sharp(HO)
    .extract({ left: L, top: T, width: CW, height: CH })
    .resize(CW * 2, CH * 2, { kernel: "lanczos3" })
    .jpeg({ quality: 88, mozjpeg: true })
    .toFile("public/images/facilities/gallery/it-and-data-centre-1.jpg");
  console.log("wrote public/images/facilities/gallery/it-and-data-centre-1.jpg (524x486)");
}
