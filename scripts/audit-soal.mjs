/**
 * Audit bank soal — node scripts/audit-soal.mjs
 */
import fs from "fs";
import path from "path";
import vm from "vm";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const bankPath = path.join(__dirname, "..", "soal-bank.js");

const ctx = {};
vm.runInNewContext(
  fs.readFileSync(bankPath, "utf8") +
    "\nthis.BANK=BANK;this.BANK_KASUS=BANK_KASUS;this.BANK_PRETEST=BANK_PRETEST;this.BANK_PRETEST_VARIAN=BANK_PRETEST_VARIAN;",
  ctx
);

const TYPO_RE = /\b(dengn|diatan|mecakup|adminstrasi|Defenisi|pembagunan)\b/i;
const issues = [];

function audit(q, bank) {
  const flags = [];
  if (TYPO_RE.test(q.stem)) flags.push("typo-stem");
  (q.options || []).forEach((o, i) => {
    if (TYPO_RE.test(o)) flags.push("typo-opsi-" + i);
  });
  if (/,\.\.\.\s+Zona /.test(q.stem)) flags.push("stem-campur");
  if (q.answer < 0 || q.answer >= (q.options || []).length) flags.push("jawaban-invalid");
  if (flags.length) issues.push({ bank, id: q.id, flags, stem: q.stem.slice(0, 80) });
}

[
  ["v1", ctx.BANK],
  ["kasus", ctx.BANK_KASUS],
  ["pretest", ctx.BANK_PRETEST],
  ["varian", ctx.BANK_PRETEST_VARIAN],
].forEach(([name, arr]) => arr.forEach((q) => audit(q, name)));

console.log("ISSUES:", issues.length);
issues.forEach((x) => console.log(x.bank, x.id, x.flags.join(","), x.stem));
fs.writeFileSync(path.join(__dirname, "audit-soal-report.json"), JSON.stringify(issues, null, 2));
