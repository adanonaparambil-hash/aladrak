/**
 * The cover roundel: 35 years -> 40 years.
 *
 *   node scripts/.tmp-pdf/fix-badge.mjs <in.pdf> <badge.png> <out.pdf>
 *
 * The original roundel is not text. It is vector outlines in a high-contrast
 * serif that is embedded nowhere in the file, so there is no way to set a
 * matching "40" with what the PDF carries — the only faces available are TT
 * Norms (a geometric sans) and Klavika. Rather than set the number in a face
 * that would read as wrong on a cover, the whole roundel is redrawn in
 * Cormorant Garamond, which is the serif the website already uses for this
 * company's own anniversary typography, rendered in a browser at 3x and placed
 * as an image.
 *
 * Alignment is measured off the original, not guessed:
 *   ring   99.5pt across, centred (678.0, 86.3)   [scan for the pale ring]
 *   teal   #113c4a, and flat for 50pt in every direction around the badge,
 *          so the replacement's own background covers the old artwork with no
 *          visible seam and nothing needs redacting.
 * The rendered badge puts its ring at 92.2% of its own width, so it is placed
 * at 99.5 / 0.922 = 107.9pt square, centred on the same point.
 */
import * as mupdf from "mupdf";
import { readFileSync } from "node:fs";

const [IN, BADGE, OUT] = process.argv.slice(2);
if (!IN || !BADGE || !OUT) throw new Error("usage: fix-badge.mjs <in.pdf> <badge.png> <out.pdf>");

const doc = mupdf.Document.openDocument(readFileSync(IN), "application/pdf");
const H = 566.93;

const RING_D = 99.5;
const CX = 678.0;
const CY = 86.3;
const RING_FRACTION = 0.922; // the ring's share of the rendered badge's width
const SIZE = RING_D / RING_FRACTION;

const x = CX - SIZE / 2;
const yTop = CY - SIZE / 2;
console.log(`placing badge ${SIZE.toFixed(2)}pt square at x=${x.toFixed(2)} top=${yTop.toFixed(2)}`);

const img = doc.addImage(new mupdf.Image(readFileSync(BADGE)));

const page = doc.loadPage(0);
const po = page.getObject();
const contents = po.get("Contents");
/* readStream() hands back a mupdf Buffer, which Node's Buffer.concat will not
   take across the module boundary; asUint8Array() is the way out of it. */
const raw = (b) => Buffer.from(b.asUint8Array());
const bytes = contents.isArray()
  ? Buffer.concat(Array.from({ length: contents.length }, (_, i) =>
      Buffer.concat([raw(contents.get(i).readStream()), Buffer.from("\n")])))
  : raw(contents.readStream());

const form = (() => {
  const d = doc.newDictionary();
  d.put("Type", doc.newName("XObject"));
  d.put("Subtype", doc.newName("Form"));
  const bbox = doc.newArray();
  [0, 0, 765.35, H].forEach((v) => bbox.push(doc.newReal(v)));
  d.put("BBox", bbox);
  d.put("Resources", po.getInheritable("Resources"));
  return doc.addStream(bytes, d);
})();

/* the old roundel stays underneath and is simply covered: the badge carries the
   same flat teal, so there is nothing to redact and no edge to blend */
const cs =
  "/Rest Do\n" +
  `q ${SIZE.toFixed(3)} 0 0 ${SIZE.toFixed(3)} ${x.toFixed(3)} ${(H - yTop - SIZE).toFixed(3)} cm /Badge Do Q\n`;

const xo = doc.newDictionary();
xo.put("Rest", form);
xo.put("Badge", img);
const res = doc.newDictionary();
res.put("XObject", xo);
po.put("Resources", res);
po.put("Contents", doc.addStream(Buffer.from(cs), doc.newDictionary()));

doc.save(OUT, "garbage=deduplicate,compress");
console.log("saved", OUT);
