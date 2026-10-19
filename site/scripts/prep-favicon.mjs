/**
 * The site's icons, from the logo: app/favicon.ico (16/32/48), app/icon.png (512) and app/apple-icon.png (180).
 * Next picks all three up by file name. Before this the tab showed the framework's own default icon.
 *
 * The logo is 4:1-ish wide, which at 16px is a smear, so it sits on a square white tile with a little room
 * round it — the tile keeps it legible on a dark browser theme as well as a light one.
 *   node scripts/prep-favicon.mjs
 */
import sharp from "sharp";
import { writeFileSync } from "node:fs";

const LOGO = "public/images/logo.png";

async function tile(size, { radius = 0.18, fill = 0.9 } = {}) {
  const inner = Math.round(size * fill);
  const logo = await sharp(LOGO).resize({ width: inner, height: inner, fit: "inside" }).toBuffer();
  const mask = Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}"><rect width="${size}" height="${size}" rx="${size * radius}" fill="#fff"/></svg>`,
  );
  return sharp({ create: { width: size, height: size, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } })
    .composite([{ input: mask }, { input: logo, gravity: "centre" }])
    .png()
    .toBuffer();
}

/* an .ico is a small header plus PNG images, which every current browser reads */
function ico(images) {
  const head = Buffer.alloc(6);
  head.writeUInt16LE(1, 2);
  head.writeUInt16LE(images.length, 4);
  let offset = 6 + images.length * 16;
  const dirs = images.map(({ size, png }) => {
    const d = Buffer.alloc(16);
    d.writeUInt8(size >= 256 ? 0 : size, 0);
    d.writeUInt8(size >= 256 ? 0 : size, 1);
    d.writeUInt16LE(1, 4);
    d.writeUInt16LE(32, 6);
    d.writeUInt32LE(png.length, 8);
    d.writeUInt32LE(offset, 12);
    offset += png.length;
    return d;
  });
  return Buffer.concat([head, ...dirs, ...images.map((i) => i.png)]);
}

const sizes = [16, 32, 48];
const pngs = [];
for (const size of sizes) pngs.push({ size, png: await tile(size, { fill: size < 32 ? 0.96 : 0.9 }) });
writeFileSync("app/favicon.ico", ico(pngs));
writeFileSync("app/icon.png", await tile(512));
writeFileSync("app/apple-icon.png", await tile(180, { radius: 0, fill: 0.84 }));   // iOS rounds its own corners
console.log("wrote app/favicon.ico, app/icon.png, app/apple-icon.png");
