/**
 * Logo tiles for the Adrak Group wall, and the property cards behind the
 * Adrak Hotels chooser.
 *
 * The wall's tiles are all 480x240 with the wordmark filling the frame, so a
 * source has to be trimmed to its own bounding box first — the supplied PDFs
 * and the site logos each sit inside a page or canvas of dead space, and
 * dropping them in untrimmed leaves the mark as a stamp in the middle of an
 * otherwise empty tile, half the size of its neighbours.
 *
 * Sources:
 *   AIMS + Trufud  — the corporate LOGOS folder, vector PDFs. Rendered through
 *                    SVG rather than LibreOffice's PNG export, which ignores
 *                    the PixelWidth filter option and hands back 500x500.
 *   Mountain Mist  — mountainmist.in/assets/images/adrak-logo.png
 *   Trinity        — thetrinitycollege.in 2x header logo
 *   Summer Sand    — the property photographs from each resort's own site.
 *
 * Run from site/:  node scripts/prep-group.mjs
 * Needs the raw sources in scripts/.src-group/ — see SOURCES below.
 */
import sharp from "sharp";
import { mkdirSync, existsSync } from "node:fs";

const SRC = "scripts/.src-group";
if (!existsSync(SRC)) {
  console.error(`missing ${SRC}/ — see the header for what belongs in it`);
  process.exit(1);
}
mkdirSync("public/images/group", { recursive: true });
mkdirSync("public/images/hotels", { recursive: true });

const TILE_W = 480, TILE_H = 240, PAD = 0.09;

/**
 * Trim a logo to its own ink, then centre it in the wall's 480x240 on white.
 * `density` only applies to SVG sources.
 */
async function tile(src, out, { density = 300 } = {}) {
  const flat = await sharp(src, { density })
    .flatten({ background: "#ffffff" })
    .toBuffer();
  const trimmed = await sharp(flat).trim({ threshold: 6 }).toBuffer();
  const mark = await sharp(trimmed)
    .resize({
      width: Math.round(TILE_W * (1 - PAD * 2)),
      height: Math.round(TILE_H * (1 - PAD * 2)),
      fit: "inside",
      kernel: "lanczos3",
    })
    .toBuffer();
  await sharp({ create: { width: TILE_W, height: TILE_H, channels: 3, background: "#ffffff" } })
    .composite([{ input: mark, gravity: "centre" }])
    .jpeg({ quality: 92, mozjpeg: true })
    .toFile(`public/images/group/${out}`);
  const m = await sharp(trimmed).metadata();
  console.log(`tile   ${String(m.width).padStart(4)}x${String(m.height).padEnd(4)} -> group/${out}`);
}

/** Property photograph for a chooser card — 3:2, generous enough for retina. */
async function shot(src, out) {
  const m = await sharp(src).metadata();
  await sharp(src)
    .resize(1080, 720, { fit: "cover", position: "attention", kernel: "lanczos3" })
    .jpeg({ quality: 84, mozjpeg: true })
    .toFile(`public/images/hotels/${out}`);
  console.log(`shot   ${m.width}x${m.height} -> hotels/${out}`);
}

await tile(`${SRC}/aims.svg`, "aims.jpg");
// Trufud goes through LibreOffice's PNG export, not its SVG one: the SVG comes
// back with the artwork knocked out of a filled green page, so the trim finds a
// green rectangle and the wordmark lands white-on-green — the negative of the
// supplied logo. The PNG export gets the colours right.
await tile(`${SRC}/trufud.png`, "trufud.jpg");
// the leaf mark is the Adrak Hotels identity on both property sites
await tile(`${SRC}/mountain-mist-logo.png`, "hotels-india.jpg");
// Trinity College of Engineering — from thetrinitycollege.in. Their 2x header
// asset (328x80) is the largest they publish, so it upscales ~1.3x into the
// tile; softer than the vector logos beside it, but it is their own artwork
// and the archive LOGOS folder has nothing for Trinity at all.
await tile(`${SRC}/trinity.png`, "trinity.jpg");

await shot(`${SRC}/mountain-mist.jpg`, "mountain-mist.jpg");
await shot(`${SRC}/summer-sand.jpg`, "summer-sand.jpg");
