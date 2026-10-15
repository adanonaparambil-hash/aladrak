/**
 * Replace a saturated studio backdrop with white.
 *
 * Written for Riyas Mohamed's portrait, the one roster photograph shot on
 * orange while the rest of the grid is on white. It is kept because it is the
 * only step between the supplied original and what prep-portraits.mjs cuts
 * from, and a lost one-off would mean re-deriving all of the below.
 *
 *   node scripts/key-backdrop.mjs <src> <out> [feather]
 *
 * What does NOT work, measured on this photograph:
 *
 *   hue         — his skin is h=24, the backdrop h=33. Nine degrees apart.
 *   saturation  — lit skin reaches 0.89, the backdrop 0.90-0.99. A saturation
 *                 key leaks through his face and the fill then swallows the
 *                 whole figure.
 *
 * What does: the BLUE channel. The backdrop is a saturated amber carrying
 * almost no blue — 2 to 21 across the frame — where his skin carries 62.
 * Nothing on him is simultaneously this bright, this red and this
 * blue-starved.
 *
 * Even so the test is not trusted on its own. The mask is grown inwards from
 * the frame's edges, so a pixel becomes background only if it looks like the
 * backdrop AND is reachable from the border; anything enclosed by the sitter
 * is safe by construction. Genuine backdrop that he encloses is then added
 * back deliberately, as its own pass.
 *
 * The output keeps the source's dimensions, so crop fractions measured against
 * the original stay valid.
 */
/* run from site/ */
const sharp = (await import("sharp")).default;

const SRC = process.argv[2];
const OUT = process.argv[3];
const FEATHER = Number(process.argv[4] ?? 1.6);

const img = sharp(SRC).removeAlpha();
const { data, info } = await img.raw().toBuffer({ resolveWithObject: true });
const { width: W, height: H, channels: C } = info;

/*
 * Saturation was the wrong test. Lit skin on this photograph reaches 0.89,
 * the same as the backdrop, so a saturation key leaked straight through his
 * face and the fill swallowed the whole figure.
 *
 * The blue channel is what actually separates them. The backdrop is a
 * saturated amber with almost no blue in it — measured 2 to 21 across the
 * frame — while his skin carries 62. Nothing on him is simultaneously this
 * bright, this red and this blue-starved.
 */
const isBackdrop = (i) => {
  const r = data[i], g = data[i + 1], b = data[i + 2];
  return r > 140 && b < 50 && r - b > 130 && g - b > 50;
};

/* grow from every edge pixel inwards */
const mask = new Uint8Array(W * H);
const stack = [];
const push = (x, y) => {
  if (x < 0 || y < 0 || x >= W || y >= H) return;
  const p = y * W + x;
  if (mask[p]) return;
  if (!isBackdrop(p * C)) return;
  mask[p] = 1;
  stack.push(p);
};
for (let x = 0; x < W; x++) { push(x, 0); push(x, H - 1); }
for (let y = 0; y < H; y++) { push(0, y); push(W - 1, y); }
while (stack.length) {
  const p = stack.pop();
  const x = p % W, y = (p - x) / W;
  push(x + 1, y); push(x - 1, y); push(x, y + 1); push(x, y - 1);
}

/*
 * The border fill cannot reach backdrop that he encloses — and there is some:
 * a wedge of it shows through the gap between his right temple and the arm of
 * his glasses. Left alone it is the one orange thing in a white frame.
 *
 * Found with the same strict test, so nothing on him qualifies (his skin
 * carries far too much blue), then dilated a little: the test catches only the
 * core of the wedge, while its edge fades through colours too mixed to name.
 */
{
  const seen = new Uint8Array(W * H);
  const pocket = [];
  for (let p0 = 0; p0 < W * H; p0++) {
    if (mask[p0] || seen[p0] || !isBackdrop(p0 * C)) continue;
    const st = [p0];
    seen[p0] = 1;
    while (st.length) {
      const p = st.pop(), x = p % W, y = (p - x) / W;
      pocket.push(p);
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const nx = x + dx, ny = y + dy;
        if (nx < 0 || ny < 0 || nx >= W || ny >= H) continue;
        const q = ny * W + nx;
        if (seen[q] || mask[q] || !isBackdrop(q * C)) continue;
        seen[q] = 1;
        st.push(q);
      }
    }
  }
  const R = 3;
  for (const p of pocket) {
    const x = p % W, y = (p - x) / W;
    for (let dy = -R; dy <= R; dy++) {
      for (let dx = -R; dx <= R; dx++) {
        if (dx * dx + dy * dy > R * R) continue;
        const nx = x + dx, ny = y + dy;
        if (nx < 0 || ny < 0 || nx >= W || ny >= H) continue;
        mask[ny * W + nx] = 1;
      }
    }
  }
  console.log(`enclosed backdrop pockets: ${pocket.length} px, dilated by ${R}`);
}

const claimed = mask.reduce((n, v) => n + v, 0);
console.log(`backdrop reached from the edges: ${claimed} px (${((claimed / (W * H)) * 100).toFixed(1)}%)`);

/*
 * Soften the boundary so the cut-out does not look stamped on.
 *
 * sharp does NOT hand a one-channel raw buffer back as one channel — it
 * promotes it, and this blur returned three. Reading it at `mask[p]` walked a
 * third of the way through the image and produced horizontal banding plus a
 * ghosted figure, which looked exactly like a bad key and was not one. Take
 * the channel count from the result and stride by it.
 */
const { data: maskBuf, info: mi } = await sharp(
  Buffer.from(mask.map((v) => (v ? 255 : 0))),
  { raw: { width: W, height: H, channels: 1 } }
)
  .blur(FEATHER)
  .raw()
  .toBuffer({ resolveWithObject: true });
const MC = mi.channels;
console.log(`mask after blur: ${mi.width}x${mi.height} ch=${MC} bytes=${maskBuf.length}`);

/* composite onto white, and pull the orange cast out of the soft edge */
const out = Buffer.alloc(W * H * 3);
for (let p = 0; p < W * H; p++) {
  const a = maskBuf[p * MC] / 255;                   // 1 = backdrop
  const i = p * C, o = p * 3;
  for (let ch = 0; ch < 3; ch++) {
    let v = data[i + ch];
    if (a > 0.02 && a < 0.98) {
      /* a half-covered edge pixel is part subject, part orange; lift it
         towards neutral so no rim of backdrop survives the blend */
      const lum = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
      v = v + (lum - v) * 0.45 * (1 - Math.abs(a - 0.5) * 2);
    }
    out[o + ch] = Math.round(v * (1 - a) + 255 * a);
  }
}

await sharp(out, { raw: { width: W, height: H, channels: 3 } })
  .jpeg({ quality: 94, mozjpeg: true })
  .toFile(OUT);
console.log(`wrote ${OUT}`);
