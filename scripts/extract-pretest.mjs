/**
 * Ekstrak soal dari docx Pre Test (teks + highlight).
 * node extract-pretest.mjs
 */
import fs from "fs";
import path from "path";
import { execSync } from "child_process";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DOCX = path.resolve(
  __dirname,
  "../9. Ukom & Posttest/40 Soal Pre Test jwbn lengkap.docx"
);
const OUT = path.join(__dirname, "pretest-raw.json");

function readDocumentXml() {
  const zip = path.join(__dirname, "_pretest.zip");
  const out = path.join(__dirname, "_pretest_extract");
  fs.copyFileSync(DOCX, zip);
  if (fs.existsSync(out)) fs.rmSync(out, { recursive: true });
  fs.mkdirSync(out, { recursive: true });
  execSync(
    `powershell -NoProfile -Command "Expand-Archive -LiteralPath '${zip.replace(/'/g, "''")}' -DestinationPath '${out.replace(/'/g, "''")}' -Force"`,
    { stdio: "pipe" }
  );
  return fs.readFileSync(path.join(out, "word", "document.xml"), "utf8");
}

function isHighlighted(runXml) {
  return (
    /<w:highlight\s+w:val="[^"]+"/i.test(runXml) ||
    /<w:shd\s[^>]*w:fill="(?!auto|FFFFFF)[^"]+"/i.test(runXml) ||
    /<w:shd\s[^>]*w:themeFill="accent/i.test(runXml)
  );
}

function parseParagraphs(xml) {
  const paras = xml.match(/<w:p[\s>][\s\S]*?<\/w:p>/g) || [];
  return paras.map((pXml) => {
    const runs = pXml.match(/<w:r[\s>][\s\S]*?<\/w:r>/g) || [];
    let text = "";
    let highlighted = "";
    for (const r of runs) {
      const ts = [...r.matchAll(/<w:t[^>]*>([\s\S]*?)<\/w:t>/g)].map((m) =>
        m[1].replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&")
      );
      const t = ts.join("");
      if (!t) continue;
      text += t;
      if (isHighlighted(r)) highlighted += t;
    }
    return { text: text.trim(), highlighted: highlighted.trim() };
  }).filter((p) => p.text);
}

function parseQuestions(paragraphs) {
  const questions = [];
  let current = null;

  const flush = () => {
    if (current && current.stem) questions.push(current);
    current = null;
  };

  const qStart = /^(\d+)[.)]\s*(.*)$/;
  const optStart = /^([A-Ea-e])[.)]\s*(.+)$/;

  for (const p of paragraphs) {
    const line = p.text.replace(/\s+/g, " ").trim();
    if (!line) continue;

    const qm = line.match(qStart);
    if (qm) {
      flush();
      current = {
        num: Number(qm[1]),
        stem: qm[2] || "",
        options: [],
        highlightedKeys: [],
        highlightedTexts: [],
      };
      continue;
    }

    const om = line.match(optStart);
    if (om && current) {
      const key = om[1].toUpperCase();
      const label = om[2].trim();
      current.options.push({ key, label, paraHighlight: p.highlighted });
      if (p.highlighted) {
        current.highlightedKeys.push(key);
        current.highlightedTexts.push(p.highlighted.trim());
      }
      continue;
    }

    if (current) {
      if (current.options.length === 0) {
        current.stem += (current.stem ? " " : "") + line;
      } else {
        const last = current.options[current.options.length - 1];
        last.label += " " + line;
        if (p.highlighted) {
          if (!current.highlightedKeys.includes(last.key)) {
            current.highlightedKeys.push(last.key);
            current.highlightedTexts.push(p.highlighted.trim());
          }
          last.paraHighlight = (last.paraHighlight || "") + p.highlighted;
        }
      }
    }
  }
  flush();
  return questions;
}

function main() {
  const xml = readDocumentXml();
  const paragraphs = parseParagraphs(xml);
  const questions = parseQuestions(paragraphs);
  fs.writeFileSync(OUT, JSON.stringify({ paragraphs: paragraphs.length, questions }, null, 2), "utf8");
  console.log("Paragraphs:", paragraphs.length);
  console.log("Questions:", questions.length);
  console.log("Written:", OUT);
  questions.slice(0, 3).forEach((q) => {
    console.log(`\n#${q.num} opts=${q.options.length} hi=${q.highlightedKeys.join(",")}`);
    console.log(q.stem.slice(0, 80) + "...");
  });
}

try {
  main();
} catch (e) {
  console.error(e);
  process.exit(1);
}
