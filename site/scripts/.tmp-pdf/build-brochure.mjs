/**
 * Brochure build, from the ORIGINAL file every time.
 *
 *   1. drop the Corporate Adviser spread (printed 10-11) and its contents line;
 *   2. drop the people who were removed (Joseph Thampan, Ajith Kumar, Sunil
 *      Sasidharan, Arun Amruthakumar, Bejoy G, Muzna Al Busaidi, Shurooq Al Rashdi, Mathai T);
 *   3. lay out everyone who remains — 22 people, photograph, name and title, no
 *      biographies — across two spreads, six to a row, two rows to a spread:
 *      pages 10-11 (a new spread, in the gap the Corporate Adviser pages left) and
 *      pages 12-13 (the old first Key Personnel page, rebuilt);
 *   4. put "Key Personnel" in the contents at 10;
 *   5. drop the old continuation spread (14-15), which no longer has anyone on it.
 *
 * Every page is a two-page SPREAD, 1530.71 x 566.93 pt. Boxes are in page space
 * (points, origin top-left, y down); PDF's own space is bottom-up, converted at use.
 *
 * HOW A PAGE IS REBUILT. Removal is real redaction, never a white box: a box leaves
 * the photograph and the text in the file, one text-extraction away. Page furniture
 * (headings, gold corner tabs, folios) is kept by redacting only the people's areas.
 * Anything that has to MOVE is cut out of its own copy of the page by redacting
 * everything outside its box, so each piece of text exists exactly once (redrawing
 * the whole page once per mover under a clip looks right but doubles the text in the
 * file). Text is set fresh in the brochure's own TT Norms, from its embedded subsets.
 *
 * THE GRID. Three photographs to a page, six to a spread, two rows: the pages are
 * 765pt wide with 51pt margins, which leaves 663pt a page; three 180pt photographs and
 * two 61.5pt gutters fill it exactly, and the 51pt inner margins mean nothing crosses
 * the fold (the centre line is 765.4). The photographs are the website's portraits
 * (500x600, sharp enough to enlarge; the brochure's own were 203x217 and would blur at
 * this size), cropped from the top to 180:photoH so every face is whole (see cropTop and pad on the two
 * close-ups that a plain crop would clip).
 */
import * as mupdf from "mupdf";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
const sharp = createRequire("E:/ITS48/Development/Adraklive/site/package.json")("sharp");

/* The pristine 62-page original. It had been pointed at a BUILT copy in
   Downloads, which is why a rebuild asserted out on page 8 — that file is an
   output, not an input, and this script rebuilds from the original every time. */
const SRC = "E:/ITS48/Development/Adraklive/271022124050Aladrak_Main_Brochure_35th_yr_Low_Res (1).pdf";
const OUT = process.argv[2];
const TILES = "E:/ITS48/Development/Adraklive/site/public/images/team/roster";
const H = 566.929, W = 1530.71;
const srcBytes = readFileSync(SRC);
const doc = new mupdf.PDFDocument(srcBytes);

/* ------------------------------------------------------------------ fonts */
const fontStream = (baseFont) => {
  const fonts = doc.loadPage(7).getObject().getInheritable("Resources").get("Font");
  let found = null;
  fonts.forEach((v) => {
    const f = v.resolve();
    if (f.get("BaseFont").toString().endsWith("+" + baseFont)) found = f.get("FontDescriptor").get("FontFile3").readStream();
  });
  if (!found) throw new Error("font not on page 8: " + baseFont);
  return found;
};
const REG = new mupdf.Font("TTNorms-Regular", fontStream("TTNorms-Regular"));
const BOLD = new mupdf.Font("TTNorms-Bold", fontStream("TTNorms-Bold"));
const MED = new mupdf.Font("TTNorms-Medium", fontStream("TTNorms-Medium"));
const LIGHT = new mupdf.Font("TTNorms-Light", fontStream("TTNorms-Light"));
const fontObj = {
  FReg: doc.addSimpleFont(REG, "Latin"), FBold: doc.addSimpleFont(BOLD, "Latin"),
  FMed: doc.addSimpleFont(MED, "Latin"), FLight: doc.addSimpleFont(LIGHT, "Latin"),
};
const FONT = { FReg: REG, FBold: BOLD, FMed: MED, FLight: LIGHT };
/* addSimpleFont labels a bare CFF program /CIDFontType0C, the wrong subtype for a simple
   Type1 font: mupdf shrugs, stricter viewers substitute a face, poppler warns. The
   brochure's own fonts say /Type1C; so do these. */
