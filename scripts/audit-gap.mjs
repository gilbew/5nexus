import fs from "fs";
import path from "path";
import vm from "vm";
import { fileURLToPath } from "url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const PARTS = path.join(ROOT, "scripts", "parts");

function load(file, varName) {
  const ctx = {};
  vm.runInNewContext(fs.readFileSync(path.join(PARTS, file), "utf8") + `\nthis.${varName} = ${varName};`, ctx);
  return ctx[varName];
}

const banks = [
  { name: "gap1", bank: load("gap100.js", "BANK_GAP") },
  { name: "gap2", bank: load("gap200.js", "BANK_GAP2") },
  { name: "gap3", bank: load("gap300.js", "BANK_GAP3") },
];

const WEAK = /(hanya|selalu|pasti|tidak pernah|otomatis meratakan)/i;
const report = { generated: new Date().toISOString(), banks: [], crossDup: [] };
const allStems = new Map();

for (const { name, bank } of banks) {
  const r = { name, total: bank.length, answerDist: {}, issues: [] };
  for (const q of bank) {
    r.answerDist[q.answer] = (r.answerDist[q.answer] || 0) + 1;
    if (q.options.filter((o) => WEAK.test(o)).length >= 3) {
      r.issues.push({ id: q.id, type: "weak-absolut" });
    }
    if (/implementing/i.test([q.stem, q.explain, ...q.options].join(" "))) {
      r.issues.push({ id: q.id, type: "poic-implementing" });
    }
    const sk = q.stem.slice(0, 80);
    if (allStems.has(sk)) report.crossDup.push({ a: allStems.get(sk), b: q.id });
    else allStems.set(sk, q.id);
  }
  report.banks.push(r);
}

fs.writeFileSync(path.join(ROOT, "scripts", "audit-gap-report.json"), JSON.stringify(report, null, 2), "utf8");
for (const r of report.banks) {
  console.log(r.name, r.total, "issues", r.issues.length, "answers", r.answerDist);
}
console.log("cross-dup stems", report.crossDup.length);