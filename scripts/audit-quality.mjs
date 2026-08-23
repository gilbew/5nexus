import fs from "fs";
import path from "path";
import vm from "vm";
import { fileURLToPath } from "url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const PARTS = path.join(ROOT, "scripts", "parts");

function load(file, names) {
  const code = fs.readFileSync(path.join(PARTS, file), "utf8");
  const ctx = {};
  vm.runInNewContext(code + "\n" + names.map((n) => `this.${n}=${n};`).join("\n"), ctx);
  return names.map((n) => ({ name: n, bank: ctx[n] }));
}

const sources = [
  ...load("pretest.js", ["BANK_PRETEST", "BANK_PRETEST_VARIAN"]).map((x) => ({
    source: x.name === "BANK_PRETEST" ? "pretest" : "pretest-varian",
    ...x,
  })),
  ...load("pembahasan2026.js", ["BANK_PEMBAHASAN2026"]).map((x) => ({
    source: "pembahasan2026",
    ...x,
  })),
];

// Distinctive tokens worth flagging as theory/name echo
const STOP = new Set(
  "yang dan atau serta untuk dari pada dalam dengan adalah sebagai suatu suatu tentang secara tidak ada lebih kurang dapat harus akan sudah telah juga hanya karena jika maka atau apakah mengapa bagaimana dimana kapan siapa ini itu tersebut berikut berikut berikut berikut benar tepat sesuai mengenai terkait terhadap oleh oleh oleh oleh".split(
    /\s+/
  )
);

function tokens(text) {
  return (text.match(/[A-Za-zÀ-ÿ0-9]{3,}/g) || [])
    .map((t) => t.toLowerCase())
    .filter((t) => !STOP.has(t) && t.length >= 4);
}

function distinctiveStemTokens(stem) {
  // Prefer: acronyms, Proper-ish, theory markers, UU/PP/Permen refs, quoted terms
  const special = [];
  const acr = stem.match(/\b[A-Z]{2,}(?:\/[A-Z]+)?\b/g) || [];
  special.push(...acr.map((x) => x.toLowerCase()));
  const laws = stem.match(/\b(?:uu|pp|perpres|permen|permendagri|permenpan|perda|kepmen)\s*[\w./-]*/gi) || [];
  special.push(...laws.map((x) => x.toLowerCase().replace(/\s+/g, " ")));
  const names = stem.match(/\b(?:chenery|syrquin|klassen|hirschman|myrdal|rostow|friedmann|christaller|lösch|losch|weber|von thünen|thunen|lewis|todaro|harris|todaro|porter|bloom|maslow|poic|sipd|lq|dlq|icor|gini|pbg|slf|kkpr|rdtr|rtrw|rpjmd|rpjmn|rpjpn|rkpd|sdgs|esdm)\b/gi) || [];
  special.push(...names.map((x) => x.toLowerCase()));
  // multiword theory phrases
  const phrases = stem.match(/\b(?:location quotient|shift[- ]share|land value capture|triple bottom|ex ante|ex post|ego sektoral|ego daerah|kegagalan pasar|tragedy of the commons)\b/gi) || [];
  special.push(...phrases.map((x) => x.toLowerCase()));
  return [...new Set(special.filter((t) => t.length >= 2))];
}

function scoreLengthLeak(q) {
  const lens = q.options.map((o) => o.length);
  const c = lens[q.answer];
  const wrong = lens.filter((_, i) => i !== q.answer);
  const maxW = Math.max(...wrong);
  const avgW = wrong.reduce((a, b) => a + b, 0) / wrong.length;
  if (c >= maxW * 1.75 && c - maxW >= 20) return { severity: "high", ratio: +(c / maxW).toFixed(2), c, maxW };
  if (c >= maxW * 1.45 && c - maxW >= 15) return { severity: "med", ratio: +(c / maxW).toFixed(2), c, maxW };
  if (c >= avgW * 1.8 && c - avgW >= 25) return { severity: "med", ratio: +(c / avgW).toFixed(2), c, avgW };
  return null;
}

function scoreTheoryEcho(q) {
  const marks = distinctiveStemTokens(q.stem);
  if (!marks.length) return null;
  const hits = [];
  for (const m of marks) {
    const inOpts = q.options.map((o) => o.toLowerCase().includes(m));
    const onlyCorrect = inOpts[q.answer] && inOpts.filter(Boolean).length === 1;
    const mostlyCorrect = inOpts[q.answer] && inOpts.filter(Boolean).length <= 2;
    if (onlyCorrect) hits.push({ token: m, type: "unique" });
    else if (mostlyCorrect && m.length >= 4) hits.push({ token: m, type: "near-unique" });
  }
  if (!hits.length) return null;
  const unique = hits.filter((h) => h.type === "unique");
  return {
    severity: unique.length ? "high" : "med",
    hits,
  };
}

