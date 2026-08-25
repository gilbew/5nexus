/**
 * Tandai semua soal komposit dengan fixedOptions + perbaiki label spa-1/spa-2.
 * node scripts/fix-composite-options.mjs && node scripts/merge-bank.mjs
 */
import fs from "fs";
import path from "path";
import vm from "vm";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PARTS = path.join(__dirname, "parts");

export function isMetaCompositeOption(text) {
  return (
    /semua\s+(?:pernyataan|jawaban)?\s*benar/i.test(text) ||
    /^semua\s+benar\.?$/i.test(text) ||
    /hanya\s+(?:butir|\([a-e]\)|pernyataan|jawaban)/i.test(text) ||
    /butir\s*\(?[a-e]\)?\s+dan/i.test(text) ||
    /^[a-e]\s+dan\s+[a-e]\s+benar/i.test(text) ||
    /pernyataan\s+[A-Ea-e]\s+dan\s+[A-Ea-e]\s+benar/i.test(text) ||
    /tidak\s+ada\s+yang\s+benar/i.test(text)
  );
}

export function hasCompositeOptions(options) {
  return options.some(isMetaCompositeOption);
}

/** Normalisasi opsi meta yang merujuk huruf A–E → (a)–(c) */
function normalizeMetaOption(text) {
  return text
    .replace(/pernyataan\s+([A-E])\s+dan\s+([A-E])\s+benar\.?/i, (_, a, c) => {
      const m = { A: "a", B: "b", C: "c", D: "d", E: "e" };
      return `Hanya (${m[a] || a.toLowerCase()}) dan (${m[c] || c.toLowerCase()}) benar`;
    })
    .replace(/^([a-e])\s+dan\s+([a-e])\s+benar$/i, "Hanya ($1) dan ($2) benar");
}

function labelStatements(options) {
  const labels = ["a", "b", "c", "d", "e"];
  let n = 0;
  return options.map((o) => {
    if (isMetaCompositeOption(o) || /^\([a-e]\)\s/i.test(o)) return normalizeMetaOption(o);
    if (n >= labels.length) return o;
    const out = `(${labels[n]}) ${o}`;
    n++;
    return out;
  });
}

function loadBank(file, varName) {
  const code = fs.readFileSync(path.join(PARTS, file), "utf8");
  const ctx = {};
  vm.runInNewContext(code + `\nthis.${varName}=${varName};`, ctx);
  return ctx[varName];
}

function patchBank(bank, idsNeedLabels) {
  let fixed = 0;
  for (const q of bank) {
    if (!hasCompositeOptions(q.options)) continue;
    if (idsNeedLabels.has(q.id)) {
      q.options = labelStatements(q.options);
      q.version = Math.max(q.version || 1, 2);
    }
    if (!q.fixedOptions) {
      q.fixedOptions = true;
      fixed++;
    }
  }
  return fixed;
}

function serializeBank(name, bank) {
  let o = `const ${name} = [\n`;
  bank.forEach((q, idx) => {
    o += "  {\n";
    o += `    id: ${JSON.stringify(q.id)},\n`;
    o += `    cluster: ${JSON.stringify(q.cluster)},\n`;
    o += `    level: ${JSON.stringify(q.level)},\n`;
    if (q.source) o += `    source: ${JSON.stringify(q.source)},\n`;
    if (q.formNo != null) o += `    formNo: ${q.formNo},\n`;
    if (q.section) o += `    section: ${JSON.stringify(q.section)},\n`;
    if (q.sectionNo != null) o += `    sectionNo: ${q.sectionNo},\n`;
    o += `    stem: ${JSON.stringify(q.stem)},\n`;
    o += "    options: [\n";
    q.options.forEach((opt) => (o += `      ${JSON.stringify(opt)},\n`));
    o += "    ],\n";
    o += `    answer: ${q.answer},\n`;
    o += `    explain: ${JSON.stringify(q.explain)},\n`;
    if (q.fixedOptions) o += "    fixedOptions: true,\n";
    o += `    version: ${q.version ?? 1}\n`;
    o += "  }" + (idx < bank.length - 1 ? "," : "") + "\n";
  });
  o += "];\n";
  return o;
}

const labelIds = new Set(["pb26-spa-1", "pb26-spa-2"]);

const pb26 = loadBank("pembahasan2026.js", "BANK_PEMBAHASAN2026");
const jfp = loadBank("jfp2025.js", "BANK_JFP2025");

const n1 = patchBank(pb26, labelIds);
const n2 = patchBank(jfp, new Set());

fs.writeFileSync(
  path.join(PARTS, "pembahasan2026.js"),
  "// Bank Pembahasan 2026 — node scripts/build-pembahasan2026.mjs\n" + serializeBank("BANK_PEMBAHASAN2026", pb26),
  "utf8"
);
fs.writeFileSync(
  path.join(PARTS, "jfp2025.js"),
  "// Bank JFP 2025 (Google Form) — node scripts/build-jfp2025.mjs\n" + serializeBank("BANK_JFP2025", jfp),
  "utf8"
);

console.log("OK: fixedOptions added — pembahasan2026:", n1, "| jfp2025:", n2);
console.log("OK: labeled spa-1/spa-2 meta options");
