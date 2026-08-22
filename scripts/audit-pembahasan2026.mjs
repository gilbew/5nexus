/**
 * Audit bank Pembahasan 2026: konsistensi kunci, pembahasan, dan sumber PDF.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const EXTRACTED = path.join(__dirname, "pembahasan-2026-extracted.txt");
const BANK_FILE = path.join(__dirname, "parts", "pembahasan2026.js");
const MATERI_DIR = path.join(__dirname, "sources");
const REPORT = path.join(__dirname, "audit-pembahasan2026-report.json");

const letters = "ABCDE";

function loadBank() {
  const src = fs.readFileSync(BANK_FILE, "utf8");
  return Function(src + "; return BANK_PEMBAHASAN2026;")();
}

function letterToIndex(l) {
  return l.toUpperCase().charCodeAt(0) - 65;
}

function optionBlocks(flat) {
  const re = /(?:^|[\s●])?([A-Ea-e])(?:\.\s*→|\.| →)\s*/g;
  const matches = [];
  let m;
  while ((m = re.exec(flat)) !== null) {
    matches.push({ letter: m[1].toUpperCase(), contentStart: m.index + m[0].length, index: m.index });
  }
  const blocks = [];
  for (let i = 0; i < matches.length; i++) {
    const end = i + 1 < matches.length ? matches[i + 1].index : flat.length;
    blocks.push({ letter: matches[i].letter, text: flat.slice(matches[i].contentStart, end) });
  }
  return blocks;
}

function isWrongMark(t) {
  return t.includes("❌");
}
function isRightMark(t) {
  return t.includes("✅") || /✔/.test(t);
}

function inferAnswerFromExplain(explain, stem) {
  const conclusionPats = [
    /\(([A-Ea-e])\)\s*$/,
    /kecuali\s*(?:adalah\s*)?(?:opsi\s*)?\(([A-Ea-e])\)/i,
    /bukan termasuk kelemahan\s*\(([A-Ea-e])\)/i,
    /Jawaban\s*benar\s*semua\s*\(([A-Ea-e])\)/i,
    /Jawaban\s*:\s*Semua\s*Benar\s*\(([A-Ea-e])\)/i,
    /Pilihan yang benar adalah\s+.*?\(([A-Ea-e])\)/i,
    /Jawaban\s*:\s*\(([A-Ea-e])\)/i,
    /Jawaban\s*\(([A-Ea-e])\)/i,
    /jawaban(?:nya)?\s*(?:adalah|yang salah adalah)\s*\(([A-Ea-e])\)/i,
    /Ringkasan Cepat\s*:\s*\(([A-Ea-e])\)/i,
  ];
  for (const pat of conclusionPats) {
    const m = explain.match(pat);
    if (m) return letterToIndex(m[1]);
  }
  const flat = explain.replace(/\s+/g, " ");
  const blocks = optionBlocks(flat);
  if (/kecuali/i.test(stem)) {
    const wrongOnly = blocks.filter((b) => isWrongMark(b.text) && !isRightMark(b.text));
    if (wrongOnly.length >= 1) return letterToIndex(wrongOnly[wrongOnly.length - 1].letter);
  }
  const checked = blocks.filter((b) => isRightMark(b.text) && !isWrongMark(b.text));
  if (checked.length === 1) return letterToIndex(checked[0].letter);
  if (checked.length > 1) {
    const compound = blocks.find(
      (b) => /hanya|semua|dan.*benar/i.test(b.text) && (isRightMark(b.text) || /benar/i.test(b.text))
    );
    if (compound) return letterToIndex(compound.letter);
  }
  if (checked.length) return letterToIndex(checked[checked.length - 1].letter);
  return -1;
}

function loadMateri() {
  const files = fs.readdirSync(MATERI_DIR).filter((f) => f.endsWith(".txt") && f.startsWith("materi-"));
  const out = {};
  for (const f of files) {
    out[f.replace(".txt", "")] = fs.readFileSync(path.join(MATERI_DIR, f), "utf8").toLowerCase();
  }
  return out;
}

function stemKeywords(stem) {
  const kws = [];
  const laws = stem.match(/\b(?:uu|pp|perpres|permen|permendagri)\s*[\w./-]*/gi) || [];
  kws.push(...laws.map((x) => x.toLowerCase()));
  const theories = stem.match(
    /\b(?:gini|pdb|eksternalitas|ex ante|ex post|monitoring|evaluasi|sppn|rpjmn|rpjmd|rtrw|rdtr|poac|todaro|sen|solow|endogenous|location quotient|lq|shift share|ketahanan pangan|barang publik|common goods|suitability|aglomerasi|carrying capacity|partisipasi|pemberdayaan|desentralisasi|otonomi)\b/gi
  ) || [];
  kws.push(...theories.map((x) => x.toLowerCase()));
  const words = stem
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length >= 6);
  kws.push(...words.slice(0, 5));
  return [...new Set(kws)].slice(0, 8);
}

function materiHits(stem, materi) {
  const kws = stemKeywords(stem);
  const hits = [];
  for (const [name, text] of Object.entries(materi)) {
    const matched = kws.filter((k) => text.includes(k));
    if (matched.length >= 2 || (matched.length === 1 && matched[0].length >= 8)) {
      hits.push({ source: name, keywords: matched });
    }
  }
  return hits;
}

const bank = loadBank();
const materi = loadMateri();

const issues = [];
const ok = [];

for (const q of bank) {
  const inferred = inferAnswerFromExplain(q.explain, q.stem);
  const tail = q.explain.match(/\(([A-E])\)\s*$/);
  const item = {
    id: q.id,
    section: q.section,
    no: q.sectionNo,
    stem: q.stem.slice(0, 120),
    answer: letters[q.answer],
    answerText: q.options[q.answer]?.slice(0, 100),
    inferred: inferred >= 0 ? letters[inferred] : null,
    explainLen: q.explain.length,
    corrected: q.version === 2,
    materi: materiHits(q.stem, materi),
  };

  const problems = [];
  if (inferred >= 0 && inferred !== q.answer && !q.explain.startsWith("[Dikoreksi]")) {
    problems.push("answer_vs_explain");
  }
  if (tail && letters.indexOf(tail[1]) !== q.answer && !q.explain.startsWith("[Dikoreksi]")) {
    problems.push("answer_vs_tail");
  }
  if (q.explain.length > 1200) problems.push("explain_too_long");
  if (q.explain.length < 20) problems.push("explain_too_short");
  if (!q.explain || q.explain === q.stem) problems.push("missing_explain");

  if (problems.length) {
    issues.push({ ...item, problems });
  } else {
    ok.push(item.id);
  }
}

const bySection = {};
for (const q of bank) {
  bySection[q.section] = (bySection[q.section] || 0) + 1;
}

const report = {
  generatedAt: new Date().toISOString(),
  total: bank.length,
  bySection,
  okCount: ok.length,
  issueCount: issues.length,
  issues,
  correctedItems: bank.filter((q) => q.version === 2).map((q) => ({
    id: q.id,
    answer: letters[q.answer],
    explain: q.explain.slice(0, 200),
  })),
};

fs.writeFileSync(REPORT, JSON.stringify(report, null, 2), "utf8");
console.log(`Audit: ${ok.length} OK, ${issues.length} issues`);
console.log("Issues:", issues.map((i) => `${i.id} [${i.problems.join(",")}]`).join("\n") || "none");
console.log("Report:", REPORT);