for (const o of Object.values(fontObj)) o.get("FontDescriptor").get("FontFile3").put("Subtype", doc.newName("Type1C"));

/* The Regular subset has no "/" ("QA/QC"); the slash alone comes from Medium, the nearest weight that has one. */
const advance = (font, c) => {
  const g = font.encodeCharacter(c.codePointAt(0));
  if (!g && font === REG && c === "/") return MED.advanceGlyph(MED.encodeCharacter(47));
  return font.advanceGlyph(g);
};
const width = (font, s, size) => [...s].reduce((w, c) => w + advance(font, c) * size, 0);
const wrap = (font, s, size, max) => {
  const out = []; let line = "";
  for (const w of s.split(" ")) {
    const t = line ? line + " " + w : w;
    if (width(font, t, size) <= max || !line) line = t; else { out.push(line); line = w; }
  }
  if (line) out.push(line);
  return out;
};
/* "Title - Dept" stays on one line when it fits; otherwise it is stacked, title over department,
   instead of breaking mid-phrase. */
function desigLines(text, size, max) {
  if (width(REG, text, size) <= max) return [text];
  const [title, dept] = text.split(" - ");
  if (dept === undefined) return wrap(REG, text, size, max);
  return [...wrap(REG, title, size, max), ...wrap(REG, dept, size, max)];
}

const re = ([x0, y0, x1, y1]) => `${x0} ${H - y1} ${x1 - x0} ${y1 - y0} re`;
const num = (v) => (Math.round(v * 1000) / 1000).toString();
const pdfStr = (s) => "(" + s.replace(/([()\\])/g, "\\$1") + ")";
/** One line of text. A glyph the subset lacks would draw as a blank box, so it is an error. */
function T(key, size, x, base, text) {
  if (key === "FReg" && text.includes("/")) {
    let out = "", cx = x;
    for (const seg of text.split(/(\/)/).filter(Boolean)) {
      const k = seg === "/" ? "FMed" : "FReg";
      out += T(k, size, cx, base, seg);
      cx += width(FONT[k], seg, size);
    }
    return out;
  }
  for (const ch of text) {
    if (FONT[key].encodeCharacter(ch.codePointAt(0)) === 0) throw new Error(`font ${key} has no glyph for "${ch}" (in "${text}")`);
  }
  return `BT /${key} ${size} Tf 0 g 1 0 0 1 ${num(x)} ${num(H - base)} Tm ${pdfStr(text)} Tj ET\n`;
}

