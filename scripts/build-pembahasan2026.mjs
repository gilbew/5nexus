/**
 * Ekstrak bank soal dari PDF Pembahasan 2026, koreksi kunci, tulis parts/pembahasan2026.js
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const EXTRACTED = path.join(__dirname, "pembahasan-2026-extracted.txt");
const OUT = path.join(__dirname, "parts", "pembahasan2026.js");

const SECTIONS = ["PERENCANAAN", "EKONOMI", "SOSIAL", "SPASIAL"];
const CLUSTER_MAP = {
  PERENCANAAN: "teknis",
  EKONOMI: "ekonomi",
  SOSIAL: "sosial",
  SPASIAL: "spasial",
};

const CORRECTIONS = {
  "PERENCANAAN|1": {
    answer: 2,
    explainNote:
      "[Dikoreksi] Bukan dasar hukum perencanaan adalah UU Pilpres (UU 42/2008), selaras soal 46.",
  },
  "PERENCANAAN|19": {
    answer: 3,
    optionFix: { D: "Hanya pernyataan butir (b) dan (c) yang benar" },
    explainNote: "[Dikoreksi] SDA tersedia = potensi, bukan tantangan.",
  },
  "PERENCANAAN|22": {
    answer: 4,
    explainNote: "[Dikoreksi] Keterlibatan masyarakat → Pembangunan Berbasis Masyarakat.",
  },
  "EKONOMI|14": {
    answer: 4,
    optionFix: { E: "Hanya (b), (c), dan (d) benar" },
    explainNote: "[Dikoreksi] Opsi A keliru; kelemahan PDB meliputi B, C, D.",
  },
  "EKONOMI|15": { answer: 0, explainNote: "[Dikoreksi] Kualitas SDM → Endogenous growth model." },
  "EKONOMI|32": { answer: 3, explainNote: "[Dikoreksi] Pernyataan D yang salah (nasional < perkotaan)." },
  "SPASIAL|14": { answer: 2, explainNote: "[Ditambahkan] Kesesuaian lahan (suitability)." },
};

const SKIP = new Set(["SOSIAL|25", "SPASIAL|21", "SPASIAL|8", "PERENCANAAN|81", "PERENCANAAN|82"]);

const MANUAL_ANSWERS = {
  "PERENCANAAN|70": 1,
  "EKONOMI|2": 1,
  "EKONOMI|19": 2,
  "EKONOMI|24": 1,
  "EKONOMI|27": 1,
};

function clean(s) {
  return s.replace(/\u200b/g, "").replace(/\s+/g, " ").trim();
}

function letterToIndex(l) {
  return l.toUpperCase().charCodeAt(0) - 65;
}

function extractAnswer(pemb) {
  const pats = [
    /jawaban(?:nya)?\s*(?:adalah|yang salah adalah)\s*\(([A-Ea-e])\)/i,
    /benar\s*\(([A-Ea-e])\)/i,
    /adalah\s*\(([A-Ea-e])\)/i,
    /→\s*\(([A-Ea-e])\)/i,
    /Ringkasan Cepat\s*:\s*\(([A-Ea-e])\)/i,
    /\(([A-Ea-e])\)\s*$/,
  ];
  for (const pat of pats) {
    const m = pemb.match(pat);
    if (m) return letterToIndex(m[1]);
  }
  const all = [...pemb.matchAll(/\(([A-Ea-e])\)/g)];
  return all.length ? letterToIndex(all[all.length - 1][1]) : -1;
}

function parseQuestionBlock(qtext) {
  const parts = qtext.split(/\n(?=\d+\.)/);
  const lastPart = parts[parts.length - 1] || "";
  const m = lastPart.match(/^(\d+)\.\s*([\s\S]*)/);
  if (!m) return null;
  const no = parseInt(m[1], 10);
  const body = m[2];

  const lines = body.split("\n").map((l) => l.trim()).filter(Boolean);
  const stemParts = [];
  const options = [];
  let mode = "stem";

  for (const line of lines) {
    if (/^Pembahasan:/i.test(line)) break;
    const om = line.match(/^([A-Ea-e])\.\s*(.*)/);
    if (om) {
      mode = "opt";
      options.push(clean(om[2]));
    } else if (mode === "opt" && options.length) {
      options[options.length - 1] = clean(options[options.length - 1] + " " + line);
    } else if (mode === "stem") {
      stemParts.push(line);
    }
  }

  const stem = clean(stemParts.join(" "));
  if (options.length < 2 || stem.length < 12) return null;
  return { no, stem, options };
}

function parseAll(text) {
  text = text.replace(/---PAGE\d+---/g, "\n");
  const chunks = text.split(/\nPembahasan:\s*\n?/);
  const results = [];
  let section = "PERENCANAAN";

  function updateSectionFromText(t) {
    for (const s of SECTIONS) {
      const re = new RegExp(`(?:^|\\n)\\s*${s}\\s*(?:\\n|$)`, "g");
      let m;
      while ((m = re.exec(t)) !== null) section = s;
    }
  }

  for (let i = 1; i < chunks.length; i++) {
    updateSectionFromText(chunks[i - 1]);

    let pemb = chunks[i];
    const before = chunks[i - 1];

    const cut = pemb.search(/\n\d+\.\s/);
    if (cut !== -1) pemb = pemb.slice(0, cut);

    const q = parseQuestionBlock(before);
    if (!q) continue;

    const key = `${section}|${q.no}`;
    if (SKIP.has(key)) continue;

    let answer = MANUAL_ANSWERS[key] ?? extractAnswer(pemb);
    if (answer < 0) {
      if (key === "SPASIAL|14") answer = 2;
      else continue;
    }

    let explain = clean(pemb).slice(0, 1500);
    const optArr = [...q.options];

    const corr = CORRECTIONS[key];
    if (corr) {
      if (corr.answer != null) answer = corr.answer;
      if (corr.optionFix) {
        for (const [k, v] of Object.entries(corr.optionFix)) {
          const idx = letterToIndex(k);
          if (idx < optArr.length) optArr[idx] = v;
        }
      }
      if (corr.explainNote) explain = corr.explainNote + " " + explain;
    }

    if (answer >= optArr.length) continue;

    results.push({
      id: `pb26-${section.slice(0, 3).toLowerCase()}-${q.no}`,
      cluster: CLUSTER_MAP[section],
      level: q.stem.length > 200 ? "panjang" : q.stem.length > 100 ? "sedang" : "singkat",
      source: "pembahasan2026",
      section,
      sectionNo: q.no,
      stem: q.stem,
      options: optArr,
      answer,
      explain,
      version: 1,
    });
  }
  return results;
}

function serialize(bank) {
  let o = "const BANK_PEMBAHASAN2026 = [\n";
  bank.forEach((q, idx) => {
    o += "  {\n";
    o += `    id: ${JSON.stringify(q.id)},\n`;
    o += `    cluster: ${JSON.stringify(q.cluster)},\n`;
    o += `    level: ${JSON.stringify(q.level)},\n`;
    o += `    source: ${JSON.stringify(q.source)},\n`;
    o += `    section: ${JSON.stringify(q.section)},\n`;
    o += `    sectionNo: ${q.sectionNo},\n`;
    o += `    stem: ${JSON.stringify(q.stem)},\n`;
    o += "    options: [\n";
    q.options.forEach((opt) => (o += `      ${JSON.stringify(opt)},\n`));
    o += "    ],\n";
    o += `    answer: ${q.answer},\n`;
    o += `    explain: ${JSON.stringify(q.explain)},\n`;
    o += `    version: ${q.version}\n`;
    o += "  }" + (idx < bank.length - 1 ? "," : "") + "\n";
  });
  o += "];\n";
  return o;
}

const text = fs.readFileSync(EXTRACTED, "utf8");
console.log("Parsing Pembahasan 2026...");
const bank = parseAll(text);
const bySec = {};
for (const q of bank) bySec[q.section] = (bySec[q.section] || 0) + 1;
for (const s of SECTIONS) console.log(`  ${s}: ${bySec[s] || 0} soal`);
console.log(`Total: ${bank.length} soal`);

fs.writeFileSync(OUT, serialize(bank), "utf8");
console.log("OK:", OUT);
