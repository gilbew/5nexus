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
    explainOverride:
      "[Dikoreksi] UU Pilpres (UU 42/2008) mengatur pemilihan presiden, bukan perencanaan pembangunan. Dasar hukum perencanaan meliputi UU SPPN, UU Keuangan Negara, UU Pemda, dan Perpres RPJMN.",
  },
  "PERENCANAAN|19": {
    answer: 3,
    optionFix: { D: "Hanya pernyataan butir (b) dan (c) yang benar" },
    explainOverride:
      "[Dikoreksi] SDA yang tersedia adalah potensi, bukan tantangan. Tantangan pembangunan meliputi sumber pendanaan (b) dan SDM (c). Jawaban: D.",
  },
  "PERENCANAAN|22": {
    answer: 4,
    explainOverride:
      "[Dikoreksi] Paradigma yang menekankan keterlibatan/partisipasi masyarakat adalah Pembangunan Berbasis Masyarakat (E).",
  },
  "EKONOMI|14": {
    answer: 4,
    optionFix: { E: "Hanya (b), (c), dan (d) benar" },
    explainNote: "[Dikoreksi] Opsi A keliru; kelemahan PDB meliputi B, C, D.",
  },
  "EKONOMI|15": {
    answer: 0,
    explainOverride:
      "[Dikoreksi] Kualitas SDM dan inovasi menjadi motor pertumbuhan dalam Endogenous Growth Model (Romer/Lucas), bukan Solow.",
  },
  "EKONOMI|32": {
    answer: 3,
    explainOverride:
      "[Dikoreksi] Pernyataan D salah: koefisien Gini nasional tidak selalu lebih kecil dari Gini perkotaan. Indeks ketimpangan yang benar dirujuk pada pernyataan D.",
  },
  "EKONOMI|27": {
    answer: 4,
    optionFix: {
      E: "Pemberlakuan batas pencemaran kepada pihak yang menghasilkan eksternalitas negatif",
    },
    explainNote:
      "[Dikoreksi] Internalisasi eksternalitas negatif = regulasi/batas emisi kepada pelaku pencemar, bukan kompensasi ke pelaku.",
  },
  "SPASIAL|14": { answer: 2, explainNote: "[Ditambahkan] Kesesuaian lahan (suitability)." },
  "PERENCANAAN|69": {
    answer: 1,
    explainOverride:
      "[Dikoreksi] Menurut UU 23/2014 Pasal 12, urusan konkuren mencakup pekerjaan umum (≈infrastruktur) dan komunikasi & informatika. 'Pengelolaan pelayanan publik' bukan nama urusan resmi. Jawaban terkuat: B.",
  },
  "EKONOMI|9": {
    optionFix: {
      A: "(a) ECBA",
      B: "(b) Comparative Analysis",
      C: "(c) EIRR",
      E: "Semua benar",
    },
  },
  "EKONOMI|25": {
    optionFix: {
      A: "(a) Keindahan dan udara segar karena adanya taman kota",
      B: "(b) Peningkatan jumlah pesanan online makanan siap saji karena dibukanya kawasan bisnis baru",
      C: "(c) Peningkatan jumlah pesanan online minuman kopi karena dibukanya kawasan perkantoran baru",
      D: "(d) Pelatihan gratis untuk guru dan dosen oleh donor yang bekerja di Indonesia",
      E: "Hanya (a) dan (d) benar",
    },
  },
  "PERENCANAAN|45": {
    optionFix: {
      A: "(a) Melindungi segenap bangsa Indonesia dan seluruh tumpah darah Indonesia",
      B: "(b) Perencanaan adalah proses pendefinisian tujuan dan membuat strategi untuk pencapaian tujuan tersebut; memajukan kesejahteraan umum, mencerdaskan kehidupan bangsa, dan ikut melaksanakan ketertiban dunia",
      C: "(c) Mewujudkan persatuan Indonesia",
      D: "(d) Mewujudkan keadilan sosial bagi seluruh rakyat Indonesia",
      E: "Hanya (a) dan (d) benar",
    },
  },
  "PERENCANAAN|52": {
    stemOverride:
      "Pernyataan tujuan pembangunan nasional sebagaimana yang tercantum dalam Pembukaan UUD 1945 merupakan landasan bagi arah perencanaan pembangunan kedepan. Dari beberapa pernyataan yang ada dibawah ini, menurut saudara manakah pernyataan yang kurang tepat :",
  },
};

const SKIP = new Set(["SOSIAL|25", "SPASIAL|21", "SPASIAL|8", "PERENCANAAN|81", "PERENCANAAN|82"]);

const MANUAL_ANSWERS = {
  "PERENCANAAN|70": 1,
  "EKONOMI|2": 1,
  "EKONOMI|24": 1,
};

function clean(s) {
  return s.replace(/\u200b/g, "").replace(/\s+/g, " ").trim();
}

function letterToIndex(l) {
  return l.toUpperCase().charCodeAt(0) - 65;
}

/** Potong pembahasan sebelum teks soal berikutnya bocor */
function trimPembahasan(pemb, qNo) {
  let cut = -1;
  for (let n = qNo + 1; n <= qNo + 5; n++) {
    const patterns = [
      new RegExp(`\\n\\s*${n}\\.\\s*[\\u200b]?`, "m"),
      new RegExp(`\\s${n}\\.\\s*[\\u200b]?[A-Za-z]`, "m"),
    ];
    for (const re of patterns) {
      const idx = pemb.search(re);
      if (idx !== -1 && (cut === -1 || idx < cut)) cut = idx;
    }
  }
  if (cut !== -1) pemb = pemb.slice(0, cut);
  return pemb.trim();
}

