/**
 * Cut the landing-page hero film from the corporate footage library.
 *
 * Re-cut of 12 Sep 2026. The first cut opened on the Public Prosecution HQ —
 * a client's building — and the client read that as the site fronting someone
 * else's landmark. The company's own property now opens the film: the drone
 * reveal of the Halban campus, the gate with the Al Adrak sign, the duct
 * factory frontal, the yard from the air. The Public Prosecution shots move
 * into the projects act in the middle, where a delivered landmark belongs.
 *
 * Two defects in the old tail are gone with it. The engineers' line-up at
 * 60.4s reads as a staff photo dropped into a film; the Al Adrak-liveried
 * truck being loaded takes its slot — the one place in the library where the
 * company name is legitimately in the scene rather than burned over it. And
 * the blue-hour finale ran into the Ahli Bank source's closing logo
 * animation, which begins at 138.2s of that file: the old cut started at
 * 135.8 and ran 4.8s, so a full-frame green logo bled into the last 1.5s of a
 * film documented as "no text, no logos". The same shot is now sourced from
 * 133.2s and ends at 137.8, clear of it.
 *
 * Every burn-in repair from the original analysis is reapplied per source:
 * Ahli's top-right logo and CWH/CWS's bottom-right watermark are patched
 * with delogo; AFW/NRMF carry a caption bar mid-lower, so those shots are
 * re-framed to a clean 1479x832 top window (the bottom-right watermark is
 * below that window too) and punched back up to 1080p; the one 720p Maskaan
 * aerial is denoised before upscaling. One grade goes over everything so
 * five cameras read as one film. The original grade's numbers did not
 * survive — only its description did — so this is a fresh match to that
 * description, applied uniformly.
 *
 * Mobile is a per-shot vertical re-frame, not a centre crop: MX below is the
 * left edge of the 608px window taken from each 1920px frame, chosen per
 * subject.
 *
 * Run from site/:  node scripts/prep-hero.mjs
 * Takes several minutes. Sources are read-only under ../vedio and are never
 * modified; nothing large is written under public/ except the two deliverables.
 */
import ffmpeg from "ffmpeg-static";
import { execFileSync } from "node:child_process";
import { copyFileSync, mkdirSync, rmSync, statSync, writeFileSync } from "node:fs";

const V = "../vedio";
const SRC = {
  CWH: `${V}/Central Logistics (CWH)_Al Adrak_Final.mov`, // 1080p25, watermark bottom-right
  CWS: `${V}/Joinery & Carpentry (CWS)_Al Adrak_Final.mov`, // 1080p24, watermark bottom-right
  AFW: `${V}/Al adrak_Aluminum Fabrication (AFW).mov`, // 1080p25, caption bar y≈835–915
  NRMF: `${V}/Al Adrak_Duct Fabrication (NRMF).mov`, // 1080p25, caption bar y≈875–955 + watermark
  AHLI: `${V}/AHLI BANK CORPORATE OFFICE VIDEO.mov`, // 1080p60, logo top-right; closing logo anim from 138.2s
  PPM: `${V}/PPM_6095 (1).MOV`, // 1080p50 HEVC, clean 5–165s
  MASKAAN: `${V}/CLA-AL MASKAAN VILLAGE- Video 2024-11-26 at 10.25.44_aaec9c7a.mp4`, // 720p30
};
const OUT = `${V}/hero-output`;
const TMP = "scripts/.tmp-hero";
const PUB_WEB = "public/videos/hero-web.mp4";
const PUB_MOBILE = "public/videos/hero-mobile.mp4";

/** mobile crop window: left edge of the 608px slice of a 1920px frame */
const CENTRE = 656;

/**
 * The cut. `at` is the source in-point in seconds, `dur` the shot length.
 * `fix` names the burn-in repair for that source; `tx` is the left edge of the
 * 1479px top window for caption-bar sources; `mx` the mobile crop.
 */
