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
import { mkdirSync, rmSync, statSync, writeFileSync } from "node:fs";
import { readFileSync } from "node:fs";

/* NOT in public/: everything under public is copied verbatim into the export,
   so a 31MB master left there would ship to visitors alongside the cut it was
   used to make. */
const SRC = "scripts/.src-story/story-original.mp4";
/** `--out=path` writes elsewhere (for a proof) instead of over the live film */
const OUT = process.argv.find((a) => a.startsWith("--out="))?.slice(6) ?? "public/videos/story.mp4";
/**
 * Off by default, deliberately. `--with-ppm` weaves a block of the Oman Public
 * Prosecution Headquarters into the project montage (see PPM_BLOCK below). That
 * building has been recorded as not cleared for the promotional film, so a plain
 * `node scripts/prep-story.mjs` must keep producing the film without it.
 */
const WITH_PPM = process.argv.includes("--with-ppm");
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

/* ======================================================================
 * THE PUBLIC PROSECUTION BLOCK  (opt-in: --with-ppm)
 *
 * Sixteen seconds of the Oman Public Prosecution Headquarters, set into the
 * project montage after the last project (Renaissance Building at Duqm) and
 * before the film turns to the production facilities. Everything is encoded in
 * ONE pass from the master, so nothing is a second-generation copy.
 *
 * All times below are FILM times (the trimmed film, 25 fps), unless a name says
 * otherwise.
 *
 * PICTURE. The film's own transition out of the project montage is: Duqm clean
 * to film frame 1423, a two-frame dissolve (1424-1425) into the "In house
 * Capabilities" aerial, which then fades up from a dim frame. The block goes
 * in just before that. It starts on frame 1416 (56.64s) — a beat of the
 * soundtrack — replacing the ten frames of Duqm's tail and dissolve that
 * follow, and the film resumes on frame 1426, the first clean aerial frame.
 * The block ends in a 3-frame cross-dissolve into it, the kind of join the
 * film already makes at that point, rather than a hard cut from a bright
 * exterior into a dim frame. Block length: 400 frames added (16.0s) + 10
 * replaced + 3 that the dissolve overlaps = 413.
 *
 * SOUND. The music is 120 bpm (measured, 0.5s a beat, 2s a bar) and repeats on
 * a 16.00s period — eight bars — with feature similarity 0.92 (the next best
 * period, 8s, scores 0.91). The quiet phrase that runs 56.14-72.14 (the block starts inside it) is played
 * twice: the picture is lengthened by exactly the repeat, so everything AFTER
 * the block (film time T) plays the original soundtrack from T-16 and stays in
 * sync with its picture. The one seam is at 72.14, a bar line, on the last beat
 * before the drop into the breakdown; it is a 50ms equal-power crossfade
 * between two copies of music that are already in phase.
 *
 * SHOTS. Chosen from contact sheets of the source, and each window checked
 * against the source's own cuts and dissolves: shots here lie wholly inside one
 * take with at least 0.10s to spare. The source opens with its own title card
 * and a "VIP hall" run of room-hopping shots; neither is used. Lengths are in
 * FRAMES (a 1.5s shot is 37.5 frames, so 37 or 38) chosen so every cut falls
 * within one frame of a beat, counted from the block's own start on a beat.
 * ====================================================================== */
