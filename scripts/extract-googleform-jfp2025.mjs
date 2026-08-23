/**
 * Ekstrak soal dari Google Form JFP 2025 (viewform publik).
 * node scripts/extract-googleform-jfp2025.mjs
 */
import fs from "fs";
import path from "path";
import vm from "vm";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FORM_URL =
  "https://docs.google.com/forms/d/e/1FAIpQLScScCVf8VsBGmsogreuU-Scg1lVTgFh-M6gGUcs4A3AcCx51g/viewform";
const OUT_TXT = path.join(__dirname, "sources", "googleform-jfp2025.txt");
const OUT_JSON = path.join(__dirname, "googleform-jfp2025-parsed.json");

function parseFormText(text) {
  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
  const SKIP = new Set(["10 points", "Clear selection", "Submit", "Clear form"]);
  const questions = [];
  let i = 0;
  while (i < lines.length) {
    const m = lines[i].match(/^(\d+)\.\s+(.+)/);
    if (!m) {
      i++;
      continue;
    }
    const no = +m[1];
    const stem = m[2];
    i++;
    const options = [];
    while (i < lines.length) {
      if (lines[i].match(/^\d+\.\s+/)) break;
      if (SKIP.has(lines[i])) {
        i++;
        continue;
      }
      if (
        lines[i].startsWith("BANK SOAL") ||
        lines[i].includes("Google") ||
        lines[i] === "Email *"
      )
        break;
      options.push(lines[i]);
      i++;
    }
    if (options.length === 5) questions.push({ no, stem, options });
  }
  return questions;
}

async function fetchForm() {
  const res = await fetch(FORM_URL);
  if (!res.ok) throw new Error("Fetch form gagal: " + res.status);
  const html = await res.text();
  // Fallback: gunakan teks dari markdown fetch jika HTML tidak terstruktur
  const txtPath = OUT_TXT;
  if (fs.existsSync(txtPath)) return fs.readFileSync(txtPath, "utf8");
  throw new Error("Simpan dulu teks form ke " + txtPath);
}

function loadPembahasanStems() {
  const code = fs.readFileSync(path.join(__dirname, "parts", "pembahasan2026.js"), "utf8");
  const ctx = {};
  vm.runInNewContext(code + "\nthis.BANK_PEMBAHASAN2026=BANK_PEMBAHASAN2026;", ctx);
  return ctx.BANK_PEMBAHASAN2026;
}

function norm(s) {
  return s
    .toLowerCase()
    .replace(/[^\w\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function sim(a, b) {
  const na = norm(a);
  const nb = norm(b);
  if (na === nb) return 1;
  if (na.includes(nb.slice(0, 40)) || nb.includes(na.slice(0, 40))) return 0.95;
  const wa = new Set(na.split(" ").filter((w) => w.length > 3));
  const wb = new Set(nb.split(" ").filter((w) => w.length > 3));
  let inter = 0;
  for (const w of wa) if (wb.has(w)) inter++;
  return inter / Math.max(wa.size, wb.size, 1);
}

const text = fs.existsSync(OUT_TXT)
  ? fs.readFileSync(OUT_TXT, "utf8")
  : await fetchForm();
if (!fs.existsSync(OUT_TXT)) fs.writeFileSync(OUT_TXT, text, "utf8");

const all = parseFormText(text);
const pb = loadPembahasanStems();

const tagged = all.map((q) => {
  let best = { score: 0, id: null };
  for (const p of pb) {
    const s = sim(q.stem, p.stem);
    if (s > best.score) best = { score: s, id: p.id, stem: p.stem };
  }
  return { ...q, match: best, isDup: best.score >= 0.75 };
});

const unique = tagged.filter((q) => !q.isDup);
const report = {
  fetchedAt: new Date().toISOString(),
  formUrl: FORM_URL,
  total: all.length,
  duplicates: tagged.filter((q) => q.isDup).length,
  unique: unique.length,
  questions: unique,
};

fs.writeFileSync(OUT_JSON, JSON.stringify(report, null, 2), "utf8");
console.log("OK:", OUT_JSON);
console.log("Total:", all.length, "| Unique:", unique.length, "| Dup:", report.duplicates);