/* ------------------------------------------------------------------ pdf helpers */
function redact(page, rects, lineArt) {
  for (const r of rects) page.createAnnotation("Redact").setRect(r);
  page.applyRedactions(false, mupdf.PDFPage.REDACT_IMAGE_REMOVE, lineArt, mupdf.PDFPage.REDACT_TEXT_REMOVE);
}
function contentBytes(po) {
  const c = po.get("Contents");
  return c.isArray()
    ? Buffer.concat(Array.from({ length: c.length }, (_, i) => Buffer.concat([c.get(i).readStream(), Buffer.from("\n")])))
    : c.readStream();
}
function asForm(bytes, resources) {
  const d = doc.newDictionary();
  d.put("Type", doc.newName("XObject"));
  d.put("Subtype", doc.newName("Form"));
  const bbox = doc.newArray();
  [0, 0, W, H].forEach((v) => bbox.push(doc.newReal(v)));
  d.put("BBox", bbox);
  d.put("Resources", resources);
  return doc.addStream(bytes, d);
}
/** A cut-out of one box (plus optional extra redactions) from a fresh copy of an ORIGINAL page. */
function cut(srcPage, keep, extraRedact = []) {
  const seg = new mupdf.PDFDocument(srcBytes);
  const sp = seg.loadPage(srcPage - 1);
  const [x0, y0, x1, y1] = keep;
  redact(sp, [[0, 0, W, y0], [0, y1, W, H], [0, y0, x0, y1], [x1, y0, W, y1], ...extraRedact],
    mupdf.PDFPage.REDACT_LINE_ART_REMOVE_IF_TOUCHED);
  const spo = sp.getObject();
  return asForm(contentBytes(spo), doc.newGraftMap().graftObject(spo.getInheritable("Resources")));
}
/** Rebuild one page from itself with `rest` redacted, translated cut-outs, placed photographs and fresh text. */
function assemble(page, p) {
  redact(page, p.rest, mupdf.PDFPage.REDACT_LINE_ART_REMOVE_IF_COVERED);
  const po = page.getObject();
  const forms = { Rest: asForm(contentBytes(po), po.getInheritable("Resources")) };
  let cs = "/Rest Do\n";
  p.pieces.forEach((pc, i) => {
    forms["P" + i] = pc.form;
    cs += `q 1 0 0 1 ${num(pc.dx)} ${num(-pc.dy)} cm /P${i} Do Q\n`;
  });
  (p.images ?? []).forEach((im, i) => {
    forms["Im" + i] = im.obj;
    cs += `q ${num(im.w)} 0 0 ${num(im.h)} ${num(im.x)} ${num(H - im.top - im.h)} cm /Im${i} Do Q\n`;
  });
  cs += p.text;
  const xo = doc.newDictionary();
  for (const [k, v] of Object.entries(forms)) xo.put(k, v);
  const fd = doc.newDictionary();
  for (const [k, v] of Object.entries(fontObj)) fd.put(k, v);
  const res = doc.newDictionary();
  res.put("XObject", xo);
  res.put("Font", fd);
  po.put("Resources", res);
  po.put("Contents", doc.addStream(Buffer.from(cs), doc.newDictionary()));
}

/* ------------------------------------------------------------------ the people
   In order: the directors, the Chief Executive Officer and the group officer; the Advisor;
   then the website's roster order (VPs, GMs, DGMs, the AGM, managers, the CRM lead);
   Mathai T, who is not on the website, last. Names are the brochure's own spellings for
   the people it already had, and the website's for the rest. Titles are the website's. */
const PEOPLE = [
  { name: "Varsha Roy", role: "Executive Director", tile: "varsha" },
  { name: "Ayyappadas Chandrasekhar", role: "Chief Operating Officer", tile: "ayyappadas" },
  { name: "Riyas Mohamed", role: "Chief Executive Officer", tile: "riyas" },
  { name: "Earnest V J Shabu", role: "Group Chief Strategy & Transformation Director", tile: "earnest" },
  { name: "Biju K. Mammen", role: "Advisor - Plant & Machinery", tile: "biju" },
  { name: "Mahmood Masoud Rashid Al Ghafri", role: "Vice President - HR & Administration", tile: "mahmood" },
  { name: "Richard Sequira", role: "Vice President - Group Facilities, Agriculture & Carbon", tile: "richard" },
  { name: "Tibi John", role: "Vice President - Group Funding & Financial Advisory", tile: "tibi" },
  { name: "Hari Prasad Shetty", role: "General Manager - Tendering & QS", tile: "hariprasad" },
  { name: "Rajan P", role: "General Manager - Projects & Development", tile: "rajan" },
  { name: "Anoop Das", role: "General Manager - Design & Build", tile: "anoop" },
  { name: "Visakh U B", role: "General Manager - Project Management & Controls", tile: "visakh" },
  { name: "Iman Al Shaafari", role: "General Manager - Finance & Accounts", tile: "iman" },
  { name: "Kausthubh Rai", role: "General Manager - QA/QC & Training", tile: "kausthubh" },
  { name: "Gnanasekaran Thangavelu", role: "General Manager - Production & PT", tile: "gnanasekaran" },
  { name: "Adv. Farah Mukhtar", role: "Deputy General Manager - Contracts & Claims", tile: "farah" },
  { name: "Hauriya Hassan Hussain Al Balushi", role: "Deputy General Manager - Operations & Follow-up", tile: "huriya" },
  { name: "Nauf Abdullah Sabil Al Bulushi", role: "Deputy General Manager - Projects", tile: "nauf" },
  { name: "Amani Said Humaid Masoud Al Ofi", role: "Deputy General Manager - Finance & Accounts, Real Estate", tile: "amani-al-ofi" },
  { name: "Vinod PV Pillai", role: "Assistant General Manager - IT", tile: "vinod" },
  { name: "Sayed Iftikhar Ali", role: "Senior Manager - HSE", tile: "iftikhar" },
  // His beard sits low in a tight tile, so the crop starts 12px down (the turban has 20px to spare above it).
  { name: "Nawaf Khamis Shir Mohammed Al Zadjali", role: "Manager - HR", tile: "nawaf", cropTop: 12 },
  // Her tile is a close-up (scarf to chin fills 90% of its height), so no 180:164 crop of it can hold her whole
  // face. Her background is plain white, so the whole portrait is scaled to the frame's height and the white is
  // extended left and right: invisible on the page, and nothing is cut.
  { name: "Amani Ahmed Juma Al Zadjali", role: "Adrak Developers - CRM Lead", tile: "amani-zadjali", pad: true },
];
/* Mathai T (Manager - Welfare & Training) was in the brochure but not on the website; removed at the client's request. */

