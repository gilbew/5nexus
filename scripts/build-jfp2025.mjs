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

const parsed = JSON.parse(fs.readFileSync(PARSED, "utf8"));
const keys = JSON.parse(fs.readFileSync(ANSWERS, "utf8"));

const bank = parsed.questions.map((q) => {
  const k = keys[String(q.no)];
  if (!k) throw new Error("Missing answer for GF-" + q.no);
  if (k.answer < 0 || k.answer > 4) throw new Error("Invalid answer index GF-" + q.no);
  return {
    id: "JFP-" + String(q.no).padStart(3, "0"),
    cluster: k.cluster,
    level: k.level,
    source: "jfp2025",
    formNo: q.no,
    stem: q.stem.endsWith(":") ? q.stem : q.stem + (q.stem.endsWith("?") ? "" : ""),
    options: q.options,
    answer: k.answer,
    explain: k.explain,
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
  file += `    version: ${q.version}\n`;
  file += "  }" + (idx < bank.length - 1 ? "," : "") + "\n";
});
file += "];\n";

fs.writeFileSync(OUT, file, "utf8");
console.log("OK:", OUT, "|", bank.length, "soal");
