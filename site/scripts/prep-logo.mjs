// Cut the white background out of the JPG logo and produce:
//   public/images/logo.png        — original colors, transparent
//   public/images/logo-light.png  — green recolored to cream (for dark header)
import sharp from "sharp";

const SRC =
  "E:/ITS48/Development/Adraklive/Images/Adrak Corporate Images Folder-20260818T042650Z-1-001/Adrak Corporate Images Folder/LOGOS/Al Adrak Logo.jpg";

const CREAM = [245, 242, 234];

const { data, info } = await sharp(SRC)
  .trim()
  .ensureAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true });

const out = Buffer.from(data);
const light = Buffer.from(data);

for (let i = 0; i < data.length; i += 4) {
  const r = data[i], g = data[i + 1], b = data[i + 2];
  // distance from white → alpha
  const d = Math.sqrt(((255 - r) ** 2 + (255 - g) ** 2 + (255 - b) ** 2) / 3);
  const a = Math.max(0, Math.min(255, Math.round(d * 2.5)));
  // un-blend the white that was mixed into anti-aliased edges
  const un = (c) =>
    a === 0 ? 0 : Math.max(0, Math.min(255, Math.round((c - (1 - a / 255) * 255) / (a / 255))));
  const ur = un(r), ug = un(g), ub = un(b);

  out[i] = ur; out[i + 1] = ug; out[i + 2] = ub; out[i + 3] = a;

  // light variant: greens → cream, gold stays
  const isGreen = a > 0 && ub < ug && ur < ug * 1.05;
  light[i] = isGreen ? CREAM[0] : ur;
  light[i + 1] = isGreen ? CREAM[1] : ug;
  light[i + 2] = isGreen ? CREAM[2] : ub;
  light[i + 3] = a;
}

const save = (buf, file) =>
  sharp(buf, { raw: { width: info.width, height: info.height, channels: 4 } })
    .resize({ height: 140, withoutEnlargement: true })
    .png()
    .toFile(file);

await save(out, "public/images/logo.png");
await save(light, "public/images/logo-light.png");
console.log("done", info.width, "x", info.height);
