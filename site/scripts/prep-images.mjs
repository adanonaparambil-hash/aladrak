// One-shot: resize archive masters into web-ready JPGs (1600px wide, q80)
import sharp from "sharp";
import { mkdirSync, existsSync } from "fs";
import path from "path";

const ROOT = "E:/ITS48/Development/Adraklive/Images";
const P = (part, rest) =>
  path.join(
    ROOT,
    `Adrak Corporate Images Folder-20260818T042650Z-1-${part}`,
    "Adrak Corporate Images Folder",
    rest
  );

const jobs = [
  ["public-prosecution", P("008", "Project pics- updated/PPM/0D1A6348.JPG")],
  ["ahli-bank", P("021", "Project pics- updated/EAB- Ahli Bank (NEW )/EAB Photos/DSC03806.jpg")],
  ["central-bank", P("002", "Project pics- updated/15 - CBO.jpg")],
  ["hai-al-naseem", P("002", "Project pics- updated/41 - Hai Al Naseem.JPG")],
  ["cheltenham", P("015", "Project pics- updated/CIS/CIS 2/JBS_4508.JPG")],
  ["mohe", P("002", "Project pics- updated/24 - mohe.jpg")],
  ["paci", P("002", "Project pics- updated/11 - PACI.jpg")],
  ["mazoon-dairy", P("002", "Project pics- updated/31 - MDP1.jpg")],
  ["aloft", P("014", "Project pics- updated/Aloft Hotel Muscat/BSK-5867.jpg")],
  ["buraimi-university", P("002", "Project pics- updated/10 - buraimi univerty.jpg")],
  ["kom4", P("002", "Project pics- updated/16 - KOM 4.jpg")],
  ["forensic-lab", P("002", "Project pics- updated/30 - forensic lab.jpg")],
];

const outDir = "public/images/projects";
mkdirSync(outDir, { recursive: true });

let fail = 0;
for (const [slug, src] of jobs) {
  if (!existsSync(src)) {
    console.error(`MISSING: ${slug} <- ${src}`);
    fail++;
    continue;
  }
  const out = path.join(outDir, `${slug}.jpg`);
  await sharp(src)
    .rotate() // respect EXIF orientation
    .resize({ width: 1600, withoutEnlargement: true })
    .jpeg({ quality: 80, mozjpeg: true })
    .toFile(out);
  console.log(`ok: ${slug}`);
}

// head office backdrop
const ho = P("002", "office pics/Head Office- Drone shoot.jpg");
if (existsSync(ho)) {
  await sharp(ho)
    .rotate()
    .resize({ width: 2000, withoutEnlargement: true })
    .jpeg({ quality: 76, mozjpeg: true })
    .toFile("public/images/head-office.jpg");
  console.log("ok: head-office");
} else {
  console.error("MISSING: head-office");
  fail++;
}

process.exit(fail ? 1 : 0);