function scoreAbsolute(q) {
  const ABS = /(^|\s)(hanya|selalu|pasti|tidak pernah|otomatis|semua benar|semua salah)(\s|[.,]|$)/i;
  const bad = q.options
    .map((o, i) => ({ i, o, hit: ABS.test(o) }))
    .filter((x) => x.hit && x.i !== q.answer);
  if (bad.length >= 3) return { severity: "med", count: bad.length };
  if (bad.length >= 2) return { severity: "low", count: bad.length };
  return null;
}

function scoreShortDistract(q) {
  const c = q.options[q.answer].length;
  const shortWrong = q.options.filter((o, i) => i !== q.answer && o.length <= 28 && c >= 55);
  if (shortWrong.length >= 3) return { severity: "high", shortWrong: shortWrong.length };
  if (shortWrong.length >= 2) return { severity: "med", shortWrong: shortWrong.length };
  return null;
}

function scoreStemClarity(q) {
  const stem = q.stem.trim();
  const issues = [];
  if (stem.length < 40) issues.push("very-short");
  if ((stem.match(/\?/g) || []).length > 1) issues.push("multi-question");
  if (/(\.\.\.|…)\s*$/.test(stem) && stem.length < 70) issues.push("truncated-ellipsis");
  // sentence fragment / dangling
  if (/\b(adalah|merupakan|yaitu)\s*$/i.test(stem.replace(/[.…]+$/, ""))) issues.push("dangling");
  // conflicting connectors
  if (/\b(namun|tetapi|akan tetapi).*\b(namun|tetapi)\b/i.test(stem)) issues.push("multi-contrast");
  // option-like junk in stem
  if (/\b[A-E][\).]\s+\S+.*\b[A-E][\).]/i.test(stem)) issues.push("options-in-stem");
  if (!issues.length) return null;
  const high = issues.some((i) => ["options-in-stem", "multi-question", "dangling"].includes(i));
  return { severity: high ? "high" : "med", issues };
}

function scoreHomogeneous(q) {
  // Correct option is full sentence; wrong are fragments or single words disproportionately
  const words = q.options.map((o) => o.trim().split(/\s+/).length);
  const c = words[q.answer];
  const w = words.filter((_, i) => i !== q.answer);
  const avgW = w.reduce((a, b) => a + b, 0) / w.length;
  if (c >= 12 && avgW <= 4) return { severity: "high", cWords: c, avgWrong: +avgW.toFixed(1) };
  if (c >= 10 && avgW <= 5) return { severity: "med", cWords: c, avgWrong: +avgW.toFixed(1) };
  return null;
}

const report = { generated: new Date().toISOString(), total: 0, bySeverity: { high: 0, med: 0, low: 0 }, bySource: {}, items: [] };

for (const { source, bank } of sources) {
  report.bySource[source] = { total: bank.length, high: 0, med: 0, flagged: 0 };
  for (const q of bank) {
    report.total++;
    const flags = [];
    const checks = [
      ["length-leak", scoreLengthLeak(q)],
      ["theory-echo", scoreTheoryEcho(q)],
      ["short-distract", scoreShortDistract(q)],
      ["homogeneous", scoreHomogeneous(q)],
      ["stem-clarity", scoreStemClarity(q)],
      ["absolute", scoreAbsolute(q)],
    ];
    for (const [type, r] of checks) {
      if (r) flags.push({ type, ...r });
    }
    if (!flags.length) continue;
    const sevOrder = { high: 3, med: 2, low: 1 };
    const severity = flags.reduce((a, f) => (sevOrder[f.severity] > sevOrder[a] ? f.severity : a), "low");
    report.bySeverity[severity]++;
    report.bySource[source][severity === "high" ? "high" : severity === "med" ? "med" : "low"]++;
    report.bySource[source].flagged++;
    report.items.push({
      id: q.id,
      source,
      cluster: q.cluster,
      severity,
      flags: flags.map((f) => ({ type: f.type, severity: f.severity, detail: f })),
      stem: q.stem.slice(0, 140),
      options: q.options.map((o, i) => ({ i, len: o.length, text: o.slice(0, 100), correct: i === q.answer })),
      answer: q.answer,
      explain: (q.explain || "").slice(0, 120),
    });
  }
}

report.items.sort((a, b) => {
  const o = { high: 0, med: 1, low: 2 };
  return o[a.severity] - o[b.severity] || String(a.source).localeCompare(b.source) || String(a.id).localeCompare(String(b.id));
});

fs.writeFileSync(path.join(ROOT, "scripts", "audit-quality-report.json"), JSON.stringify(report, null, 2), "utf8");

// summary CSV-ish
console.log("TOTAL", report.total);
console.log("SEVERITY", report.bySeverity);
console.log("BY SOURCE");
for (const [k, v] of Object.entries(report.bySource)) console.log(k, v);
console.log("HIGH count", report.items.filter((i) => i.severity === "high").length);
console.log("MED count", report.items.filter((i) => i.severity === "med").length);
// print first 25 high
for (const it of report.items.filter((i) => i.severity === "high").slice(0, 25)) {
  console.log("---", it.source, it.id, it.flags.map((f) => f.type).join(","));
  console.log("STEM:", it.stem);
  console.log("ANS:", it.options.find((o) => o.correct).text);
}