const SHOTS = [
  // ===== I. THE COMPANY — its own ground, before anyone else's =====
  { src: "CWH", at: 95.3, dur: 3.6, fix: "br", mx: CENTRE, shot: "High drone reveal: the whole Halban campus, city beyond", why: "OPENING — Al Adrak's own ground; slow, symmetric, breathes" },
  { src: "CWH", at: 10.7, dur: 1.7, fix: "br", mx: 720, shot: "The gate — the Al Adrak sign over the barrier", why: "Identity beat; real signage, not a graphic" },
  { src: "NRMF", at: 15.6, dur: 2.6, fix: "top", tx: 120, mx: 480, shot: "Duct factory frontal, telehandler carrying steel, NRMF on the wall", why: "A company building at eye level; work already moving" },
  { src: "CWH", at: 12.6, dur: 2.8, fix: "br", mx: CENTRE, shot: "Low aerial over the yard — stock, colour, sheds", why: "Scale of the operation; motion into the people act" },
  // ===== II. PEOPLE =====
  { src: "CWS", at: 56.0, dur: 2.4, fix: "br", mx: CENTRE, shot: "Bench-saw trio, low angle, shallow depth", why: "PEOPLE enter — wide-to-face contrast cut" },
  // 24.9, not 26.0: the two-workers close-up runs 24.75–26.9 and then cuts to
  // a wide of the whole floor, so the old window (26.0–28.4) was 0.9s of the
  // shot it named and 1.5s of a different one.
  { src: "AFW", at: 24.9, dur: 1.9, fix: "top", tx: 220, mx: CENTRE, shot: "Two workers over aluminum frame, backlit", why: "Teamwork close; matched yellow-coverall palette" },
  { src: "CWS", at: 61.5, dur: 2.2, fix: "br", mx: CENTRE, shot: "Radial-arm saw, hands on carriage", why: "Craft detail — hands after faces" },
  { src: "CWH", at: 37.0, dur: 2.6, fix: "br", mx: CENTRE, shot: "Follow-shot behind two staff in racking aisle", why: "Human movement carries into the machinery phase" },
  // ===== III. ENGINEERING & MACHINERY =====
  { src: "NRMF", at: 26.5, dur: 2.5, fix: "top", tx: 220, mx: CENTRE, shot: "Workers flank plasma table, arc ignites", why: "ENERGY rises — anticipation beat" },
  { src: "NRMF", at: 31.5, dur: 2.1, fix: "top", tx: 220, mx: CENTRE, shot: "Plasma head mid-cut, sparks on dark steel", why: "The action peak; darkest frame of the film" },
  { src: "AFW", at: 61.0, dur: 2.2, fix: "top", tx: 220, mx: CENTRE, shot: "Drill macro boring aluminum, chips flying", why: "Match-cut: sparks → chips" },
  { src: "CWS", at: 111.0, dur: 2.2, fix: "br", mx: CENTRE, shot: "Multi-spindle CNC head macro", why: "Machine beauty; chrome after fire" },
  { src: "CWH", at: 76.0, dur: 2.6, fix: "br", mx: CENTRE, shot: "Telehandler with pallet, low angle vs blue sky", why: "Exhale — dark macros open into daylight" },
  // ===== IV. FACILITIES & CRAFT =====
  { src: "CWS", at: 100.5, dur: 3.4, fix: "br", mx: CENTRE, shot: "CNC router carving arabesque door panel", why: "SIGNATURE SHOT — craft, technology, Omani identity" },
  { src: "CWH", at: 45.5, dur: 3.0, fix: "br", mx: CENTRE, shot: "Aerial over cable-drum + pipe yard", why: "Colour, repetition, industrial capacity" },
  { src: "AFW", at: 56.0, dur: 2.4, fix: "top", tx: 220, mx: CENTRE, shot: "Copy-router operator, red hoses, warm light", why: "Production rhythm, human at the centre" },
  // 29.6, not 31.0: the aerial is one take from 27.0 to 32.4 and then cuts to
  // the racking-aisle follow shot, so the old window (31.0–33.4) crossed that
  // cut and put 0.9s of two men walking indoors inside an "aerial".
  { src: "CWH", at: 29.6, dur: 2.4, fix: "br", mx: CENTRE, shot: "Aerial: telehandler drives toward camera", why: "Movement hand-off into the projects act" },
  // ===== V. PROJECTS — the delivered landmarks, in the middle where they belong =====
  // 9.2, not 7.0: the frontal wide runs only 7.0–8.75 and the source then
  // whip-pans into the low-angle entrance shot, so the old window (7.0–10.0)
  // carried the whip — a quarter-second radial smear — inside the beat. The
  // entrance take is one continuous shot from 9.0 to 11.9.
  { src: "AHLI", at: 9.2, dur: 2.6, fix: "tr", mx: CENTRE, shot: "Ahli Bank HQ entrance, low angle, flags flying", why: "PROJECTS act opens" },
  { src: "PPM", at: 6.2, dur: 3.6, fix: null, mx: CENTRE, shot: "Public Prosecution HQ: monumental frontal, arch + reflecting pool", why: "The old opener, now a delivered landmark among landmarks" },
  { src: "PPM", at: 10.5, dur: 2.6, fix: null, mx: CENTRE, shot: "Golden low-angle rise up the arch", why: "Matching architecture, upward camera energy" },
  // 23.2 for 1.9s, not 25.5 for 2.6: the old window was three shots — a
  // second of lounge, 1.4s of atrium, a frame of corridor. The atrium exists
  // as two takes, 23.2–25.1 (rotating) and 26.5–27.9; neither is 2.6s long,
  // so the beat takes the longer one whole rather than padding it with the
  // rooms either side of it.
  // The take actually begins at ~23.4 (the lounge→atrium cut sits between the
  // 23.25 and 23.5 samples), so 23.2 still opened on five frames of sofas.
  // 23.5–25.0 keeps a 0.1s margin at both ends of the 23.4–25.15 take.
  { src: "PPM", at: 23.5, dur: 1.5, fix: null, mx: CENTRE, shot: "Atrium vertigo look-up, stacked rings, rotating", why: "Interior scale; pure geometry — a short, sharp beat" },
  { src: "AHLI", at: 77.0, dur: 2.8, fix: "tr", mx: CENTRE, shot: "Collaborative floor, wood baffles, green sofas, orbit", why: "Design quality of finished interiors" },
  // 102.3, not 101.0: the boardroom take runs 102.0–104.9; the old window
  // opened on a second of the lounge next door before the cut into it.
  { src: "AHLI", at: 102.3, dur: 2.5, fix: "tr", mx: CENTRE, shot: "Executive boardroom, full symmetry", why: "Premium finish" },
  // The first cut's "VIP hall under crystal chandelier" (PPM 66.0, 2.6s) is
  // gone. That window was three rooms — a second of the hall, a meeting room,
  // a lounge — and the hall itself never exists as more than a 1.7s take
  // anywhere in 61–70s. A stately beat cannot be stitched from room-hopping,
  // so the act loses the beat rather than keeping a fake one.
  { src: "MASKAAN", at: 85.5, dur: 2.6, fix: "maskaan", mx: CENTRE, shot: "Dusk top-down aerial: village blocks, glowing pitch", why: "Breadth across Oman; daylight → dusk turn" },
  // ===== VI. THE COMPANY AGAIN, THEN NIGHT =====
  // mx 980, not centre: in the 1920 frame the pallet is at x≈400–770 and the
  // cab-door livery at x≈1190–1345. A phone gets 608px of that — and the
  // livery is the reason this shot exists, so the window takes the door and
  // the worker beside it and lets the pallet go.
  { src: "CWH", at: 84.0, dur: 2.8, fix: "br", mx: 980, shot: "Al Adrak-liveried truck; telehandler swings a pallet aboard", why: "Replaces the staff line-up — the company's name in the scene, not over it" },
  // 160.7, not the 160.3 the first cut used: the source is a plant room — red
  // fire pipes, a ladder — until 160.25 and cuts to the pergola at 160.5, so
  // the old in-point put five frames of pump room on screen before the facade.
  // Clean until the end-card fade begins at ~164.1.
  { src: "PPM", at: 160.7, dur: 3.1, fix: null, mx: CENTRE, shot: "Facade framed through pergola + mashrabiya", why: "Grace note; frame-within-frame" },
  { src: "AHLI", at: 133.2, dur: 4.6, fix: "tr", mx: 560, shot: "Blue-hour lit HQ against mountains", why: "FINALE — sourced before the 138.2s logo animation the old cut ran into" },
];

