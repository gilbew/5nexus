import fs from "fs";
import path from "path";
import vm from "vm";
import { fileURLToPath } from "url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const PARTS = path.join(ROOT, "scripts", "parts");

function loadBank(file, varName) {
  const code = fs.readFileSync(path.join(PARTS, file), "utf8");
  const ctx = {};
  vm.runInNewContext(code + `\nthis.B=${varName};`, ctx);
  return ctx.B;
}

function scoreLengthLeak(q) {
  const lens = q.options.map((o) => o.length);
  const c = lens[q.answer];
  const wrong = lens.filter((_, i) => i !== q.answer);
  const maxW = Math.max(...wrong);
  const avgW = wrong.reduce((a, b) => a + b, 0) / wrong.length;
  if (c >= maxW * 1.75 && c - maxW >= 20) return "high";
  if (c >= maxW * 1.45 && c - maxW >= 15) return "med";
  if (c >= avgW * 1.8 && c - avgW >= 25) return "med";
  return null;
}

function scoreShortDistract(q) {
  const c = q.options[q.answer].length;
  const n = q.options.filter((o, i) => i !== q.answer && o.length <= 28 && c >= 55).length;
  if (n >= 3) return "high";
  if (n >= 2) return "med";
  return null;
}

function scoreHomogeneous(q) {
  const words = q.options.map((o) => o.trim().split(/\s+/).length);
  const c = words[q.answer];
  const avgW = words.filter((_, i) => i !== q.answer).reduce((a, b) => a + b, 0) / 4;
  if (c >= 12 && avgW <= 4) return "high";
  if (c >= 10 && avgW <= 5) return "med";
  return null;
}

function distinctiveStemTokens(stem) {
  const special = [];
  for (const x of stem.match(/\b[A-Z]{2,}(?:\/[A-Z]+)?\b/g) || []) special.push(x.toLowerCase());
  for (const x of stem.match(/\b(?:uu|pp|perpres|permen|permendagri|permenpan|perda|kepmen)\s*[\w./-]*/gi) || []) {
    special.push(x.toLowerCase().replace(/\s+/g, " "));
  }
  for (const x of stem.match(/\b(?:chenery|syrquin|klassen|hirschman|myrdal|rostow|friedmann|christaller|losch|weber|thunen|lewis|todaro|harris|porter|bloom|maslow|poic|sipd|lq|dlq|icor|gini|pbg|slf|kkpr|rdtr|rtrw|rpjmd|rpjmn|rpjpn|rkpd|sdgs|esdm|ndvi|rth|opd)\b/gi) || []) {
    special.push(x.toLowerCase());
  }
  return [...new Set(special.filter((t) => t.length >= 2))];
}

function scoreTheoryEcho(q) {
  const marks = distinctiveStemTokens(q.stem);
  if (!marks.length) return null;
  let unique = false;
  let near = false;
  for (const m of marks) {
    const inOpts = q.options.map((o) => o.toLowerCase().includes(m));
    if (inOpts[q.answer] && inOpts.filter(Boolean).length === 1) unique = true;
    else if (inOpts[q.answer] && inOpts.filter(Boolean).length <= 2 && m.length >= 4) near = true;
  }
  if (unique) return "high";
  if (near) return "med";
  return null;
}

function scoreAbsolute(q) {
  const ABS = /(^|\s)(hanya|selalu|pasti|tidak pernah|otomatis|semua benar|semua salah)(\s|[.,]|$)/i;
  const bad = q.options.filter((o, i) => i !== q.answer && ABS.test(o)).length;
  if (bad >= 3) return "med";
  if (bad >= 2) return "low";
  return null;
}

function scoreStemClarity(q) {
  const stem = q.stem.trim();
  const issues = [];
  if ((stem.match(/\?/g) || []).length > 1) issues.push("multi-question");
  if (/\b(namun|tetapi|akan tetapi).*\b(namun|tetapi)\b/i.test(stem)) issues.push("multi-contrast");
  if (/\b(adalah|merupakan|yaitu)\s*$/i.test(stem.replace(/[.…]+$/, ""))) issues.push("dangling");
  if (/\b[A-E][\).]\s+\S+.*\b[A-E][\).]/i.test(stem)) issues.push("options-in-stem");
  if (!issues.length) return null;
  return issues.some((i) => ["options-in-stem", "multi-question", "dangling"].includes(i)) ? "high" : "med";
}

function flagsOf(q) {
  return [
    ["length-leak", scoreLengthLeak(q)],
    ["theory-echo", scoreTheoryEcho(q)],
    ["short-distract", scoreShortDistract(q)],
    ["homogeneous", scoreHomogeneous(q)],
    ["stem-clarity", scoreStemClarity(q)],
    ["absolute", scoreAbsolute(q)],
  ].filter(([, s]) => s && s !== "low");
}

