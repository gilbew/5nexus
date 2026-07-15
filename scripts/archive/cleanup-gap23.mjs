/**
 * Post-polish cleanup for awkward truncations / soften artifacts in gap2/gap3.
 */
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

function cleanOption(text, isCorrect) {
  let t = text.trim();
  // Fix repeated soften artifacts
  t = t.replace(/(dianggap\s+)+/gi, "dianggap ");
  t = t.replace(/\bdianggap dianggap\b/gi, "dianggap");
  // Fix truncated elab endings
  t = t
    .replace(/\s+dan tidak memperkuat\.?$/i, ".")
    .replace(/\s+dan tidak\.?$/i, ".")
    .replace(/\s+melemah dan tidak\.?$/i, " melemah.")
    .replace(/\ssehingga kualitas keputusan melemah\.?$/i, " sehingga kualitas keputusan melemah.")
    .replace(/\s+Langkah ini tampak praktis\.?$/i, ".")
    .replace(/\s+Pendekatan itu mempercepat administrasi\.?$/i, ".")
    .replace(/\s+Opsi ini menyederhanakan masalah\.?$/i, ".")
    .replace(/\s+Pilihan tersebut menggeser fokus\.?$/i, ".")
    .replace(/\s+Respons ini menghindari kompleksitas lapangan\.?$/i, ".")
    .replace(/\s+Usulan itu mengabaikan bukti kebutuhan\.?$/i, ".")
    .replace(/\s+Cara ini menunda penanganan substantif\.?$/i, ".")
    .replace(/\s+Alternatif tersebut tampak netral\.?$/i, ".");

  // Collapse double spaces / double periods
  t = t.replace(/\s{2,}/g, " ").replace(/\.\.+/g, ".").trim();
  if (!/[.?!]$/.test(t)) t += ".";

  // If still ends with dangling connector, drop last token
  const DANGLE =
    /\b(tanpa|yang|dan|atau|serta|karena|untuk|dengan|dalam|pada|dari|ke|bagi|oleh|agar|jika|sehingga|meskipun|padahal|namun|tetapi|tidak|melemah)\.?$/i;
  while (DANGLE.test(t.replace(/\.$/, "")) && t.length > 40) {
    t = t.replace(/\s+\S+\.?$/, "").trim();
    if (!/[.?!]$/.test(t)) t += ".";
  }

  // Soften absolutists once (distractors only)
  if (!isCorrect) {
    t = t
      .replace(/\bpasti\b/gi, "dianggap pasti")
      .replace(/\bselalu\b/gi, "cenderung")
      .replace(/\botomatis\b/gi, "langsung dianggap")
      .replace(/\bhanya\b/gi, "semata");
    t = t.replace(/(dianggap\s+)+/gi, "dianggap ");
  }
  return t;
}

function ensureLength(q) {
  const options = [...q.options];
  const answer = q.answer;
  const pads = [
    " sehingga rekomendasi menjadi kurang tepat",
    " padahal bukti lapangan menuntut pendekatan lain",
    " meskipun tidak menjawab inti persoalan kasus",
    " sehingga akuntabilitas hasil melemah",
  ];
  for (let n = 0; n < 5; n++) {
    if (!scoreLengthLeak({ ...q, options })) break;
    const cLen = options[answer].length;
    const target = Math.max(58, Math.floor(cLen * 0.88));
    for (let i = 0; i < options.length; i++) {
      if (i === answer) continue;
      let p = 0;
      while (options[i].length < target && p < 4) {
        const add = pads[(i + p) % pads.length];
        if (!options[i].includes(add.slice(0, 20))) {
          options[i] = options[i].replace(/\.$/, "") + add + ".";
        }
        p++;
      }
    }
    // Prefer not to shorten correct further if already clean
  }
  return { ...q, options };
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

function cleanupBank(bank) {
  return bank.map((q) => {
    let options = q.options.map((o, i) => cleanOption(o, i === q.answer));
    let out = { ...q, options };
    out = ensureLength(out);
    out.options = out.options.map((o, i) => cleanOption(o, i === q.answer));
    return out;
  });
}

const g2 = cleanupBank(loadBank("gap200.js", "BANK_GAP2"));
const g3 = cleanupBank(loadBank("gap300.js", "BANK_GAP3"));

fs.writeFileSync(path.join(PARTS, "gap200.js"), serializeBank("BANK_GAP2", g2), "utf8");
fs.writeFileSync(path.join(PARTS, "gap300.js"), serializeBank("BANK_GAP3", g3), "utf8");

// local audit
function flags(q) {
  const lens = q.options.map((o) => o.length);
  const c = lens[q.answer];
  const maxW = Math.max(...lens.filter((_, i) => i !== q.answer));
  const leak = c >= maxW * 1.45 && c - maxW >= 15;
  return leak;
}
const bad2 = g2.filter(flags).map((q) => q.id);
const bad3 = g3.filter(flags).map((q) => q.id);
console.log("length-leakish after cleanup", bad2.length + bad3.length, [...bad2, ...bad3].slice(0, 20));

let awkward = 0;
const AWK = /dan tidak\.|melemah dan tidak|dianggap dianggap|Memilih fokus pada|tanpa kajian berbasis data/;
for (const q of [...g2, ...g3]) {
  for (const o of q.options) if (AWK.test(o)) awkward++;
}
console.log("awkward remaining", awkward);
console.log("sizes", g2.length, g3.length);