/** one look over five cameras: lifted floor, capped whites, +6% sat, warm shadows */
const GRADE = "eq=saturation=1.06,curves=master='0/0.018 0.25/0.262 0.75/0.752 1/0.985',colorbalance=rs=0.02:bs=-0.025";

const FIX = {
  br: "delogo=x=1456:y=930:w=450:h=95",
  tr: "delogo=x=1440:y=25:w=430:h=185",
  top: (tx) => `crop=1479:832:${tx}:0`,
  maskaan: "hqdn3d=3:2:4:3",
};

const run = (args) => execFileSync(ffmpeg, ["-y", "-hide_banner", "-loglevel", "error", ...args], { stdio: ["ignore", "inherit", "inherit"] });
const mb = (p) => (statSync(p).size / 1024 / 1024).toFixed(1);
const pad = (n) => String(n).padStart(2, "0");

rmSync(TMP, { recursive: true, force: true });
mkdirSync(TMP, { recursive: true });
mkdirSync(OUT, { recursive: true });

/* ---------- 1. each shot → graded 1080p25 web clip + vertical mobile clip, one decode ---------- */
let t = 0;
const rows = [];
SHOTS.forEach((s, i) => {
  const fix = s.fix === "top" ? FIX.top(s.tx) : s.fix ? FIX[s.fix] : null;
  const chain = ["fps=25", fix, GRADE, "scale=1920:1080:flags=lanczos", "setsar=1", "format=yuv420p"].filter(Boolean).join(",");
  // setsar=1 after the vertical scale: 608→1080 is not an integer ratio, and
  // without it ffmpeg records the rounding as a 1216:1215 sample aspect —
  // invisible, but every downstream probe then reports a non-square pixel.
  const graph = `[0:v]${chain},split[w][m];[m]crop=608:1080:${s.mx}:0,scale=1080:1920:flags=lanczos,setsar=1[mo]`;
  const w = `${TMP}/w${pad(i)}.mp4`, m = `${TMP}/m${pad(i)}.mp4`;
  run([
    "-ss", String(s.at), "-t", String(s.dur), "-i", SRC[s.src],
    "-filter_complex", graph,
    "-map", "[w]", "-c:v", "libx264", "-preset", "fast", "-crf", "14", "-an", w,
    "-map", "[mo]", "-c:v", "libx264", "-preset", "fast", "-crf", "14", "-an", m,
  ]);
  rows.push({ i, t0: t, ...s });
  t += s.dur;
  process.stdout.write(`  ${pad(i + 1)}/${SHOTS.length}  ${s.src.padEnd(7)} ${String(s.at).padStart(6)}s  +${s.dur}s  ${s.shot}\n`);
});
const total = t;

