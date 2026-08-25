/**
 * Bank soal JFP 2025 (Google Form) — 51 butir unik (tanpa duplikat Pembahasan 2026).
 * node scripts/extract-googleform-jfp2025.mjs
 * node scripts/build-jfp2025.mjs
 * node scripts/merge-bank.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PARSED = path.join(__dirname, "googleform-jfp2025-parsed.json");
const ANSWERS = path.join(__dirname, "jfp2025-answers.json");
const OUT = path.join(__dirname, "parts", "jfp2025.js");

function esc(s) {
  return JSON.stringify(s);
}

function hasCompositeOptions(options) {
  return options.some(
    (o) =>
      /semua\s+(?:pernyataan|jawaban)?\s*benar/i.test(o) ||
      /^semua\s+benar\.?$/i.test(o) ||
      /hanya\s+(?:butir|\([a-e]\)|pernyataan|jawaban)/i.test(o) ||
      /butir\s*\(?[a-e]\)?\s+dan/i.test(o) ||
      /^[a-e]\s+dan\s+[a-e]\s+benar/i.test(o) ||
      /pernyataan\s+[A-Ea-e]\s+dan\s+[A-Ea-e]\s+benar/i.test(o) ||
      /tidak\s+ada\s+yang\s+benar/i.test(o)
  );
}

function isMetaOption(text) {
  return /hanya|semua\s+(?:benar|jawaban\s+benar|pernyataan\s+benar)/i.test(text);
}

/** Tambah label (a)(b)(c) pada pernyataan agar opsi komposit tetap valid */
function labelCompositeOptions(options) {
  if (!hasCompositeOptions(options)) return options;
  var labels = ["a", "b", "c", "d", "e"];
  var stmt = 0;
  return options.map(function (o) {
    if (isMetaOption(o) || /^\([a-e]\)/i.test(o)) return o;
    if (stmt >= labels.length) return o;
    var out = "(" + labels[stmt] + ") " + o;
    stmt++;
    return out;
  });
}

const parsed = JSON.parse(fs.readFileSync(PARSED, "utf8"));
const keys = JSON.parse(fs.readFileSync(ANSWERS, "utf8"));

const bank = parsed.questions.map((q) => {
  const k = keys[String(q.no)];
  if (!k) throw new Error("Missing answer for GF-" + q.no);
  if (k.answer < 0 || k.answer > 4) throw new Error("Invalid answer index GF-" + q.no);
  const options = labelCompositeOptions(q.options);
  const fixedOptions = hasCompositeOptions(options);
  return {
    id: "JFP-" + String(q.no).padStart(3, "0"),
    cluster: k.cluster,
    level: k.level,
    source: "jfp2025",
    formNo: q.no,
    stem: q.stem.endsWith(":") ? q.stem : q.stem + (q.stem.endsWith("?") ? "" : ""),
    options,
    answer: k.answer,
    explain: k.explain,
    fixedOptions,
    version: 1,
  };
});

let file = "// Bank JFP 2025 (Google Form) — node scripts/build-jfp2025.mjs\n";
file += "const BANK_JFP2025 = [\n";
bank.forEach((q, idx) => {
  file += "  {\n";
  file += `    id: ${esc(q.id)},\n`;
  file += `    cluster: ${esc(q.cluster)},\n`;
  file += `    level: ${esc(q.level)},\n`;
  file += `    source: ${esc(q.source)},\n`;
  file += `    formNo: ${q.formNo},\n`;
  file += `    stem: ${esc(q.stem)},\n`;
  file += "    options: [\n";
  q.options.forEach((o) => (file += `      ${esc(o)},\n`));
  file += "    ],\n";
  file += `    answer: ${q.answer},\n`;
  file += `    explain: ${esc(q.explain)},\n`;
  if (q.fixedOptions) file += "    fixedOptions: true,\n";
  file += `    version: ${q.version}\n`;
  file += "  }" + (idx < bank.length - 1 ? "," : "") + "\n";
});
file += "];\n";

fs.writeFileSync(OUT, file, "utf8");
console.log("OK:", OUT, "|", bank.length, "soal");
