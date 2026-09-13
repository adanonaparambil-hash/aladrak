/**
 * Adrak Leisure Island — the third property behind the Adrak Hotels tile.
 *
 * It has no website yet, so its chooser card cannot link anywhere; it shows
 * photographs and an address instead. The source material is what the company
 * sent over WhatsApp on 7–10 Sep 2026, in /Images/Adrak Leisure Island
 * (gitignored with the rest of the archive):
 *
 *   six stills  — the villa from the water (hero), the villa from the deck,
 *                 the interior, the lagoon; a 1300×500 two-photo composite
 *                 and an 800×500 duplicate of the deck shot are skipped
 *   six clips   — three are PORTRAIT (576×768 after their −90° display
 *                 matrix; ffmpeg rotates on decode, so probe with showinfo,
 *                 not the container's 768×576). Three are used, below.
 *
 * NOT used, and why:
 *   6.06.12 (1)  — mangrove tunnel, dim and cluttered; (2) covers it better
 *   6.06.12 (4)  — open water, but the horizon sits where the 3:2 crop cuts
 *   6.06.13      — root tunnel: murky, and an out-of-focus object sits on the
 *                  bottom edge of every frame
 *   6.06.12 (3) after 4.4s — the lagoon fills with identifiable guests in
 *                  life jackets, so only its first four seconds are usable
 *
 * Stills go through the same 1080×720 cover crop as the other two resorts
 * (see prep-group.mjs). Each clip is cropped to the card's 3:2, normalised to
 * 720×480 (the pane it plays in is about 372px wide, so more is waste)
 * and played forward then reversed: these are all travelling shots,
 * and a 5-second travelling shot that simply loops snaps back to its start
 * every 5 seconds. Ping-ponging costs double the frames — still well under a
 * megabyte each — and the loop point disappears.
 *
 * Run from site/:  node scripts/prep-leisure-island.mjs
 */
import sharp from "sharp";
import ffmpeg from "ffmpeg-static";
import { execFileSync } from "node:child_process";
import { mkdirSync, rmSync, statSync } from "node:fs";

const SRC = "../Images/Adrak Leisure Island";
const IMG = "public/images/hotels";
const VID = "public/videos/hotels";
const TMP = "scripts/.tmp-leisure-island";

const STILLS = [
  ["WhatsApp Image 2026-09-10 at 6.24.53 PM (1).jpeg", "leisure-island.jpg", "the villa from the water, with its reflection"],
  ["WhatsApp Image 2026-09-10 at 6.24.53 PM.jpeg", "leisure-island-2.jpg", "the villa from the deck"],
  ["WhatsApp Image 2026-09-10 at 6.24.53 PM (2).jpeg", "leisure-island-3.jpg", "the interior"],
  ["WhatsApp Image 2026-09-07 at 6.06.11 PM.jpeg", "leisure-island-4.jpg", "the lagoon"],
];

/** `crop` takes each source to 3:2 before everything is normalised to 720×480 */
const CLIPS = [
  {
    file: "WhatsApp Video 2026-09-07 at 6.06.12 PM (3).mp4",
    out: "leisure-island", at: 0.2, len: 4.0,
    crop: "crop=864:576:80:0", // 1024×576 landscape
    what: "the lagoon at golden hour, before the boats come out",
  },
  {
    file: "WhatsApp Video 2026-09-07 at 6.06.12 PM.mp4",
    out: "leisure-island-2", at: 0.5, len: 3.5,
    crop: "crop=696:464:68:0", // 832×464 landscape
    what: "running the mangrove wall",
  },
  {
    file: "WhatsApp Video 2026-09-07 at 6.06.12 PM (2).mp4",
    out: "leisure-island-3", at: 2.0, len: 3.5,
    crop: "crop=576:384:0:192", // 576×768 PORTRAIT — centre band
    what: "through the mangrove tunnel",
  },
];

mkdirSync(IMG, { recursive: true });
mkdirSync(VID, { recursive: true });
mkdirSync(TMP, { recursive: true });

for (const [src, out, what] of STILLS) {
  const m = await sharp(`${SRC}/${src}`).metadata();
  await sharp(`${SRC}/${src}`)
    .rotate() // honour the phone's EXIF orientation before cropping
    .resize(1080, 720, { fit: "cover", position: "attention", kernel: "lanczos3" })
    .jpeg({ quality: 84, mozjpeg: true })
    .toFile(`${IMG}/${out}`);
  console.log(`still  ${String(m.width).padStart(4)}x${String(m.height).padEnd(4)} -> hotels/${out}   ${what}`);
}

const run = (args) => execFileSync(ffmpeg, ["-y", "-hide_banner", "-loglevel", "error", ...args], { stdio: ["ignore", "inherit", "inherit"] });

for (const c of CLIPS) {
  /* `reverse` buffers the whole clip in memory, which is why the excerpt is
     trimmed on input first — four seconds, not the source's two minutes. */
  run([
    "-ss", String(c.at), "-t", String(c.len), "-i", `${SRC}/${c.file}`,
    "-filter_complex",
    `[0:v]${c.crop},scale=720:480:flags=lanczos,setsar=1,fps=25,format=yuv420p,split[f][b];[b]reverse[r];[f][r]concat=n=2:v=1:a=0[v]`,
    "-map", "[v]",
    "-c:v", "libx264", "-preset", "slow", "-crf", "30", "-an", "-movflags", "+faststart",
    `${VID}/${c.out}.mp4`,
  ]);
  /* the poster is the clip's own first frame, so selecting the slide does not jump */
  run(["-i", `${VID}/${c.out}.mp4`, "-frames:v", "1", "-q:v", "2", `${TMP}/${c.out}.png`]);
  await sharp(`${TMP}/${c.out}.png`).jpeg({ quality: 82, mozjpeg: true }).toFile(`${IMG}/${c.out}-film.jpg`);
  console.log(`clip   ${(c.len * 2).toFixed(1)}s 720x480 -> videos/hotels/${c.out}.mp4 (${(statSync(`${VID}/${c.out}.mp4`).size / 1024).toFixed(0)} KB)   ${c.what}`);
}

rmSync(TMP, { recursive: true, force: true });