const PPM_SRC = "../vedio/PPM_6095 (1).MOV"; // gitignored with the rest of /vedio
const FPS = 25;
const PPM_CAPTION = "Public Prosecution Headquarters, Madinat Irfan";
const BLOCK_AT = 56.64, RESUME_AT = 57.04, XOVER = 3;   // XOVER: frames of cross-dissolve into the resumed film
const MUSIC_EXT = 16.0, SEAM = 72.14, XFADE = 0.05;
const PPM_SHOTS = [
  { at: 6.90, n: 38, what: "frontal exterior, low" },
  { at: 10.28, n: 37, what: "frontal exterior over the pool" },
  { at: 12.20, n: 50, what: "entrance arch, rising" },
  { at: 14.70, n: 38, what: "lobby" },
  { at: 23.60, n: 37, what: "atrium, looking up" },
  { at: 41.70, n: 38, what: "library" },
  { at: 51.60, n: 37, what: "boardroom" },
  { at: 63.14, n: 38, what: "chandelier lounge" },
  { at: 141.80, n: 37, what: "auditorium" },
  { at: 160.70, n: 63, what: "pergola, closing exterior" },
];
/** every take in the source, for the window check (from a 0.16 scene-score scan) */
const PPM_CUTS = [
  10.18, 11.88, 14.42, 16.46, 18.66, 20.38, 21.40, 23.36, 25.30, 26.54, 27.94, 29.56,
  30.94, 32.10, 33.20, 34.32, 35.84, 37.08, 38.48, 41.52, 43.64, 44.70, 45.78, 47.52,
  48.96, 50.22, 51.42, 53.46, 55.00, 57.38, 58.90, 60.10, 61.40, 62.98, 64.76, 65.80,
  67.24, 68.40, 69.36, 71.90, 73.08, 74.62, 75.66, 76.96, 77.88, 78.94, 79.96, 81.54,
  83.00, 84.10, 85.20, 86.50, 87.56, 89.18, 90.40, 91.54, 92.64, 93.72, 95.32, 96.32,
  96.44, 97.68, 98.64, 100.22, 100.24, 101.56, 102.38, 103.22, 104.60, 106.34, 107.48, 111.32,
  112.46, 113.90, 115.04, 116.58, 118.42, 119.84, 120.94, 123.72, 125.20, 126.28, 127.26, 128.38,
  130.00, 132.58, 134.30, 135.32, 136.14, 137.16, 137.94, 139.88, 141.60, 143.76, 145.30, 146.82,
  147.76, 149.66, 151.00, 152.02, 152.98, 153.96, 155.52, 157.02, 159.08, 160.56,
];
/** dissolves the scan does not flag (they are slow): seen on a 4fps sheet */
const PPM_DISSOLVES = [[6.4, 6.8], [8.6, 9.0]];
const BLOCK_FRAMES = PPM_SHOTS.reduce((s, x) => s + x.n, 0);

