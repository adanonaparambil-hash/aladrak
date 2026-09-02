/**
 * Assets for the HSE page, from the corporate HSE folder
 * (Images/HSE at the repository root — an email dump of policies, IAS/FAHSS
 * certificates, the 2026 objectives document and the Wellness Tracking photo
 * set).
 *
 *  - Certificate thumbnails: the three IAS certificate PDFs, rendered through
 *    LibreOffice's SVG export (its PNG export ignores resolution options) and
 *    rasterized here. The SVGs are staged in scripts/.src-hse/.
 *  - Wellness photographs: four picks from the 26-shot warm-up set — chosen
 *    for variety of setting (mountain site, dawn camp muster, palm-lined
 *    site, interior fit-out) so the strip reads as "every site, every
 *    morning" rather than four frames of the same parade.
 *  - Documents: the policies, rules poster, objectives and certificates are
 *    copied verbatim into public/docs/hse for download links.
 *
 * Run from site/:  node scripts/prep-hse.mjs
 */
import sharp from "sharp";
import { mkdirSync, copyFileSync } from "node:fs";

const HSE = "../Images/HSE/fwdaladrakhsewellbeignpageforwebsite_";
const WELL = "../Images/HSE/fwdcontentrequestforjanuary2026editioncsrcommun";
const SRC = "scripts/.src-hse";
mkdirSync("public/images/hse", { recursive: true });
mkdirSync("public/docs/hse", { recursive: true });

/* certificates — A4 portrait, rasterized wide enough to stay legible */
for (const [svg, out] of [
  ["IAS 9001 - Main.svg", "cert-ias-9001.jpg"],
  ["IAS 14001 - Main.svg", "cert-ias-14001.jpg"],
  ["IAS 45001 - Main.svg", "cert-ias-45001.jpg"],
]) {
  const buf = await sharp(`${SRC}/${svg}`, { density: 130 }).flatten({ background: "#ffffff" }).toBuffer();
  const m = await sharp(buf).metadata();
  await sharp(buf)
    .resize({ width: 900, kernel: "lanczos3" })
    .jpeg({ quality: 86, mozjpeg: true })
    .toFile(`public/images/hse/${out}`);
  console.log(`cert   ${m.width}x${m.height} -> hse/${out}`);
}

/* wellness strip */
const PICKS = [
  ["Warm Up (1).jpeg", "wellness-mountain.jpg"],
  ["Warm Up (19).jpeg", "wellness-dawn.jpg"],
  ["Warm Up (2).jpg", "wellness-palms.jpg"],
  ["Warm Up (12).jpeg", "wellness-interior.jpg"],
];
for (const [src, out] of PICKS) {
  const m = await sharp(`${WELL}/${src}`).metadata();
  await sharp(`${WELL}/${src}`)
    .rotate() // honour the phone camera's EXIF orientation
    .resize(1200, 800, { fit: "cover", position: "attention", kernel: "lanczos3" })
    .jpeg({ quality: 82, mozjpeg: true })
    .toFile(`public/images/hse/${out}`);
  console.log(`photo  ${m.width}x${m.height} -> hse/${out}`);
}

/* documents, verbatim */
for (const [src, out] of [
  [`${HSE}/HSE POLICY.pdf`, "al-adrak-hse-policy.pdf"],
  [`${HSE}/2024-DRUG & ALCOHOL POLICY-UPDATED.pdf`, "drug-and-alcohol-policy.pdf"],
  [`${HSE}/Road Safety Policy.pdf`, "road-safety-policy.pdf"],
  [`${HSE}/SMOKE FREE POLICY-UPDATED.pdf`, "smoke-free-policy.pdf"],
  [`${HSE}/AL-ADRAK 9 LIFE SAVING RULES.pdf`, "9-life-saving-rules.pdf"],
  [`${HSE}/HSE Objectives,Target & KPI.pdf`, "hse-objectives-targets-kpi-2026.pdf"],
  [`${HSE}/IAS 9001 - Main.pdf`, "certificate-iso-9001.pdf"],
  [`${HSE}/IAS 14001 - Main.pdf`, "certificate-iso-14001.pdf"],
  [`${HSE}/IAS 45001 - Main.pdf`, "certificate-iso-45001.pdf"],
]) {
  copyFileSync(src, `public/docs/hse/${out}`);
  console.log(`doc    ${out}`);
}