/** Pecah pembahasan menjadi blok per opsi A–E (hanya marker A. / A →) */
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

function isWrongMark(text) {
  return text.includes("❌");
}

function isRightMark(text) {
  return text.includes("✅") || /✔/.test(text);
}

function extractAnswer(pemb, stem = "") {
  const flat = pemb.replace(/\s+/g, " ");

  // Kesimpulan eksplisit (paling andal) — pola di akhir teks diprioritaskan
  const conclusionPats = [
    /\(([A-Ea-e])\)\s*$/,
    /kecuali\s*(?:adalah\s*)?(?:opsi\s*)?\(([A-Ea-e])\)/i,
    /bukan termasuk kelemahan\s*\(([A-Ea-e])\)/i,
    /Jawaban\s*benar\s*semua\s*\(([A-Ea-e])\)/i,
    /Jawaban\s*:\s*Semua\s*Benar\s*\(([A-Ea-e])\)/i,
    /Pilihan yang benar adalah\s+.*?\(([A-Ea-e])\)/i,
    /Jawaban\s*:\s*\(([A-Ea-e])\)/i,
    /Jawaban\s*:\s*([A-Ea-e])(?:\s*$|\s*\n)/im,
    /Jawaban\s*\(([A-Ea-e])\)/i,
    /jawaban(?:nya)?\s*(?:adalah|yang salah adalah)\s*\(([A-Ea-e])\)/i,
    /Ringkasan Cepat\s*:\s*\(([A-Ea-e])\)/i,
  ];
  for (const pat of conclusionPats) {
    const m = pemb.match(pat);
    if (m) return letterToIndex(m[1]);
  }

  const blocks = optionBlocks(flat);

  // Soal "kecuali" → satu-satunya opsi ❌ tanpa ✅
  if (/kecuali/i.test(stem)) {
    const wrongOnly = blocks.filter((b) => isWrongMark(b.text) && !isRightMark(b.text));
    if (wrongOnly.length >= 1) return letterToIndex(wrongOnly[wrongOnly.length - 1].letter);
  }

  const checked = blocks.filter((b) => isRightMark(b.text) && !isWrongMark(b.text));
  if (checked.length === 1) return letterToIndex(checked[0].letter);

  // Banyak opsi benar → cari opsi gabungan (hanya a dan c, a dan d, semua benar)
  if (checked.length > 1) {
    const compound = blocks.find(
      (b) => /hanya|semua|dan.*benar/i.test(b.text) && (isRightMark(b.text) || /benar/i.test(b.text))
    );
    if (compound) return letterToIndex(compound.letter);
  }

  if (checked.length) return letterToIndex(checked[checked.length - 1].letter);

  const pats = [/benar\s*\(([A-Ea-e])\)/i, /adalah\s*\(([A-Ea-e])\)/i, /\(([A-Ea-e])\)\s*$/];
  for (const pat of pats) {
    const m = pemb.match(pat);
    if (m) return letterToIndex(m[1]);
  }
  const all = [...pemb.matchAll(/\(([A-Ea-e])\)/g)];
  return all.length ? letterToIndex(all[all.length - 1][1]) : -1;
}

function buildExplain(pemb, corr) {
  if (corr?.explainOverride) return corr.explainOverride;
  let explain = clean(pemb);
  if (explain.length > 1200) {
    explain = explain.slice(0, 1200).replace(/\s+\S*$/, "") + "…";
  }
  if (corr?.explainNote) explain = corr.explainNote + " " + explain;
  return explain;
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
      // Hindari gabung tabel/baris non-opsi ke opsi terakhir (mis. EKONOMI no.9)
      if (/^Indikator\s+/i.test(line) || /^\d+\.\s/.test(line)) break;
      options[options.length - 1] = clean(options[options.length - 1] + " " + line);
    } else if (mode === "stem") {
      stemParts.push(line);
    }
  }

  const stem = clean(stemParts.join(" "));
  if (options.length < 2 || stem.length < 12) return null;
  return { no, stem, options };
}

function hasCompoundOptionRefs(options) {
  const patterns = [
    /hanya\s+(?:butir|\([a-e]\)|pernyataan|jawaban)/i,
    /butir\s*\(?[a-e]\)?\s+dan\s*\(?[a-e]\)?/i,
    /butir\s+[a-e]\s+dan\s+[a-e]/i,
    /^\([a-e]\)\s+dan\s+\([a-e]\)/i,
    /^[a-e]\s+dan\s+[a-e]\s+benar/i,
  ];
  return options.some((o) => patterns.some((p) => p.test(o)));
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

    const before = chunks[i - 1];
    const q = parseQuestionBlock(before);
    if (!q) continue;

    let pemb = trimPembahasan(chunks[i], q.no);

    const key = `${section}|${q.no}`;
    if (SKIP.has(key)) continue;

    const corr = CORRECTIONS[key];
    let answer = MANUAL_ANSWERS[key] ?? extractAnswer(pemb, q.stem);
    if (answer < 0) {
      if (key === "SPASIAL|14") answer = 2;
      else continue;
    }

    let explain = buildExplain(pemb, null);
    const optArr = [...q.options];

    if (corr) {
      if (corr.answer != null) answer = corr.answer;
      if (corr.stemOverride) q.stem = corr.stemOverride;
      if (corr.optionFix) {
        for (const [k, v] of Object.entries(corr.optionFix)) {
          const idx = letterToIndex(k);
          if (idx < optArr.length) optArr[idx] = v;
        }
      }
      explain = buildExplain(pemb, corr);
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
      fixedOptions: hasCompoundOptionRefs(optArr),
      version: corr ? 2 : 1,
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
    if (q.fixedOptions) o += `    fixedOptions: true,\n`;
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
