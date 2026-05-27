import fs from "fs";
import path from "path";
import vm from "vm";
import { fileURLToPath } from "url";
const ROOT = path.dirname(fileURLToPath(import.meta.url));
const APP = path.join(ROOT, "..");
const REPO = path.join(APP, "..");
function readText(p) { const b = fs.readFileSync(p); return b[0]===0xff&&b[1]===0xfe ? b.toString("utf16le") : b.toString("utf8"); }
const TOPICS = [
  { id:"jfp", label:"JFP Permen PAN", re:/permen\s*pan|kompetensi\s*jabatan|bloom|jabatan\s*fungsional\s*perencana/i, c:"teknis"},
  { id:"eval-ante", label:"Evaluasi ante ex-post", re:/evaluasi\s*ante|ex\s*post/i, c:"teknis"},
  { id:"ego", label:"Ego sektoral daerah", re:/ego\s*sektoral|ego\s*daerah/i, c:"teknis"},
  { id:"poac", label:"POAC POIC", re:/\bpoac\b|\bpoic\b|actuating|controlling/i, c:"teknis"},
  { id:"5m", label:"5M input", re:/\b5m\b|main.*money.*material/i, c:"teknis"},
  { id:"kegagalan", label:"Kegagalan pasar", re:/kegagalan\s*pasar|eksternalitas|asimetri/i, c:"ekonomi"},
  { id:"public", label:"Barang publik club common", re:/barang\s*publik|club\s*good|tragedy/i, c:"ekonomi"},
  { id:"chenery", label:"Chenery Syrquin", re:/chenery|syrquin/i, c:"ekonomi"},
  { id:"klassen", label:"Klassen", re:/klassen/i, c:"ekonomi"},
  { id:"capabilities", label:"Capabilities Todaro", re:/capabilities|todaro|stiglitz/i, c:"ekonomi"},
  { id:"permen900", label:"Permen 900 SIPD", re:/permen\s*900|\bsipd\b/i, c:"sosial"},
  { id:"pendampingan", label:"Pendampingan fasilitasi", re:/pendampingan.*fasilitasi|fasilitasi.*pendampingan/i, c:"sosial"},
  { id:"chambers5", label:"Chambers 5 deprivasi", re:/lima\s*deprivasi|5\s*deprivation/i, c:"sosial"},
  { id:"asas", label:"Asas perencanaan", re:/asas\s*perencanaan|proporsionalitas/i, c:"spasial"},
  { id:"institutional", label:"Institutional capability", re:/institutional\s*capability/i, c:"spasial"},
  { id:"lvc", label:"Land value capture", re:/land\s*value\s*capture/i, c:"spasial"},
  { id:"ikn", label:"IKN PSN", re:/\bikn\b|\bpsn\b|ibu\s*kota\s*nusantara/i, c:"spasial"},
  { id:"sig", label:"SIG QGIS", re:/\bsig\b|qgis/i, c:"spasial"},
  { id:"pbg", label:"PBG SLF detail", re:/persetujuan\s*bangunan|\bslf\b/i, c:"spasial"},
];
function hits(t,re){const m=t.match(new RegExp(re.source,re.flags+"g"));return m?m.length:0;}
const trans=["materi teknis perencanaan.txt","materi ekonomi.txt","materi perencanaan pembangunan sosial.txt","materi spasial.txt","materi spasial 2.txt"].map(f=>readText(path.join(REPO,"materi tambahan",f))).join("\n");
const bahan=readText(path.join(REPO,"Bahan Belajar UKOM Perencana Ahli Muda-utf8.html"));
const code=fs.readFileSync(path.join(APP,"soal-bank.js"),"utf8");
const ctx={}; vm.runInNewContext(code+"\nthis.ALL=[...BANK,...BANK_KASUS,...BANK_PRETEST,...BANK_PRETEST_VARIAN,...BANK_SIMULASI];",ctx);
const bank=ctx.ALL; const bt=bank.map(q=>q.stem+" "+q.options.join(" ")).join(" ");
const gaps=TOPICS.map(t=>({...t,trans:hits(trans,t.re),bah:hits(bahan,t.re),bnk:hits(bt,t.re)})).filter(g=>g.trans>=1&&(g.bnk<=1||g.bah<=1));
console.log("Bank",bank.length,"Gap",gaps.length);
gaps.forEach(g=>console.log(g.c,g.label,"T:"+g.trans,"B:"+g.bah,"S:"+g.bnk));
fs.writeFileSync(path.join(APP,"gap-analysis-report.json"),JSON.stringify({gaps},null,2));