function soften(t) {
  // Idempotent: skip tokens already softened
  return t
    .replace(/\b(?<!dianggap )pasti\b/gi, "dianggap pasti")
    .replace(/\bselalu\b/gi, "cenderung")
    .replace(/\b(?<!langsung dianggap )otomatis\b/gi, "langsung dianggap")
    .replace(/\btidak pernah\b/gi, "umumnya tidak")
    .replace(/\b(?<!semata )hanya\b/gi, "semata")
    .replace(/(dianggap\s+){2,}/gi, "dianggap ");
}

function hash(s) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

const ELAB = [
  "Langkah ini tampak praktis, tetapi mengabaikan substansi yang dituntut soal.",
  "Opsi ini menyederhanakan masalah sehingga rekomendasi kebijakan menjadi keliru.",
  "Pendekatan itu mempercepat administrasi, namun melemahkan kualitas analisis.",
  "Pilihan tersebut menggeser fokus dari sasaran utama ke aktivitas yang mudah diukur.",
  "Respons ini menghindari kompleksitas lapangan dan berisiko salah sasaran.",
  "Usulan itu mengabaikan bukti kebutuhan serta mekanisme koreksi kinerja.",
  "Cara ini menunda penanganan substantif meski risiko di lapangan terus meningkat.",
  "Alternatif tersebut tampak netral, tetapi tidak menjawab inti persoalan perencanaan.",
];

const DANGLE =
  /\b(tanpa|yang|dan|atau|serta|karena|untuk|dengan|dalam|pada|dari|ke|bagi|oleh|agar|jika|sehingga|meskipun|padahal|namun|tetapi)\.?$/i;

function cleanEnd(t) {
  let s = t.trim();
  while (DANGLE.test(s) || /[,;:]\s*$/.test(s)) {
    s = s.replace(/\s+\S+\.?$/, "").replace(/[,;:]\s*$/, "").trim();
    if (s.length < 20) break;
  }
  if (!/[.?!]$/.test(s)) s += ".";
  return s;
}

function trimTo(text, maxLen) {
  if (text.length <= maxLen) return cleanEnd(text);
  const cut = text.slice(0, maxLen - 1);
  const idx = Math.max(cut.lastIndexOf(". "), cut.lastIndexOf(", "), cut.lastIndexOf(" "));
  const t = (idx > maxLen * 0.45 ? cut.slice(0, idx) : cut).trim();
  return cleanEnd(t);
}

function shortenCorrect(text) {
  const t = text.trim();
  if (t.length <= 118) return cleanEnd(t);
  const m = t.match(/^(.*?)([;,]\s*(?:sehingga|sambil|agar|karena|meskipun)\b.*)$/i);
  if (m && m[1].length >= 60) return cleanEnd(m[1]);
  const parts = t.split(", ");
  if (parts.length >= 3) {
    let acc = parts[0];
    for (let i = 1; i < parts.length; i++) {
      const next = `${acc}, ${parts[i]}`;
      if (next.length > 118) break;
      acc = next;
    }
    if (acc.length >= 60) return cleanEnd(acc);
  }
  return trimTo(t, 118);
}

function expandDistractor(opt, targetLen, idx, id) {
  let base = soften(opt.trim()).replace(/\.+$/, "");
  if (base.length >= Math.floor(targetLen * 0.9)) return cleanEnd(base);

  // Complete-sentence variants only — never truncate mid-clause
  const variants = [
    `${base} sebagai jalan pintas yang mengabaikan substansi perencanaan.`,
    `${base}, meskipun bukti dan konteks masalah menuntut pendekatan yang berbeda.`,
    `${base} sehingga fokus bergeser ke aktivitas mudah diukur dan menjauh dari sasaran.`,
    `${base}; pilihan ini mempercepat administrasi tetapi melemahkan kualitas analisis.`,
    `${base} tanpa menelaah dampak terhadap kelompok penerima manfaat utama.`,
    `${base}, padahal opsi tersebut tidak menjawab inti persoalan yang diuji.`,
    `${base} sehingga risiko salah sasaran dan inefisiensi kebijakan meningkat.`,
    `${base} dengan mengabaikan keterkaitan dokumen, indikator, dan bukti lapangan.`,
  ];

  const minLen = Math.floor(targetLen * 0.85);
  const maxLen = targetLen + 28;
  // Rotate by hash for variety; prefer variants in the target length band
  const start = (hash(base + id) + idx * 3) % variants.length;
  const rotated = [...variants.slice(start), ...variants.slice(0, start)];
  let best =
    rotated.find((v) => v.length >= minLen && v.length <= maxLen) ||
    rotated.find((v) => v.length >= minLen) ||
    null;
  if (!best) {
    const a = rotated[0];
    const b = ELAB[(hash(base + id) + idx + 1) % ELAB.length];
    best = `${a} ${b}`;
  }
  return cleanEnd(best);
}

const SPECIALS = JSON.parse(fs.readFileSync(path.join(ROOT, "scripts", "_gap23-specials.json"), "utf8"));