/* ------------------------------------------------------------------ the grid */
const PW = 180;                                       // photograph width
const COLS = [51, 51 + (663 - PW) / 2, 51 + (663 - PW), 817, 817 + (663 - PW) / 2, 817 + (663 - PW)];
const TOP1 = 92;                                      // clears the heading by 16pt
const NAME_SIZE = 11, TITLE_SIZE = 9.8, LEAD = 12, TEXT_MAX = PW - 4;
const FIRST = 15.4;                                   // photograph foot to first baseline
const BOTTOM = 530;                                   // lowest a line may end: 37pt clear of the edge (the folios start at 546)
const GAP = 24;                                       // between one row's text and the next row's photographs
const PER = Math.ceil(PEOPLE.length / 2);              // 22 people: eleven on each spread (six in the top row, five below)

// text for every card, then the photograph height that fills the page exactly
const lay = PEOPLE.map((p) => ({ ...p, nameLines: wrap(BOLD, p.name, NAME_SIZE, TEXT_MAX), roleLines: desigLines(p.role, TITLE_SIZE, TEXT_MAX) }));
lay.forEach((p) => { p.lines = p.nameLines.length + p.roleLines.length; });
const blockH = (lines) => FIRST + LEAD * (lines - 1) + 3;
const rowsOf = (people) => [people.slice(0, 6), people.slice(6, 12)];
const textH = (people) => rowsOf(people).map((r) => blockH(Math.max(0, ...r.map((p) => p.lines))));
let PH = Infinity;
for (const sp of [lay.slice(0, PER), lay.slice(PER)]) {
  const [a1, a2] = textH(sp);
  PH = Math.min(PH, Math.floor((BOTTOM - TOP1 - a1 - a2 - GAP) / 2));
}
console.log(`photograph ${PW} x ${PH}pt  (was 144 x 153)`);
const CROP_H = Math.round((500 * PH) / PW);           // tile rows used: top-anchored, 500 wide

/* ------------------------------------------------------------------ page 3: contents */
const pages = {
  3: { rest: [[95, 182, 285, 201], [95, 201.5, 285, 480]], pieces: [], text: "" },
  8: { rest: [], pieces: [], images: [], text: "" },
};
// lose the Corporate Adviser line and pull the rest of that column up one line; "Key Personnel" now starts on 10,
// redrawn in the line's own font (Light 10pt) from where the old "12" began, which keeps its 2pt gap to the dots
pages[3].pieces.push({ form: cut(3, [95, 201.5, 285, 480], [[262.6, 204.9, 272.8, 215.9]]), dx: 0, dy: -19.6 });
pages[3].text += T("FLight", 10, 263.2, 214.1 - 19.6, "10");

