// Batch 2: extended portfolio + team + head office imagery
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

const projectJobs = [
  ["oetc", P("002", "Project pics- updated/14 - OETC.jpg")],
  ["bait-al-reem", P("002", "Project pics- updated/17 - Bait al reem.jpg")],
  ["haya", P("002", "Project pics- updated/20 - Haya.jpg")],
  ["fb-kom", P("002", "Project pics- updated/9 - FB KOM.jpg")],
  ["cba", P("002", "Project pics- updated/1- CBA.JPG")],
  ["waljat", P("002", "Project pics- updated/36 - Waljat college.jpg")],
  ["mazoon-college", P("002", "Project pics- updated/Mazoon College.jpg")],
  ["lamer", P("002", "Project pics- updated/38 - Lamer1.jpg")],
  ["jbz", P("002", "Project pics- updated/29 - JBZ.jpg")],
  ["mtc", P("002", "Project pics- updated/12 MTC (2).jpg")],
  ["wet-lab", P("002", "Project pics- updated/25 - Wet Lab.jpg")],
  ["mdp-cpp", P("002", "Project pics- updated/32 - MDP CPP.jpg")],
  ["barzaman", P("002", "Project pics- updated/5 - Barzaman.JPG")],
  ["abaad", P("002", "Project pics- updated/Abaad (1).JPG")],
  ["villa-seeb", P("002", "Project pics- updated/34 - hi end villa.jpg")],
  ["al-maskaan", P("020", "Project pics- updated/CLA- AL MASKAAN VILLAGE/Al Maskaan Photos/Drone Pics/DJI_02021.jpg")],
  ["tis", P("008", "Project pics- updated/TIS Project/TIS photos/BSK-1229.jpg")],
  ["rop", P("002", "Project pics- updated/ROP.jpg")],
];

const teamJobs = [
  ["founder", P("003", "Al Adrak Brochure Picturres/2 Alex sir.jpg")],
  ["sheikh", P("003", "Al Adrak Brochure Picturres/6 sheikh amri.jpg")],
  ["directors", P("004", "Al Adrak Brochure Picturres/11 Directors.jpg")],
];

const officeJobs = [
  ["head-office-2", P("002", "office pics/X37C5111.jpg")],
  ["head-office-3", P("002", "office pics/14 Head office.jpg")],
];

mkdirSync("public/images/projects", { recursive: true });
mkdirSync("public/images/team", { recursive: true });
mkdirSync("../preview-thumbs", { recursive: true });

let fail = 0;
async function run(jobs, dir, width, q) {
  for (const [slug, src] of jobs) {
    if (!existsSync(src)) {
      console.error(`MISSING: ${slug} <- ${src}`);
      fail++;
      continue;
    }
    await sharp(src)
      .rotate()
      .resize({ width, withoutEnlargement: true })
      .jpeg({ quality: q, mozjpeg: true })
      .toFile(path.join(dir, `${slug}.jpg`));
    // small preview for visual check
    await sharp(src)
      .rotate()
      .resize({ width: 480, withoutEnlargement: true })
      .jpeg({ quality: 70 })
      .toFile(path.join("../preview-thumbs", `${slug}.jpg`));
    console.log("ok:", slug);
  }
}

await run(projectJobs, "public/images/projects", 1600, 80);
await run(teamJobs, "public/images/team", 1200, 82);
await run(officeJobs, "public/images", 1800, 78);
process.exit(fail ? 1 : 0);
