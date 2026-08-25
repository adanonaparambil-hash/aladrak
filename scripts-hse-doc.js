/**
 * Build a Word document of the HSE page — every heading, paragraph, pillar,
 * certification and photograph that the live page carries, in the same order,
 * so it can be handed to someone who is not looking at the website.
 *
 * The copy is read out of lib/content.ts rather than retyped here, so the
 * document cannot drift from the page: if the page is edited and this is re-run,
 * the document follows.
 */
const fs = require("fs");
// docx is not a dependency of the site — it is only needed to produce this
// document, so it is resolved from wherever npm put it rather than added to
// package.json and shipped in every build.
const DOCX = (() => {
  for (const p of ["docx", "C:/Users/ITS48/node_modules/docx"]) {
    try {
      return require(p);
    } catch {
      /* try the next */
    }
  }
  throw new Error("docx module not found — run: npm install docx");
})();
const {
  Document, Packer, Paragraph, TextRun, ImageRun, HeadingLevel,
  AlignmentType, BorderStyle, Table, TableRow, TableCell, WidthType, ShadingType,
} = DOCX;

const SITE = "E:/ITS48/Development/Adraklive/site";
const OUT = "E:/ITS48/Development/Adraklive/Al-Adrak-HSE-page.docx";

/* ---------- read the page's own content ---------- */
const src = fs.readFileSync(SITE + "/lib/content.ts", "utf8");
const block = src.slice(src.indexOf("export const hse ="), src.indexOf("export const careers"));

const field = (name) => {
  const m = block.match(new RegExp(name + ':\\s*\\n?\\s*"((?:[^"\\\\]|\\\\.)*)"'));
  return m ? m[1].replace(/\\"/g, '"') : "";
};
const nested = (obj, name) => {
  const o = block.slice(block.indexOf(obj + ": {"));
  const m = o.match(new RegExp(name + ':\\s*"((?:[^"\\\\]|\\\\.)*)"'));
  return m ? m[1].replace(/\\"/g, '"') : "";
};
const listOf = (name, keys) => {
  const start = block.indexOf(name + ": [");
  const end = block.indexOf("],", start);
  const chunk = block.slice(start, end);
  const rows = [];
  for (const line of chunk.split("\n")) {
    if (!line.includes("{")) continue;
    const row = {};
    let ok = true;
    for (const k of keys) {
      const m = line.match(new RegExp(k + ':\\s*(?:asset\\(")?"?((?:[^"\\\\]|\\\\.)*)"?\\)?"?\\s*(?:,|})'));
      if (!m) { ok = false; break; }
      row[k] = m[1].replace(/\\"/g, '"');
    }
    if (ok) rows.push(row);
  }
  return rows;
};

const hse = {
  kicker: field("kicker"),
  title: field("title"),
  lead: field("lead"),
  trainingQuote: field("trainingQuote"),
  centre: {
    title: nested("centre", "title"),
    body: nested("centre", "body"),
    img: (block.match(/centre: \{[\s\S]*?img: asset\("([^"]+)"\)/) || [])[1],
  },
  pillars: listOf("pillars", ["no", "title", "desc"]),
  gallery: listOf("gallery", ["src", "label"]),
  certs: listOf("certs", ["code", "desc"]),
};

for (const [k, v] of Object.entries({ kicker: hse.kicker, title: hse.title, lead: hse.lead })) {
  if (!v) throw new Error("could not read " + k + " from content.ts");
}
if (!hse.pillars.length || !hse.gallery.length || !hse.certs.length) {
  throw new Error("a list came back empty — the parser and content.ts have diverged");
}

/* ---------- image helper ---------- */
const GOLD = "9A7B32";
const INK = "1A1F1C";

function picture(relPath, caption, widthPx = 560) {
  const file = SITE + "/public" + relPath.replace(/^\/aladrak/, "");
  const data = fs.readFileSync(file);
  // every source is 4:3 or thereabouts; read it back so the aspect is honest
  const sizeOf = (buf) => {
    // minimal JPEG SOF scan
    let i = 2;
    while (i < buf.length) {
      if (buf[i] !== 0xff) { i++; continue; }
      const marker = buf[i + 1];
      if (marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc) {
        return { h: buf.readUInt16BE(i + 5), w: buf.readUInt16BE(i + 7) };
      }
      i += 2 + buf.readUInt16BE(i + 2);
    }
    return { w: 4, h: 3 };
  };
  const { w, h } = sizeOf(data);
  const out = [
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 240, after: 80 },
      children: [
        new ImageRun({
          type: "jpg",
          data,
          transformation: { width: widthPx, height: Math.round((widthPx * h) / w) },
        }),
      ],
    }),
  ];
  if (caption) {
    out.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 240 },
        children: [new TextRun({ text: caption, size: 18, italics: true, color: "666666" })],
      })
    );
  }
  return out;
}

const rule = () =>
  new Paragraph({
    spacing: { before: 120, after: 240 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: "D8D2C4" } },
    children: [],
  });

