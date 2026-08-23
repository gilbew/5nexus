/**
 * Gabungkan parts → soal-bank.js (satu file untuk index.html).
 * Aktif: Pre Test + Pembahasan 2026. Sumber lain ada di parts/archive/.
 * Jalankan: node scripts/merge-bank.mjs
 */
import fs from "fs";
import path from "path";
import vm from "vm";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const PARTS = path.join(__dirname, "parts");

function loadPart(file, names) {
  const code = fs.readFileSync(path.join(PARTS, file), "utf8");
  const ctx = {};
  vm.runInNewContext(
    code + "\n" + names.map((n) => `this.${n} = typeof ${n} !== "undefined" ? ${n} : undefined;`).join("\n"),
    ctx
  );
  const out = {};
  for (const n of names) {
    if (!ctx[n]) throw new Error(`Missing ${n} in parts/${file}`);
    out[n] = ctx[n];
  }
  return out;
}

function esc(s) {
  return JSON.stringify(s);
}

function serializeArray(name, bank) {
  let o = `const ${name} = [\n`;
  bank.forEach((q, idx) => {
    o += "  {\n";
    o += `    id: ${esc(q.id)},\n`;
    o += `    cluster: ${esc(q.cluster)},\n`;
    o += `    level: ${esc(q.level)},\n`;
    if (q.source) o += `    source: ${esc(q.source)},\n`;
    if (q.section) o += `    section: ${esc(q.section)},\n`;
    if (q.sectionNo != null) o += `    sectionNo: ${q.sectionNo},\n`;
    o += `    stem: ${esc(q.stem)},\n`;
    o += "    options: [\n";
    q.options.forEach((opt) => (o += `      ${esc(opt)},\n`));
    o += "    ],\n";
    o += `    answer: ${q.answer},\n`;
    o += `    explain: ${esc(q.explain)},\n`;
    if (q.fixedOptions) o += `    fixedOptions: true,\n`;
    if (q.version != null) o += `    version: ${q.version}\n`;
    else o += `    version: 1\n`;
    o += "  }" + (idx < bank.length - 1 ? "," : "") + "\n";
  });
  o += "];\n";
  return o;
}

const pre = loadPart("pretest.js", ["BANK_PRETEST", "BANK_PRETEST_VARIAN"]);
const pb26 = loadPart("pembahasan2026.js", ["BANK_PEMBAHASAN2026"]);

const total =
  pre.BANK_PRETEST.length +
  pre.BANK_PRETEST_VARIAN.length +
  pb26.BANK_PEMBAHASAN2026.length;

let file =
  "/** Bank soal UKOM — " + total + " butir. Regenerate parts lalu: node scripts/merge-bank.mjs */\n";
file += serializeArray("BANK_PRETEST", pre.BANK_PRETEST);
file += "\n";
file += serializeArray("BANK_PRETEST_VARIAN", pre.BANK_PRETEST_VARIAN);
file += "\n";
file += serializeArray("BANK_PEMBAHASAN2026", pb26.BANK_PEMBAHASAN2026);

const outPath = path.join(ROOT, "soal-bank.js");
fs.writeFileSync(outPath, file, "utf8");
console.log("OK:", outPath);
console.log(
  "pretest:", pre.BANK_PRETEST.length,
  "| varian:", pre.BANK_PRETEST_VARIAN.length,
  "| pembahasan2026:", pb26.BANK_PEMBAHASAN2026.length,
  "| total:", total
);
