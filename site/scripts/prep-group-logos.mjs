// Group company logos → uniform white tiles (contain-fit, 480x240)
import sharp from "sharp";
import { mkdirSync, existsSync } from "fs";
import path from "path";

const ROOT = "E:/ITS48/Development/Adraklive/Images";
const L = (part, file) =>
  path.join(
    ROOT,
    `Adrak Corporate Images Folder-20260818T042650Z-1-${part}`,
    "Adrak Corporate Images Folder/LOGOS",
    file
  );

const jobs = [
  ["adlife", L("001", "Adlife Logo- e.jpg")],
  ["insight", L("001", "Insight_Logo_.jpg")],
  ["hotels", L("001", "5 Adrak-Hotels-&-Resorts-.png")],
  ["maskaan", L("001", "Al Maskaan Village.png")],
  ["adante", L("001", "Adante Logo Double Stack ENG (1).png")],
  ["hai-al-naseem", L("001", "Hai Al Naseem  Logo png.png")],
  ["builders", L("001", "Adrak-Builders-Logo.png")],
  ["developers", L("001", "1 Adrak Developers LLC.jpg")],
  ["facilities", L("001", "Adrak Facilities.jpg")],
  ["india", L("001", "2Adrak India.jpg")],
  ["ventures", L("002", "Adrak Ventrues Logo.jpg")],
  ["khaith", L("001", "Al-Khaith-Industries-&-Services-SPC---Logo.jpg")],
];

mkdirSync("public/images/group", { recursive: true });

for (const [slug, src] of jobs) {
  if (!existsSync(src)) {
    console.error("MISSING:", slug, src);
    continue;
  }
  await sharp(src)
    .trim({ threshold: 12 })
    .resize({ width: 480, height: 240, fit: "contain", background: "#ffffff" })
    .flatten({ background: "#ffffff" })
    .jpeg({ quality: 85, mozjpeg: true })
    .toFile(`public/images/group/${slug}.jpg`);
  console.log("ok:", slug);
}
