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
 *   six clips   — phone footage. Three are PORTRAIT (576×768 after their
 *                 −90° display matrix; ffmpeg rotates on decode, so probe with
 *                 showinfo, not the container's 768×576), two are a dim root
 *                 tunnel and an overcast mangrove wall, and the two-minute
 *                 lagoon clip fills with identifiable guests in life jackets
 *                 from 4.4s on. Its first four seconds are the one usable
 *                 landscape window: a slow golden pan across the lagoon with
 *                 nobody in frame.
 *
 * Stills go through the same 1080×720 cover crop as the other two resorts
 * (see prep-group.mjs). The clip is those four seconds, cropped 16:9 → 3:2 to
 * match the card, then played forward and reversed so a pan that would
 * otherwise snap back every four seconds loops as a gentle look each way —
 * 8s, ~1MB, silenced and faststarted, offered as the last gallery slide
 * rather than autoplayed.
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
/** the two-minute lagoon clip, 1024×576 landscape; guests enter at ~4.4s */
const CLIP = "WhatsApp Video 2026-09-07 at 6.06.12 PM (3).mp4";
const CLIP_IN = 0.2, CLIP_LEN = 4.0;

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

/* 1024×576 → centre-crop to 864×576 (3:2), 25fps; then forward + reversed.
   `reverse` holds the whole clip in memory, which is why the excerpt is
   trimmed on input first — four seconds, not two minutes. */
run([
  "-ss", String(CLIP_IN), "-t", String(CLIP_LEN), "-i", `${SRC}/${CLIP}`,
  "-filter_complex",
  "[0:v]crop=864:576:80:0,fps=25,format=yuv420p,split[f][b];[b]reverse[r];[f][r]concat=n=2:v=1:a=0[v]",
  "-map", "[v]",
  "-c:v", "libx264", "-preset", "slow", "-crf", "27", "-an", "-movflags", "+faststart",
  `${VID}/leisure-island.mp4`,
]);
/* the poster is the clip's own first frame, so selecting the slide does not jump */
run(["-i", `${VID}/leisure-island.mp4`, "-frames:v", "1", "-q:v", "2", `${TMP}/poster.png`]);
await sharp(`${TMP}/poster.png`).jpeg({ quality: 82, mozjpeg: true }).toFile(`${IMG}/leisure-island-film.jpg`);

rmSync(TMP, { recursive: true, force: true });
console.log(`clip   ${CLIP_LEN * 2}s 864x576 -> videos/hotels/leisure-island.mp4 (${(statSync(`${VID}/leisure-island.mp4`).size / 1024).toFixed(0)} KB) + hotels/leisure-island-film.jpg`);
