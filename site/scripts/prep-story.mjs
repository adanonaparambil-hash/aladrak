/**
 * Re-cut the corporate film for the Our Story section.
 *
 * The supplied film opens on a title card reading "36 Years", which was true
 * when it was made and is now four years out of date — the first claim the
 * page makes about the company would have been wrong. Two ways to deal with
 * that: cover the text, or cut past it. Covering loses: the text sits over a
 * moving dusk sky with a crossfade, so any patch reads as a patch.
 *
 * So the film is trimmed. Measured frame by frame at 4fps: "36 Years" is on
 * screen from ~1.0s, begins fading at 6.25s and is gone by 6.50s; the next
 * bright logo shot with its own caption runs from ~6.9s. Cutting at 6.9
 * therefore loses the stale claim and nothing else — the branded opening, the
 * logo and the whole body of the film survive.
 *
 * A "40+ Years" badge then goes back in, in the same corner and roughly the
 * same weight as the one removed, so the film still opens by saying how long
 * the company has been building. The number comes from lib/anniversary.ts,
 * the same source the rest of the site counts from, so it cannot drift again
 * — re-run this script and the badge is correct for the year.
 *
 * Run from site/:  node scripts/prep-story.mjs
 */
import sharp from "sharp";
import ffmpeg from "ffmpeg-static";
import { execFileSync } from "node:child_process";
import { mkdirSync, rmSync, statSync } from "node:fs";
import { readFileSync } from "node:fs";

/* NOT in public/: everything under public is copied verbatim into the export,
   so a 31MB master left there would ship to visitors alongside the cut it was
   used to make. */
const SRC = "scripts/.src-story/story-original.mp4";
const OUT = "public/videos/story.mp4";
const POSTER = "public/images/story-poster.jpg";
const TMP = "scripts/.tmp-story";

/** the frame after "36 Years" has fully faded, measured at 4fps */
const CUT = 6.9;
/** the badge's life within the trimmed film */
const BADGE_IN = 0.6, BADGE_OUT = 5.6;

/* the same count the pages use, so the film cannot fall out of step again */
const FOUNDED = 1986;
const anniversary = readFileSync("lib/anniversary.ts", "utf8");
const founded = Number(anniversary.match(/FOUNDED\s*=\s*(\d{4})/)?.[1] ?? FOUNDED);
const years = new Date().getFullYear() - founded;

mkdirSync(TMP, { recursive: true });

/**
 * The badge, drawn to match the one removed: bold white, upper right, with a
 * soft dark shadow so it holds over the dusk sky the way the original did.
 */
const W = 1280, H = 720;
const badgeSvg = `<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <filter id="sh" x="-30%" y="-30%" width="160%" height="160%">
      <feDropShadow dx="0" dy="2" stdDeviation="3" flood-color="#04121f" flood-opacity="0.85"/>
      <feDropShadow dx="0" dy="0" stdDeviation="10" flood-color="#04121f" flood-opacity="0.55"/>
    </filter>
  </defs>
  <text x="${W - 94}" y="84" text-anchor="end" filter="url(#sh)"
        font-family="Arial, Helvetica, sans-serif" font-size="42" font-weight="bold"
        fill="#ffffff">${years}+ Years</text>
</svg>`;
await sharp(Buffer.from(badgeSvg)).png().toFile(`${TMP}/badge.png`);
console.log(`badge: "${years}+ Years"`);

/**
 * Trim first, then overlay, then re-encode.
 *
 * Two things here are load-bearing, both learned the hard way:
 *
 * -ss goes BEFORE -i, so the trim happens on input and the output timeline
 * restarts at zero. With -ss after the inputs it is an output option: the
 * filter graph still runs on the original timeline, so the badge faded in at
 * 0.6s of the ORIGINAL and was already gone by the time the first 6.9s were
 * discarded. (Input seeking is frame-accurate here because the output is
 * re-encoded; ffmpeg decodes from the preceding keyframe and drops the rest.)
 *
 * -shortest is not optional. `-loop 1` on a still makes an INFINITE video
 * stream, and overlay runs until its longest input ends — so without it
 * ffmpeg encodes forever. The first attempt reached 357MB of a 25MB film
 * before it was killed.
 */
const filter = [
  `[1:v]format=rgba,fade=t=in:st=${BADGE_IN}:d=0.4:alpha=1,fade=t=out:st=${BADGE_OUT}:d=0.5:alpha=1[b]`,
  `[0:v][b]overlay=0:0:enable='between(t,${BADGE_IN},${BADGE_OUT + 0.5})'[v]`,
].join(";");

execFileSync(
  ffmpeg,
  [
    "-y",
    "-ss", String(CUT), "-i", SRC,
    "-loop", "1", "-i", `${TMP}/badge.png`,
    "-filter_complex", filter,
    "-shortest",
    "-map", "[v]", "-map", "0:a?",
    "-c:v", "libx264", // CRF 21 produced 36MB from a 31MB source — re-encoding a 2029 kb/s master
    // at higher quality than it was delivered in. 24 lands near the original
    // bitrate, which is what this footage was graded for.
    "-preset", "medium", "-crf", "24",
    "-pix_fmt", "yuv420p", "-movflags", "+faststart",
    "-c:a", "aac", "-b:a", "128k",
    OUT,
  ],
  { stdio: ["ignore", "ignore", "pipe"] }
);
console.log(`trimmed at ${CUT}s -> ${OUT} (${(statSync(OUT).size / 1024 / 1024).toFixed(1)} MB)`);

/* the poster must be a frame the film actually opens on, badge and all */
execFileSync(
  ffmpeg,
  ["-y", "-ss", "1.4", "-i", OUT, "-frames:v", "1", "-q:v", "3", `${TMP}/poster.png`],
  { stdio: ["ignore", "ignore", "pipe"] }
);
await sharp(`${TMP}/poster.png`).jpeg({ quality: 86, mozjpeg: true }).toFile(POSTER);
console.log(`poster -> ${POSTER}`);

rmSync(TMP, { recursive: true, force: true });
