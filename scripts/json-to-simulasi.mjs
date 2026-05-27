import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const data = JSON.parse(fs.readFileSync(path.join(__dirname, "parts", "simulasi-data.json"), "utf8"));
function esc(s) { return JSON.stringify(s); }
let out = "// Bank simulasi UKOM (40 soal)\nconst BANK_SIMULASI = [\n";
data.forEach((q, idx) => {
  out += "  {\n";
  out += `    id: ${esc(q.id)},\n    cluster: ${esc(q.cluster)},\n    level: ${esc(q.level)},\n    source: "simulasi",\n`;
  out += `    stem: ${esc(q.stem)},\n    options: [\n`;
  q.options.forEach((o) => (out += `      ${esc(o)},\n`));
  out += `    ],\n    answer: ${q.answer},\n    explain: ${esc(q.explain)},\n    version: 1\n`;
  out += "  }" + (idx < data.length - 1 ? "," : "") + "\n";
});
out += "];\n";
fs.writeFileSync(path.join(__dirname, "parts", "simulasi.js"), out, "utf8");
console.log("wrote", data.length);
