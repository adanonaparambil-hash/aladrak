import sharp from "sharp";
import fs from "fs";

const SP =
  "C:/Users/ITS48/AppData/Local/Temp/claude/E--ITS48-Development-Adraklive/432726eb-ce0b-4e09-a9db-09477f691682/scratchpad";

const files = fs
  .readdirSync(`${SP}/certs-dl`)
  .filter((f) => fs.statSync(`${SP}/certs-dl/${f}`).size > 3000);

const thumbs = [];
const names = [];
for (const f of files) {
  const m = await sharp(`${SP}/certs-dl/${f}`).metadata();
  console.log(f, `${m.width}x${m.height}`);
  thumbs.push(
    await sharp(`${SP}/certs-dl/${f}`)
      .resize({ width: 360, height: 420, fit: "contain", background: "#222222" })
      .toBuffer()
  );
  names.push(f);
}
const cols = 3;
const rows = Math.ceil(thumbs.length / cols);
const comp = thumbs.map((b, i) => ({
  input: b,
  left: (i % cols) * 370 + 5,
  top: Math.floor(i / cols) * 430 + 5,
}));
await sharp({
  create: { width: cols * 370 + 5, height: rows * 430 + 5, channels: 3, background: { r: 20, g: 20, b: 20 } },
})
  .composite(comp)
  .jpeg({ quality: 78 })
  .toFile("E:/ITS48/Development/Adraklive/review-shots/certs-sheet.jpg");
console.log("ORDER:", names.join(" | "));