/* ---------- 2. concat → master, web, mobile ---------- */
const list = (prefix) => {
  const p = `${TMP}/${prefix}.txt`;
  writeFileSync(p, SHOTS.map((_, i) => `file '${prefix}${pad(i)}.mp4'`).join("\n") + "\n");
  return p;
};
const wl = list("w"), ml = list("m");
const COMMON = ["-an", "-pix_fmt", "yuv420p", "-color_primaries", "bt709", "-color_trc", "bt709", "-colorspace", "bt709", "-movflags", "+faststart"];

// archive master — near-lossless, the thing any future re-encode starts from
run(["-f", "concat", "-safe", "0", "-i", wl, "-c:v", "libx264", "-preset", "slow", "-crf", "17", ...COMMON, `${OUT}/hero-master.mp4`]);
// web — capped at the previous delivery's 3.4 Mb/s so the first thing the page
// loads does not grow. CRF 23 alone wanted 4.0 Mb/s on this cut (36.6MB); the
// cap, not the CRF, is what sets the size here, and it is set on purpose.
run(["-f", "concat", "-safe", "0", "-i", wl, "-c:v", "libx264", "-preset", "slow", "-crf", "23", "-maxrate", "3500k", "-bufsize", "7000k", ...COMMON, `${OUT}/hero-web.mp4`]);
// mobile — vertical, capped at the previous delivery's 2.6 Mb/s for the same reason
run(["-f", "concat", "-safe", "0", "-i", ml, "-c:v", "libx264", "-preset", "slow", "-crf", "24", "-maxrate", "2700k", "-bufsize", "5400k", ...COMMON, `${OUT}/hero-mobile.mp4`]);

