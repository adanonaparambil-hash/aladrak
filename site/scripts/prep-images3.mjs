// Batch 3: production facility imagery
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
const F = "Production Facilities brochure Photos";

const jobs = [
  ["logistics", P("002", `${F}/Central Logistics/ALADRAK_PLANT-115.jpg`)],
  ["joinery", P("023", `${F}/Carpentry/CWS Profile/13th to 16th Page/Machineries/CNC ROUTER-1.jpg`)],
  ["joinery-b", P("003", `${F}/Carpentry/ALADRAK_PLANT-194.jpg`)],
  ["aluminium", P("002", `${F}/AFW/ALADRAK_PLANT-100.jpg`)],
  ["marble", P("011", `${F}/A ll Pics/set 1/ALADRAK_PLANT-114.jpg`)],
  ["rebar", P("003", `${F}/REBAR/ALADRAK_PLANT-175.jpg`)],
  ["duct", P("002", `${F}/NRMF/ALADRAK_PLANT-130.jpg`)],
  ["metal", P("002", `${F}/NRMG/ALADRAK_PLANT-222.jpg`)],
  ["formwork", P("008", `${F}/A ll Pics/Drone Photos/ALADRAK_DRONE-29.jpg`)],
  ["plant", P("021", `${F}/A ll Pics/set 2/ALADRAK_PLANT-163.jpg`)],
  ["crusher", P("003", `${F}/crusher/ALAD_NAKHAL-58.JPG`)],
];

mkdirSync("public/images/facilities", { recursive: true });
mkdirSync("../preview-thumbs", { recursive: true });

let fail = 0;
for (const [slug, src] of jobs) {
  if (!existsSync(src)) {
    console.error(`MISSING: ${slug} <- ${src}`);
    fail++;
    continue;
  }
  await sharp(src)
    .rotate()
    .resize({ width: 1200, withoutEnlargement: true })
    .jpeg({ quality: 78, mozjpeg: true })
    .toFile(`public/images/facilities/${slug}.jpg`);
  await sharp(src)
    .rotate()
    .resize({ width: 480 })
    .jpeg({ quality: 70 })
    .toFile(`../preview-thumbs/f-${slug}.jpg`);
  console.log("ok:", slug);
}
process.exit(fail ? 1 : 0);