/* ------------------------------------------------------------------ placing a card */
async function photoFor(p) {
  const file = `${TILES}/${p.tile}.jpg`;
  let jpg;
  if (p.pad) {
    const OW = 500, OH = Math.round((500 * PH) / PW);               // output size, in tile pixels
    const inner = await sharp(file).resize({ height: OH }).toBuffer();
    const iw = (await sharp(inner).metadata()).width, side = Math.floor((OW - iw) / 2);
    jpg = await sharp(inner).extend({ left: side, right: OW - iw - side, background: { r: 254, g: 254, b: 254 } })
      .jpeg({ quality: 92, mozjpeg: true }).toBuffer();
  } else {
    jpg = await sharp(file).extract({ left: 0, top: p.cropTop ?? 0, width: 500, height: CROP_H })
      .jpeg({ quality: 92, mozjpeg: true }).toBuffer();
  }
  return doc.addImage(new mupdf.Image(jpg));
}
async function place(target, p, idx, rowTops) {
  const col = idx % 6, row = idx < 6 ? 0 : 1, x = COLS[col], top = rowTops[row];
  target.images.push({ obj: await photoFor(p), x, top, w: PW, h: PH });
  let base = top + PH + FIRST;
  for (const t of p.nameLines) { target.text += T("FBold", NAME_SIZE, x - 0.3, base, t); base += LEAD; }
  for (const t of p.roleLines) { target.text += T("FReg", TITLE_SIZE, x - 0.3, base, t); base += LEAD; }
}
const rowTopsFor = (people) => { const [a1] = textH(people); return [TOP1, TOP1 + PH + a1 + GAP]; };

/* ------------------------------------------------------------------ page 12-13 (the old first Key Personnel page) */
// clear all eight of its people (headings, tabs and folios stay)
const OLD_COLS = [[46, 206], [215, 375], [379, 539], [543, 703], [839, 999], [1002, 1162], [1167, 1327], [1331, 1491]];
for (const [l, r] of OLD_COLS) pages[8].rest.push([l, 80, r, 283], [l, 283, r, 545]);
// its big heading becomes the small "(continued)" the later pages carry — lifted from page 14 (same file, same font)
pages[8].rest.push([40, 36, 320, 80]);
pages[8].pieces.push({ form: cut(9, [45, 58, 230, 80]), dx: 0, dy: 0 });
const second = lay.slice(PER);
{ const tops = rowTopsFor(second); for (const [i, p] of second.entries()) await place(pages[8], p, i, tops); }

for (const [n, p] of Object.entries(pages)) {
  assemble(doc.loadPage(Number(n) - 1), p);
  console.log(`page ${n}: ${p.pieces.length} pieces, ${(p.images ?? []).length} photographs`);
}

/* the Corporate Adviser spread, last so the page numbers above stay valid */
doc.deletePage(6);

/* ================================================================== the new spread, printed 10-11
 * A copy of the first Key Personnel page (big gold heading, corner tabs, margins) with its people
 * cleared and its folios swapped for "10" and "11", lifted from the spread just removed. */
doc.graftPage(6, new mupdf.PDFDocument(srcBytes), 7);
const np = doc.loadPage(6);
const spread = { rest: [], pieces: [], images: [], text: "" };
for (const [l, r] of OLD_COLS) spread.rest.push([l, 80, r, 283], [l, 283, r, 545]);
spread.rest.push([8, 543, 26, 560], [1505, 543, 1525, 560]);
spread.pieces.push({ form: cut(7, [8, 543, 26, 560]), dx: 0, dy: 0 }, { form: cut(7, [1505, 543, 1525, 560]), dx: 0, dy: 0 });
const first = lay.slice(0, PER);
{ const tops = rowTopsFor(first); for (const [i, p] of first.entries()) await place(spread, p, i, tops); }
assemble(np, spread);

/* The old continuation spread (printed 14-15) has nobody left on it. It is the original, untouched
   page 9 (never rebuilt above), now at index 8 behind the new spread. */
if (!/Rajan is a Civil/.test(doc.loadPage(8).toStructuredText().asText())) throw new Error("page index 8 is not the continuation spread");
doc.deletePage(8);
console.log("pages:", doc.countPages());
for (const [name, sp] of [["10-11", first], ["12-13", second]]) {
  const tops = rowTopsFor(sp), [a1, a2] = textH(sp);
  console.log(`spread ${name}: ${sp.length} people, rows at ${tops.map((t) => t.toFixed(0)).join(" / ")}, lowest text ends y${(tops[1] + PH + a2).toFixed(0)}`);
}
doc.save(OUT, "garbage=deduplicate,compress");
console.log("saved", OUT);
