/**
 * "Over 35 Years" -> "Over 40 Years" in the brochure's Overview paragraph.
 *
 * Run AFTER build-brochure.mjs, on its output:
 *   node scripts/.tmp-pdf/fix-years.mjs <in.pdf> <out.pdf>
 *
 * Only the two digits are touched. They are live text in TTNorms-Light 10pt, so
 * the digits are redacted and redrawn in the same font at the same size on the
 * same baseline — measured, not guessed: the cap height of the "O" in "Over"
 * puts the baseline at y=136.00pt, and TT Norms has tabular figures, so "40"
 * occupies exactly the width "35" did and nothing after it shifts.
 *
 * NOT touched, deliberately:
 *   - the contents page, where "35" is a page number;
 *   - the folios on the Infrastructure spread, likewise;
 *   - the gold 35-years roundel on the COVER. That one is vector outlines in a
 *     high-contrast serif that is not embedded anywhere in the file, so there is
 *     no way to set a matching "40" — redrawing it in the only face available
 *     (TT Norms, a geometric sans) would look obviously wrong on a cover. It
 *     needs the designer's own artwork.
 */
import * as mupdf from "mupdf";
import { readFileSync } from "node:fs";

const IN = process.argv[2];
const OUT = process.argv[3];
if (!IN || !OUT) throw new Error("usage: fix-years.mjs <in.pdf> <out.pdf>");

const doc = mupdf.Document.openDocument(readFileSync(IN), "application/pdf");
const H = 566.93;
const SIZE = 10;
const BASE = 136.0; // measured off the cap height of the "O" in "Over"
const LINE_X = 56; // where the paragraph's line begins

/* the font, taken from the file itself so the digits match exactly */
const fontStream = (baseFont) => {
  const fonts = doc.loadPage(7).getObject().getInheritable("Resources").get("Font");
  let found = null;
  fonts.forEach((v) => {
    const f = v.isIndirect() ? v.resolve() : v;
    if (f.get("BaseFont").toString().endsWith("+" + baseFont)) {
      found = f.get("FontDescriptor").get("FontFile3").readStream();
    }
  });
  if (!found) throw new Error("TTNorms-Light not found");
  return found;
};
const LIGHT = new mupdf.Font("TTNorms-Light", fontStream("TTNorms-Light"));
const fontRef = doc.addSimpleFont(LIGHT, "Latin");
/* addSimpleFont labels a bare CFF program /CIDFontType0C, the wrong subtype for a
   simple Type1 font — stricter viewers substitute a face, and the digits stop
   extracting as text. The brochure's own fonts say /Type1C; so does this one. */
fontRef.get("FontDescriptor").get("FontFile3").put("Subtype", doc.newName("Type1C"));

const width = (text) =>
  [...text].reduce((w, ch) => w + LIGHT.advanceGlyph(LIGHT.encodeCharacter(ch.codePointAt(0))) * SIZE, 0);

/* find the page carrying the sentence */
let target = -1;
for (let i = 0; i < doc.countPages(); i++) {
  if (/Over 35 Years/.test(doc.loadPage(i).toStructuredText().asText())) { target = i; break; }
}
if (target < 0) throw new Error('"Over 35 Years" not found — already fixed, or the wording changed');
console.log("found on page index", target);

const x35 = LINE_X + width("Over ");
const w35 = width("35");
console.log(`"35" sits at x=${x35.toFixed(2)}pt, width ${w35.toFixed(2)}pt; "40" is ${width("40").toFixed(2)}pt`);

const page = doc.loadPage(target);
page.createAnnotation("Redact").setRect([x35 - 0.4, BASE - 8, x35 + w35 + 0.4, BASE + 2.4]);
page.applyRedactions(false, mupdf.PDFPage.REDACT_IMAGE_NONE,
  mupdf.PDFPage.REDACT_LINE_ART_NONE, mupdf.PDFPage.REDACT_TEXT_REMOVE);

/* wrap what is left as a form, then draw the new digits over it */
const po = page.getObject();
const contents = po.get("Contents");
const bytes = contents.isArray()
  ? Buffer.concat(Array.from({ length: contents.length }, (_, i) =>
      Buffer.concat([contents.get(i).readStream(), Buffer.from("\n")])))
  : contents.readStream();

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

const cs =
  "/Rest Do\n" +
  `BT /FLight ${SIZE} Tf 0 g 1 0 0 1 ${x35.toFixed(2)} ${(H - BASE).toFixed(2)} Tm (40) Tj ET\n`;

const xo = doc.newDictionary();
xo.put("Rest", form);
const fd = doc.newDictionary();
fd.put("FLight", fontRef);
const res = doc.newDictionary();
res.put("XObject", xo);
res.put("Font", fd);
po.put("Resources", res);
po.put("Contents", doc.addStream(Buffer.from(cs), doc.newDictionary()));

doc.save(OUT, "garbage=deduplicate,compress");
console.log("saved", OUT);