async function buildWithPpm() {
  /* the numbers have to agree, or the film drifts out of step with its sound */
  const addedFrames = Math.round(MUSIC_EXT * FPS), replaced = Math.round((RESUME_AT - BLOCK_AT) * FPS);
  if (BLOCK_FRAMES !== addedFrames + replaced + XOVER) throw new Error(`block is ${BLOCK_FRAMES} frames; it must be ${addedFrames + replaced + XOVER}`);

  /* 1. windows: whole-take, with room to spare, and no internal jump */
  for (const s of PPM_SHOTS) {
    const a = s.at, b = s.at + s.n / FPS;
    const hit = [...PPM_CUTS.filter((c) => c > a - 0.10 && c < b + 0.10), ...PPM_DISSOLVES.filter(([x, y]) => y > a - 0.05 && x < b + 0.05).map((d) => d[0])];
    if (hit.length) throw new Error(`shot "${s.what}" [${a}, ${b.toFixed(2)}] is within 0.10s of a cut/dissolve at ${hit.join(", ")}`);
  }
  for (const s of PPM_SHOTS) {
    const raw = execFileSync(ffmpeg, ["-hide_banner", "-loglevel", "error", "-ss", String(s.at), "-i", PPM_SRC, "-frames:v", String(s.n * 2), "-vf", "scale=96:54,format=gray", "-f", "rawvideo", "-"], { maxBuffer: 1 << 26 });
    const fsz = 96 * 54, mad = [];
    for (let f = 1; f * fsz < raw.length; f++) { let d = 0; for (let i = 0; i < fsz; i++) d += Math.abs(raw[f * fsz + i] - raw[(f - 1) * fsz + i]); mad.push(d / fsz); }
    const med = [...mad].sort((x, y) => x - y)[Math.floor(mad.length / 2)], max = Math.max(...mad);
    if (max > 12 && max > 4 * med) throw new Error(`shot "${s.what}" has a jump inside it (frame-to-frame MAD ${max.toFixed(1)} against a median of ${med.toFixed(2)})`);
  }
  console.log(`ppm: ${PPM_SHOTS.length} shots, ${BLOCK_FRAMES} frames (${(BLOCK_FRAMES / FPS).toFixed(2)}s), windows clean`);

  /* 2. the overlays the whole film carries: the logo, top right; a caption, lower. */
  const SWOOSH = [255, 255, 99], LETTERS = [125, 253, 127];   // sampled from the opening frame's large logo
  const lg = await sharp("public/images/logo-light.png").raw().toBuffer({ resolveWithObject: true });
  const rec = Buffer.alloc(lg.data.length);
  for (let i = 0; i < lg.data.length; i += 4) {
    const a = lg.data[i + 3]; if (!a) continue;
    const c = lg.data[i] - lg.data[i + 2] > 55 ? SWOOSH : LETTERS;   // gold swoosh vs cream lettering in the source file
    rec[i] = c[0]; rec[i + 1] = c[1]; rec[i + 2] = c[2]; rec[i + 3] = a;
  }
  // measured off the film: 217 x 77 at (1014, 44)
  const logo = await sharp(rec, { raw: { width: lg.info.width, height: lg.info.height, channels: 4 } }).resize(217, 76).png().toBuffer();
  // a soft dark shadow so the logo holds over the bright sky of the exteriors, as the film's does:
  // the logo's alpha, placed on a full frame, blurred, scaled to 60%, drawn black two pixels low.
  const placed = await sharp({ create: { width: W, height: H, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } })
    .composite([{ input: logo, left: 1014, top: 44 }]).png().toBuffer();
  const blurred = await sharp(placed).extractChannel(3).blur(2.2).raw().toBuffer({ resolveWithObject: true });
  const sh = Buffer.alloc(W * H * 4);                          // (blur may hand back 1 or 3 channels — stride by what it says)
  for (let p = 0; p < W * H; p++) sh[p * 4 + 3] = Math.round(blurred.data[p * blurred.info.channels] * 0.6);
  const shadow = await sharp(sh, { raw: { width: W, height: H, channels: 4 } }).png().toBuffer();
  await sharp({ create: { width: W, height: H, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } })
    .composite([{ input: shadow, left: 0, top: 2 }, { input: placed, left: 0, top: 0 }]).png().toFile(`${TMP}/logo-overlay.png`);

  // caption: Arial Bold, calibrated against the film's own (34.3px reproduces its text width
  // exactly); box 65px tall at y 607, right edge 928, 14px padding, about 57% black
  const FS = 34.3, esc = (t) => t.replace(/&/g, "&amp;");
  const ink = async (svg) => { const { data, info } = await sharp(Buffer.from(svg)).raw().toBuffer({ resolveWithObject: true }); let a = 1e9, b = 0; for (let y = 0; y < info.height; y++) for (let x = 0; x < info.width; x++) if (data[(y * info.width + x) * info.channels + 3] > 128) { a = Math.min(a, x); b = Math.max(b, x); } return [a, b]; };
  const probe = `<svg width="1400" height="80" xmlns="http://www.w3.org/2000/svg"><text x="20" y="55" font-family="Arial, Helvetica, sans-serif" font-weight="bold" font-size="${FS}" fill="#fff">${esc(PPM_CAPTION)}</text></svg>`;
  const [ia, ib] = await ink(probe);
  const tw = ib - ia + 1, boxR = 928, boxL = boxR - (tw + 27);
  if (boxL < 40) throw new Error(`caption is ${tw}px wide — it would run off the left of the frame`);
  const capSvg = `<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
    <rect x="${boxL}" y="607" width="${boxR - boxL}" height="65" fill="#000" fill-opacity="0.57"/>
    <text x="${boxL + 14 - ia + 20}" y="647.6" font-family="Arial, Helvetica, sans-serif" font-weight="bold" font-size="${FS}" fill="#fff">${esc(PPM_CAPTION)}</text>
  </svg>`;
  await sharp(Buffer.from(capSvg)).png().toFile(`${TMP}/caption-overlay.png`);

  /* 3. three picture segments, each its own small encode; the sound on its own; a stream-copy join.
   *
   * A single graph that reads the master twice does not work: while the block is
   * being built the decoder runs on through the last segment and queues about a
   * minute of 720p frames, and ffmpeg dies with "get_buffer() failed". Splitting
   * at the seams fixes that, and it costs nothing in quality: every segment is
   * encoded once, straight from the master, and the join is -c copy. Each
   * segment starts on an IDR frame and they share identical settings, so the
   * join is clean.
   */
  const f0 = Math.ceil(CUT * FPS);                           // master frame the film opens on (173)
  const nOpen = Math.round(BLOCK_AT * FPS);                  // film frames before the block (1416)
  const nResume = Math.round(RESUME_AT * FPS);               // first film frame after it (1426)
  const blockLen = BLOCK_FRAMES / FPS;
  const at = (masterFrame) => (masterFrame / FPS - 0.01).toFixed(3);   // input-seek a hair early; the frame at/after it is the first out
  const X264 = ["-c:v", "libx264", "-preset", "medium", "-crf", "24", "-pix_fmt", "yuv420p", "-an"];
  const run = (args) => execFileSync(ffmpeg, ["-y", "-hide_banner", "-loglevel", "error", ...args], { stdio: ["ignore", "inherit", "inherit"] });
  const loopIn = (file, t) => ["-loop", "1", "-framerate", String(FPS), "-t", t.toFixed(3), "-i", file];

  // segment 1: the opening, up to the block, with the badge
  run([
    "-ss", at(f0), "-i", SRC, ...loopIn(`${TMP}/badge.png`, 8),
    "-filter_complex", [
      `[0:v]setsar=1[v1a]`,
      `[1:v]format=rgba,fade=t=in:st=${BADGE_IN}:d=0.4:alpha=1,fade=t=out:st=${BADGE_OUT}:d=0.5:alpha=1[b]`,
      `[v1a][b]overlay=0:0:enable='between(t,${BADGE_IN},${BADGE_OUT + 0.5})',format=yuv420p[v]`,
    ].join(";"),
    "-map", "[v]", "-frames:v", String(nOpen), ...X264, `${TMP}/seg1.mp4`,
  ]);

  // segment 2: the block, dissolving into the first frames of the resumed film
  const inputs = [];
  PPM_SHOTS.forEach((sh) => inputs.push("-ss", String(sh.at), "-t", (sh.n / FPS + 0.4).toFixed(3), "-i", PPM_SRC));
  const iLogo = PPM_SHOTS.length, iCap = iLogo + 1, iHead = iLogo + 2;
  inputs.push(...loopIn(`${TMP}/logo-overlay.png`, blockLen + 0.4), ...loopIn(`${TMP}/caption-overlay.png`, blockLen + 0.4));
  inputs.push("-ss", at(f0 + nResume), "-t", "0.6", "-i", SRC);
  const g = [];
  PPM_SHOTS.forEach((sh, i) => g.push(`[${i}:v]setpts=PTS-STARTPTS,fps=${FPS},scale=1280:720:flags=lanczos,setsar=1,format=yuv420p,trim=end_frame=${sh.n},setpts=PTS-STARTPTS[s${i}]`));
  g.push(`${PPM_SHOTS.map((_, i) => `[s${i}]`).join("")}concat=n=${PPM_SHOTS.length}:v=1:a=0[blk]`);
  g.push(`[${iLogo}:v]format=rgba[lg]`);
  // the caption leaves before the dissolve begins, so it is never half-visible over the aerial's own
  g.push(`[${iCap}:v]format=rgba,fade=t=in:st=0.2:d=0.3:alpha=1,fade=t=out:st=${(blockLen - XOVER / FPS - 0.5).toFixed(2)}:d=0.3:alpha=1[cp]`);
  g.push(`[blk][lg]overlay=0:0:shortest=1[bl]`);
  g.push(`[bl][cp]overlay=0:0:shortest=1,format=yuv420p,fps=${FPS},settb=1/${FPS},setpts=PTS-STARTPTS[v2]`);
  g.push(`[${iHead}:v]trim=end_frame=${XOVER},setpts=PTS-STARTPTS,setsar=1,format=yuv420p,fps=${FPS},settb=1/${FPS}[v3h]`);
  g.push(`[v2][v3h]xfade=transition=fade:duration=${(XOVER / FPS).toFixed(3)}:offset=${(blockLen - XOVER / FPS).toFixed(3)},format=yuv420p[v]`);
  run([...inputs, "-filter_complex", g.join(";"), "-map", "[v]", "-frames:v", String(BLOCK_FRAMES), ...X264, `${TMP}/seg2.mp4`]);

  // segment 3: the rest of the film, from the frame after the dissolve
  run(["-ss", at(f0 + nResume + XOVER), "-i", SRC, "-vf", "setsar=1,format=yuv420p", ...X264, `${TMP}/seg3.mp4`]);

  // sound: the original up to the seam, then the same eight bars again, joined with a short equal-power crossfade
  const m = (t) => t + CUT;                                  // film time -> master time
  run([
    "-i", SRC, "-vn",
    "-filter_complex", [
      // the sound opens on the same instant as the first picture frame (master frame f0 = 6.92s), not
      // at the nominal 6.9: the picture cannot start between frames, so the sound meets it there
      `[0:a]atrim=start=${(f0 / FPS).toFixed(3)}:end=${(m(SEAM) + XFADE / 2).toFixed(3)},asetpts=PTS-STARTPTS[a1]`,
      `[0:a]atrim=start=${(m(SEAM - MUSIC_EXT) - XFADE / 2).toFixed(3)},asetpts=PTS-STARTPTS[a2]`,
      `[a1][a2]acrossfade=d=${XFADE}:c1=qsin:c2=qsin[a]`,
    ].join(";"),
    "-map", "[a]", "-c:a", "aac", "-b:a", "128k", `${TMP}/audio.m4a`,
  ]);

  // join: video segments copied end to end, sound laid under them
  writeFileSync(`${TMP}/list.txt`, ["seg1.mp4", "seg2.mp4", "seg3.mp4"].map((f) => `file '${f}'\n`).join(""));
  run(["-f", "concat", "-safe", "0", "-i", `${TMP}/list.txt`, "-i", `${TMP}/audio.m4a`, "-map", "0:v", "-map", "1:a", "-c", "copy", "-movflags", "+faststart", OUT]);
}

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

if (!WITH_PPM) {
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
} else {
await buildWithPpm();
console.log(`trimmed at ${CUT}s + Public Prosecution block -> ${OUT} (${(statSync(OUT).size / 1024 / 1024).toFixed(1)} MB)`);
}

/* the poster must be a frame the film actually opens on, badge and all.
   Only rewritten when this run is writing the live film: a proof (--out=…) must
   not touch what the page is showing. The opening is identical either way. */
if (OUT === "public/videos/story.mp4") {
  execFileSync(
    ffmpeg,
    ["-y", "-ss", "1.4", "-i", OUT, "-frames:v", "1", "-q:v", "3", `${TMP}/poster.png`],
    { stdio: ["ignore", "ignore", "pipe"] }
  );
  await sharp(`${TMP}/poster.png`).jpeg({ quality: 86, mozjpeg: true }).toFile(POSTER);
  console.log(`poster -> ${POSTER}`);
}

rmSync(TMP, { recursive: true, force: true });