/* ---------- 3. ship the films ---------- */
copyFileSync(`${OUT}/hero-web.mp4`, PUB_WEB);
copyFileSync(`${OUT}/hero-mobile.mp4`, PUB_MOBILE);

/* ---------- 4. poster — its own script, because it is re-judged far more often
   than the film is re-cut, and it is not a plain frame grab (see the file) ---------- */
execFileSync(process.execPath, ["scripts/prep-hero-poster.mjs"], { stdio: "inherit" });

/* ---------- 5. the timeline doc is generated from the cut, so it cannot drift from it ---------- */
const fmt = (x) => x.toFixed(1).padStart(5, "0");
const doc = `# Al Adrak Hero Film — Master Edit Timeline

${total.toFixed(1)} seconds · ${SHOTS.length} shots · 1080p25 · no text, no logos, no graphics.
Generated by \`site/scripts/prep-hero.mjs\` — edit the SHOTS table there, not this file.

Arc: THE COMPANY → PEOPLE → ENGINEERING → FACILITIES & CRAFT → PROJECTS → THE COMPANY AGAIN → NIGHT.

| Film time | Dur | Source | Src time | Shot | Purpose |
|---|---|---|---|---|---|
${rows.map((r) => `| ${fmt(r.t0)}–${fmt(r.t0 + r.dur)} | ${r.dur} | ${r.src} | ${r.at} | ${r.shot} | ${r.why} |`).join("\n")}

## Why this sequence

- **Opens on the company's own ground** — the Halban campus from the air, its gate, a factory frontal — and not on a client's landmark. The Public Prosecution HQ, the first cut's opener, now sits in the projects act in the middle of the film.
- **The staff line-up is gone.** In its place the Al Adrak-liveried truck: the one place in the library where the company name is legitimately in the scene.
- **The finale is sourced earlier in the same shot** (Ahli 133.2s, not 135.8s) so it ends before that file's closing logo animation at 138.2s, which the first cut ran straight into.
- Cuts ride camera energy; pacing is uneven on purpose (1.8s–4.6s), fastest in the machinery act, slowest at open and close; the dark plasma passage sits in the first third as a contrast valley.

## Burn-in repairs (the film contains no text or logos)

- Ahli Bank: top-right logo patched per clip (delogo x1440 y25 w430 h185); finale ends before the 138.2s logo animation.
- CWH / CWS: bottom-right watermark patched (delogo x1456 y930 w450 h95).
- AFW / NRMF: caption bar mid-lower, so each shot is re-framed to a clean 1479×832 top window (≈1.3× punch-in); the bottom-right watermark falls below that window.
- PPM: no repairs needed. Maskaan: caption-free aerial only, denoised (hqdn3d) before the 720p→1080p upscale.

In-scene physical signage (the gate sign, the truck livery, NRMF/AFW wall lettering, machine labels, vest logos, carved calligraphy) is real-world content, not graphics, and is retained.

## Outputs

- \`hero-master.mp4\` — 1080p25, CRF 17 archive master
- \`hero-web.mp4\` — web H.264 for the site hero (≈3.4 Mb/s)
- \`hero-mobile.mp4\` — 1080×1920 vertical, per-shot re-framed
- \`hero-poster.jpg\` — poster frame (1.5s into the opening shot)
`;
writeFileSync(`${OUT}/MASTER-EDIT-TIMELINE.md`, doc);

rmSync(TMP, { recursive: true, force: true });

console.log(`
film: ${total.toFixed(1)}s, ${SHOTS.length} shots
  master  ${mb(`${OUT}/hero-master.mp4`)} MB
  web     ${mb(PUB_WEB)} MB  -> ${PUB_WEB}
  mobile  ${mb(PUB_MOBILE)} MB  -> ${PUB_MOBILE}
  timeline -> ${OUT}/MASTER-EDIT-TIMELINE.md`);
