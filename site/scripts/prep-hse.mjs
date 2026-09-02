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
  ["Warm Up (4).jpeg", "wellness-mountain.jpg"],
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

/**
 * The page hero.
 *
 * Third attempt, and this one chosen by measurement rather than instinct. A
 * hero has to satisfy two things at once in the zone the headline occupies
 * (left ~45%, vertical 30-95%): bright enough that the faint scrim still
 * clears 4.5:1 for the lead paragraph, and CALM enough that cream type is
 * not fighting detail. 123 bright landscape frames from the corporate and
 * training archives were scored on mean luma and standard deviation across
 * that zone; this frame won on calmness at 156 luma / sd 54, which is
 * 4.96:1 through the scrim. The 0.6 vertical offset drops the ceiling and
 * lands the headline on the pale wall and safety boards, not on a face.
 *
 * The two predecessors failed for opposite reasons: the PPE-wall mannequin
 * was dim and static, and the mountain warm-up was bright but a 1280px
 * phone frame upscaled 1.5x. This is a 5760x3840 professional shoot, so the
 * band is a straight downscale with nothing invented.
 */
{
  const SRC = "../Training Center-20260825T115129Z-1-001/Training Center/X37C6731.jpg";
  const HW = 1920, HH = 840;
  const m = await sharp(SRC).metadata();
  const sc = Math.max(HW / m.width, HH / m.height);
  const sw = Math.round(m.width * sc), sh = Math.round(m.height * sc);
  await sharp(SRC)
    .resize(sw, sh, { kernel: "lanczos3" })
    .extract({
      left: Math.round((sw - HW) / 2),
      top: Math.max(0, Math.min(sh - HH, Math.round((sh - HH) * 0.6))),
      width: HW, height: HH,
    })
    .jpeg({ quality: 86, mozjpeg: true })
    .toFile("public/images/hse/hse-hero-training.jpg");
  console.log(`hero   ${m.width}x${m.height} -> hse/hse-hero-training.jpg`);
}
