import sharp from "sharp";
import fs from "fs";

const SP =
  "C:/Users/ITS48/AppData/Local/Temp/claude/E--ITS48-Development-Adraklive/432726eb-ce0b-4e09-a9db-09477f691682/scratchpad/certs-dl";
fs.mkdirSync("public/images/awards", { recursive: true });

// certificates — keep full A4 scans
const certs = [
  ["thumb-271022010148ISO-9001-Al-Adrak-page-0001.jpg", "cert-iso-9001"],
  ["thumb-271022010208ISO-14001-Al-Adrak-page-0001.jpg", "cert-iso-14001"],
  ["thumb-271022010117ISO-45001-Al-Adrak-page-0001.jpg", "cert-iso-45001"],
];
for (const [f, slug] of certs) {
  await sharp(`${SP}/${f}`).jpeg({ quality: 88, mozjpeg: true }).toFile(`public/images/awards/${slug}.jpg`);
  console.log("ok", slug);
}

// award logos — white tiles
const tiles = [
  ["big-141020120658frb.jpg", "award-forbes"],
  ["big-141020120825erp.jpg", "award-eba"],
  ["big-141020120900t100.jpg", "award-top100"],
  ["big-141020120946gm.jpg", "award-graymatter"],
  ["big-141020121108esqw.jpg", "award-esqr"],
];
for (const [f, slug] of tiles) {
  await sharp(`${SP}/${f}`)
    .trim({ threshold: 10 })
    .resize({ width: 480, height: 260, fit: "contain", background: "#ffffff" })
    .flatten({ background: "#ffffff" })
    .jpeg({ quality: 85, mozjpeg: true })
    .toFile(`public/images/awards/${slug}.jpg`);
  console.log("ok", slug);
}

// golden achievement — photo tile
await sharp(`${SP}/big-010321065954Golden-Achievement-Award-Dubai-2020.jpg`)
  .jpeg({ quality: 82, mozjpeg: true })
  .toFile("public/images/awards/award-golden.jpg");
console.log("ok award-golden");