function polish(q) {
  const sp = SPECIALS[q.id];
  let stem = sp?.stem ?? q.stem;
  let options = [...(sp?.options ?? q.options)];
  const answer = sp?.answer ?? q.answer;
  const originals = [...options];

  options[answer] = shortenCorrect(options[answer]);
  options = options.map((o, i) => (i === answer ? o : soften(o)));

  for (const m of distinctiveStemTokens(stem)) {
    const hits = options.map((o) => o.toLowerCase().includes(m));
    if (hits[answer] && hits.filter(Boolean).length <= 2) {
      let need = 3 - hits.filter(Boolean).length;
      for (let i = 0; i < options.length && need > 0; i++) {
        if (i === answer || hits[i]) continue;
        options[i] = cleanEnd(
          `${options[i].replace(/\.+$/, "")}${m.length <= 5 ? ` pada konteks ${m.toUpperCase()}` : ` dalam bacaan ${m}`}`
        );
        need--;
      }
    }
  }

  let probe = { stem, options, answer };
  const needsLen =
    scoreLengthLeak(probe) || scoreShortDistract(probe) || scoreHomogeneous(probe);

  if (needsLen) {
    const target = Math.max(60, Math.floor(options[answer].length * 0.88));
    for (let i = 0; i < options.length; i++) {
      if (i === answer) continue;
      options[i] = expandDistractor(options[i], target, i, q.id);
    }
  }

  probe = { stem, options, answer };
  if (scoreLengthLeak(probe) || scoreShortDistract(probe) || scoreHomogeneous(probe)) {
    // Prefer expanding distractors further before cutting the correct option
    const t2 = Math.max(62, Math.floor(options[answer].length * 0.92));
    for (let i = 0; i < options.length; i++) {
      if (i === answer) continue;
      options[i] = expandDistractor(originals[i], t2, i, q.id);
    }
    probe = { stem, options, answer };
    if (scoreLengthLeak(probe)) {
      options[answer] = shortenCorrect(options[answer]);
      if (options[answer].length > 100) options[answer] = cleanEnd(trimTo(options[answer], 100));
      const t3 = Math.max(60, Math.floor(options[answer].length * 0.9));
      for (let i = 0; i < options.length; i++) {
        if (i === answer) continue;
        options[i] = expandDistractor(originals[i], t3, i, q.id);
      }
    }
  }

  options = options.map((o, i) => (i === answer ? cleanEnd(o) : cleanEnd(soften(o))));
  return { ...q, stem, options, answer };
}

function serializeBank(varName, bank) {
  const body = bank
    .map((q) => {
      const opts = q.options.map((o) => `      ${JSON.stringify(o)},`).join("\n");
      return `  {
    id: ${JSON.stringify(q.id)},
    cluster: ${JSON.stringify(q.cluster)},
    level: ${JSON.stringify(q.level)},
    source: ${JSON.stringify(q.source)},
    topic: ${JSON.stringify(q.topic)},
    stem: ${JSON.stringify(q.stem)},
    options: [
${opts}
    ],
    answer: ${q.answer},
    explain: ${JSON.stringify(q.explain)},
    version: ${q.version ?? 1}
  }`;
    })
    .join(",\n");
  return `// Bank soal gap UKOM Perencana Ahli Muda — dipoles kualitas (Approach C)
const ${varName} = [
${body}
];
`;
}

const specialsPath = path.join(ROOT, "scripts", "_gap23-specials.json");
if (!fs.existsSync(specialsPath)) {
  throw new Error("Missing scripts/_gap23-specials.json");
}

const g2 = loadBank("gap200.js", "BANK_GAP2");
const g3 = loadBank("gap300.js", "BANK_GAP3");
if (g2.length !== 100 || g3.length !== 50) throw new Error("unexpected bank length");

let n = 0;
function run(bank) {
  return bank.map((q) => {
    if (!flagsOf(q).length && !SPECIALS[q.id]) return q;
    n++;
    return polish(q);
  });
}

let f2 = run(g2);
let f3 = run(g3);
for (let p = 0; p < 3; p++) {
  f2 = f2.map((q) => (flagsOf(q).length ? polish(q) : q));
  f3 = f3.map((q) => (flagsOf(q).length ? polish(q) : q));
}

fs.writeFileSync(path.join(PARTS, "gap200.js"), serializeBank("BANK_GAP2", f2), "utf8");
fs.writeFileSync(path.join(PARTS, "gap300.js"), serializeBank("BANK_GAP3", f3), "utf8");

const left2 = f2.flatMap((q) => flagsOf(q).map((f) => `${q.id}:${f[0]}:${f[1]}`));
const left3 = f3.flatMap((q) => flagsOf(q).map((f) => `${q.id}:${f[0]}:${f[1]}`));
console.log("polished", n);
console.log("left2", left2.length, left2.slice(0, 25));
console.log("left3", left3.length, left3.slice(0, 25));

let formula = 0;
let trunc = 0;
let over = 0;
for (const q of [...f2, ...f3]) {
  q.options.forEach((o, i) => {
    if (/Memilih fokus pada |dalam penanganan isu /.test(o)) formula++;
    if (i === q.answer && DANGLE.test(o.replace(/\.$/, ""))) trunc++;
    if (i !== q.answer && o.length > q.options[q.answer].length + 25) over++;
  });
}
console.log({ formula, trunc, over, len2: f2.length, len3: f3.length });
