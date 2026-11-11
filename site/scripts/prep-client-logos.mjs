/**
 * The client logos for the "Trusted by the nation's finest" bands.
 *
 *   sources:  scripts/.src-clients/*.png   (as supplied; not shipped)
 *   output:   public/images/clients/<name>.png
 *
 * Each logo is trimmed of its empty border (several were a small mark in the middle of a big white
 * canvas, or sat in an off-white box) and shrunk to at most 560x200 — the display box is 250x84, so
 * that is 2x for sharp screens. The cards on the site are white, which is why backgrounds are left
 * alone rather than cut out: a white box on a white card disappears, and a cut-out would risk
 * eating light parts of a real logo.
 *   node scripts/prep-client-logos.mjs
 */
import sharp from "sharp";
import { readdirSync, writeFileSync } from "node:fs";

const SRC = "scripts/.src-clients", OUT = "public/images/clients";
/** a logo that IS a coloured tile: trimming to the first non-matching pixel would cut the tile down to its lettering */
const KEEP_WHOLE = new Set(["mazoon-dairy.png"]);
/** logos saved with a pale off-white box round them (cream, light grey): on the white card that shows as a faint
    rectangle, so near-white is pushed to pure white. Only these two; no other logo has a box to lose. */
const WHITEN = new Set(["central-bank-of-oman.png", "oman-refinery.png"]);
const names = [];
for (const f of readdirSync(SRC).filter((f) => f.endsWith(".png")).sort()) {
  const base = sharp(`${SRC}/${f}`);
  const trimmed = await (KEEP_WHOLE.has(f) ? base : base.trim({ threshold: 14 })).toBuffer({ resolveWithObject: true });
  let data = trimmed.data;
  if (WHITEN.has(f)) {
    const raw = await sharp(data).removeAlpha().raw().toBuffer({ resolveWithObject: true });
    const px = raw.data;
    for (let i = 0; i < px.length; i += raw.info.channels)
      if (Math.min(px[i], px[i + 1], px[i + 2]) >= 226) px[i] = px[i + 1] = px[i + 2] = 255;
    data = await sharp(px, { raw: raw.info }).png().toBuffer();
  }
  await sharp(data)
    .resize({ width: 560, height: 200, fit: "inside", withoutEnlargement: true })
    .png({ compressionLevel: 9 })
    .toFile(`${OUT}/${f}`);
  const m = await sharp(`${OUT}/${f}`).metadata();
  names.push(f);
  console.log(f.padEnd(42), `${trimmed.info.width}x${trimmed.info.height} -> ${m.width}x${m.height}`);
}
console.log(names.length, "logos");
