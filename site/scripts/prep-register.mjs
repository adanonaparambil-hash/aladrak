/**
 * Card art for the current-portfolio register.
 *
 * The register cards sit directly under the wider-portfolio masonry grid and
 * borrow its look — a 4:3 photo card with the text over a gradient — so every
 * card needs an image at that shape. Seven projects have a real picture
 * (Yenaier's is the masterplan
 * render the user placed at public/images/Yenierproject.png); the other nine get a
 * typographic plate: the project number set large on the section's own forest
 * green, so a card with no photograph yet still reads as deliberate rather
 * than broken. Swap a plate for a photograph here when one arrives.
 *
 * Run from site/:  node scripts/prep-register.mjs
 */
import sharp from "sharp";
import { mkdirSync } from "node:fs";

const W = 1200, H = 900;
const FOREST = "#10271a";
const GOLD = "#c99b45";
const CREAM = "#f5f2ea";
mkdirSync("public/images/register", { recursive: true });

const PHOTOS = [
  ["rrk", "public/images/projects/kom-ring-road.jpg"],
  ["ppm", "public/images/projects/public-prosecution.jpg"],
  ["tis", "public/images/projects/tis.jpg"],
  ["cla", "public/images/blog/community-facility-and-labour-accommodation-at-k.jpg"],
  ["dbk", "public/images/blog/bandar-al-khairan-resort-project-launched.jpg"],
  ["zrb", "public/images/blog/zen-residences-at-muscat-bay.jpg"],
  ["yrs", "public/images/Yenierproject.png"],
];

for (const [code, src] of PHOTOS) {
  const m = await sharp(src).metadata();
  // the news heads are 525px wide and upscale ~2.3x; a light unsharp keeps
  // them from going to mush at card size
  const soft = m.width < W;
  let p = sharp(src).resize(W, H, { fit: "cover", position: "attention", kernel: "lanczos3" });
  if (soft) p = p.sharpen({ sigma: 1.0, m1: 0.5, m2: 2.0 });
  await p.jpeg({ quality: 85, mozjpeg: true }).toFile(`public/images/register/${code}.jpg`);
  console.log(`photo  ${String(m.width).padStart(4)}x${String(m.height).padEnd(4)} -> register/${code}.jpg`);
}

/* The plate: project number as the artwork. The card overlays its name and
   description across the lower half, so the code sits in the upper portion,
   over a faint hairline weave and a soft glow — enough texture that sixteen
   cards in a grid don't read as nine identical green rectangles.

   The register now shares the masonry grid, whose every-7th card is a tall
   3/4.5 crop — object-cover keeps only the middle half of a 4:3 plate's
   width, so the code is sized to survive that: at 92px/6 tracking the widest
   code spans ~44% of the plate and stays whole in both crops. */
const PLATES = ["P.400 CSD", "P.402 IGA", "P.407 CRV", "P.408 KVF", "P.409 AMD", "P.411 VTA", "P.413 EWN", "P.414 WRO"];

for (const code of PLATES) {
  const short = code.split(" ")[1].toLowerCase();
  const svg = `<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <pattern id="weave" width="26" height="26" patternUnits="userSpaceOnUse" patternTransform="rotate(135)">
      <rect width="26" height="26" fill="${FOREST}"/>
      <rect width="1" height="26" fill="${GOLD}" opacity="0.13"/>
    </pattern>
    <radialGradient id="glow" cx="0.5" cy="0.32" r="0.75">
      <stop offset="0" stop-color="#1c3d2a"/>
      <stop offset="1" stop-color="${FOREST}"/>
    </radialGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#glow)"/>
  <rect width="${W}" height="${H}" fill="url(#weave)"/>
  <text x="50%" y="34%" text-anchor="middle" font-family="Georgia, 'Times New Roman', serif"
        font-size="92" letter-spacing="6" fill="${GOLD}" opacity="0.95">${code}</text>
  <text x="50%" y="45%" text-anchor="middle" font-family="Arial, sans-serif"
        font-size="24" letter-spacing="10" fill="${CREAM}" opacity="0.45">IN DELIVERY</text>
</svg>`;
  await sharp(Buffer.from(svg)).jpeg({ quality: 88, mozjpeg: true }).toFile(`public/images/register/plate-${short}.jpg`);
  console.log(`plate  ${code} -> register/plate-${short}.jpg`);
}

/**
 * Muscat Pavilion — a real render, but a 2.4:1 strip off a scanned award
 * notice, so it is set as a band on the plate's own ground rather than
 * cover-cropped to 4:3 (which would keep only the middle 55% of the width and
 * cut both wings off the building). The supplier watermark over the sky is
 * cropped away upstream, in scripts/.src-register/muscat-pavilion.png.
 *
 * The card overlays its title and description across the lower third, so the
 * band sits high and the gradient below it stays clear.
 */
{
  const SRC = "scripts/.src-register/muscat-pavilion.png";
  const bandW = W - 96;
  const band = await sharp(SRC)
    .resize({ width: bandW, kernel: "lanczos3" })
    // a 2.5x upscale off a scan; unsharp is what keeps the glazing mullions
    // reading as lines rather than mush
    .sharpen({ sigma: 1.1, m1: 0.5, m2: 2.4 })
    .modulate({ brightness: 1.04 })
    .toBuffer();
  const bm = await sharp(band).metadata();
  const ground = `<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <pattern id="weave" width="26" height="26" patternUnits="userSpaceOnUse" patternTransform="rotate(135)">
      <rect width="26" height="26" fill="${FOREST}"/>
      <rect width="1" height="26" fill="${GOLD}" opacity="0.13"/>
    </pattern>
    <radialGradient id="glow" cx="0.5" cy="0.32" r="0.75">
      <stop offset="0" stop-color="#1c3d2a"/>
      <stop offset="1" stop-color="${FOREST}"/>
    </radialGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#glow)"/>
  <rect width="${W}" height="${H}" fill="url(#weave)"/>
</svg>`;
  await sharp(Buffer.from(ground))
    .composite([{ input: band, left: 48, top: 118 }])
    .jpeg({ quality: 88, mozjpeg: true })
    .toFile("public/images/register/mpm.jpg");
  console.log(`band   ${bm.width}x${bm.height} render -> register/mpm.jpg`);
}
