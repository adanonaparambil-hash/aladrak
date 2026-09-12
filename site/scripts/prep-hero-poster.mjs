/**
 * The hero film's poster frame.
 *
 * Split out of prep-hero.mjs because it needs re-running far more often than
 * the film does — a poster is a judgment about one frame, and re-cutting
 * eight minutes of video to change it is the wrong price.
 *
 * The frame is the head-office frontal, a photograph — so the full 1920×1080
 * is kept. KEEP_H exists because the film once opened on CWH drone footage,
 * which carries a bottom-right watermark the film patches with delogo; in
 * motion that patch reads as motion blur, but frozen it is a plain smear —
 * and this file is not only the <video poster>, it is also the News page's
 * hero image, where it sits still indefinitely. Both places use object-fit:
 * cover, so a cropped poster costs nothing but a little foreground.
 *
 * Run from site/:  node scripts/prep-hero-poster.mjs
 * Reads the rendered web film, so run prep-hero.mjs first.
 */
import sharp from "sharp";
import ffmpeg from "ffmpeg-static";
import { execFileSync } from "node:child_process";
import { copyFileSync, mkdirSync, rmSync, statSync } from "node:fs";

const FILM = "../vedio/hero-output/hero-web.mp4";
const ARCHIVE = "../vedio/hero-output/hero-poster.jpg";
const POSTER = "public/images/hero-poster.jpg";
const TMP = "scripts/.tmp-hero-poster";

/** into the opening shot — the head-office frontal, mid push-in */
const AT = 1.5;
/**
 * Rows kept, from the top. The opener is now a photograph with no watermark,
 * so the whole frame stays. It was 928 while the film opened on CWH drone
 * footage: that source carries a bottom-right watermark that the film patches
 * with delogo, invisible in motion but a plain smear on a still — and this
 * file is also the News page hero. If the opener ever goes back to CWH
 * footage, this goes back to 928 (the patch begins at y=930).
 */
const KEEP_H = 1080;

mkdirSync(TMP, { recursive: true });
execFileSync(
  ffmpeg,
  ["-y", "-hide_banner", "-loglevel", "error", "-ss", String(AT), "-i", FILM, "-frames:v", "1", "-q:v", "2", `${TMP}/frame.png`],
  { stdio: ["ignore", "inherit", "inherit"] }
);
await sharp(`${TMP}/frame.png`)
  .extract({ left: 0, top: 0, width: 1920, height: KEEP_H })
  .jpeg({ quality: 82, mozjpeg: true })
  .toFile(POSTER);
copyFileSync(POSTER, ARCHIVE);
rmSync(TMP, { recursive: true, force: true });
console.log(`poster: frame ${AT}s, 1920x${KEEP_H}, ${(statSync(POSTER).size / 1024).toFixed(0)} KB -> ${POSTER}`);
