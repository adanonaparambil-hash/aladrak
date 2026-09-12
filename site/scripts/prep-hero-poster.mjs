/**
 * The hero film's poster frame.
 *
 * Split out of prep-hero.mjs because it needs re-running far more often than
 * the film does — a poster is a judgment about one frame, and re-cutting
 * eight minutes of video to change it is the wrong price.
 *
 * The poster is NOT a full 1920×1080 frame. The CWH footage the film opens on
 * carries a bottom-right watermark that the film patches with delogo; in
 * motion that patch reads as motion blur and is invisible, but frozen it is a
 * plain vertical smear across the sheds — and this file is not only the
 * <video poster>, it is also the News page's hero image, where it sits still
 * on screen indefinitely. So the frame is cut above the patch: the delogo
 * box begins at y=930, and the poster keeps rows 0–927 (1920×928, ≈2.07:1).
 * Both places that show it use object-fit: cover, so the wider ratio costs a
 * little foreground road and nothing else.
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

/** into the opening drone reveal — the campus fully framed, city beyond */
const AT = 1.5;
/** the delogo patch starts at y=930; keep everything above it */
const KEEP_H = 928;

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