/* ---------- build ---------- */
const children = [];

// title block
children.push(
  new Paragraph({
    spacing: { after: 60 },
    children: [new TextRun({ text: hse.kicker.toUpperCase(), bold: true, size: 18, color: GOLD, characterSpacing: 60 })],
  }),
  new Paragraph({
    heading: HeadingLevel.TITLE,
    spacing: { after: 200 },
    children: [new TextRun({ text: hse.title, size: 56, color: INK })],
  }),
  new Paragraph({
    spacing: { after: 200 },
    children: [new TextRun({ text: hse.lead, size: 22 })],
  })
);

children.push(...picture(hse.gallery.find((g) => g.src.includes("ppe-wall"))?.src || hse.gallery[0].src,
  "The personal protective equipment wall at the training centre"));

children.push(rule());

// certifications
children.push(
  new Paragraph({ heading: HeadingLevel.HEADING_1, spacing: { after: 160 }, children: [new TextRun({ text: "Certifications", color: INK })] }),
  new Table({
    columnWidths: [2200, 6800],
    rows: hse.certs.map((c) =>
      new TableRow({
        children: [
          new TableCell({
            width: { size: 2200, type: WidthType.DXA },
            shading: { type: ShadingType.CLEAR, fill: "F6F4EE" },
            children: [new Paragraph({ children: [new TextRun({ text: c.code, bold: true, color: GOLD })] })],
          }),
          new TableCell({
            width: { size: 6800, type: WidthType.DXA },
            children: [new Paragraph({ children: [new TextRun({ text: c.desc })] })],
          }),
        ],
      })
    ),
  }),
  new Paragraph({ spacing: { after: 240 }, children: [] })
);

// training centre
children.push(
  new Paragraph({ heading: HeadingLevel.HEADING_1, spacing: { after: 160 }, children: [new TextRun({ text: hse.centre.title, color: INK })] }),
  new Paragraph({ spacing: { after: 160 }, children: [new TextRun({ text: hse.centre.body, size: 22 })] }),
  new Paragraph({
    spacing: { after: 200 },
    indent: { left: 400 },
    border: { left: { style: BorderStyle.SINGLE, size: 12, color: GOLD, space: 12 } },
    children: [new TextRun({ text: hse.trainingQuote, italics: true, size: 22, color: "444444" })],
  }),
  ...picture(hse.centre.img, "Site induction in the training hall")
);

children.push(rule());

// pillars
children.push(
  new Paragraph({ heading: HeadingLevel.HEADING_1, spacing: { after: 60 }, children: [new TextRun({ text: "In practice", color: INK })] }),
  new Paragraph({ spacing: { after: 200 }, children: [new TextRun({ text: "Six things that happen on every project", size: 24, color: "555555" })] })
);
for (const p of hse.pillars) {
  children.push(
    new Paragraph({
      spacing: { before: 160, after: 40 },
      children: [
        new TextRun({ text: p.no + "   ", bold: true, color: GOLD }),
        new TextRun({ text: p.title, bold: true, size: 24, color: INK }),
      ],
    }),
    new Paragraph({ spacing: { after: 80 }, indent: { left: 400 }, children: [new TextRun({ text: p.desc, size: 21 })] })
  );
}

children.push(rule());

// gallery
children.push(
  new Paragraph({ heading: HeadingLevel.HEADING_1, spacing: { after: 60 }, children: [new TextRun({ text: "Inside the training centre", color: INK })] }),
  new Paragraph({ spacing: { after: 120 }, children: [new TextRun({ text: "Where it is taught before it is done", size: 24, color: "555555" })] })
);
for (const g of hse.gallery) {
  children.push(...picture(g.src, g.label, 520));
}

// footer note
children.push(
  rule(),
  new Paragraph({
    spacing: { before: 120 },
    children: [
      new TextRun({ text: "Al Adrak Trading & Contracting Co LLC", bold: true, size: 20 }),
      new TextRun({ text: "   ·   info@aladrak.com   ·   +968 2200 1300", size: 20, color: "666666" }),
    ],
  }),
  new Paragraph({
    children: [new TextRun({ text: "This document reproduces the Health, Safety & Environment page of aladrak.com.", size: 18, italics: true, color: "888888" })],
  })
);

const doc = new Document({
  creator: "Al Adrak Trading & Contracting",
  title: "Health, Safety & Environment — Al Adrak",
  description: "The HSE page of the Al Adrak website, as a document.",
  sections: [
    {
      properties: { page: { margin: { top: 1000, right: 1000, bottom: 1000, left: 1000 } } },
      children,
    },
  ],
});

Packer.toBuffer(doc).then((buf) => {
  fs.writeFileSync(OUT, buf);
  console.log("written:", OUT, (buf.length / 1024).toFixed(0) + "KB");
  console.log("pillars:", hse.pillars.length, "| gallery:", hse.gallery.length, "| certs:", hse.certs.length);
  console.log("toolbox pillar:", hse.pillars.find((p) => /toolbox/i.test(p.title))?.title);
});
