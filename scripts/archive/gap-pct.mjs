const gaps = {
  teknis: [
    { id:"jfp", label:"JFP & Permen PAN RB 4/2020 (4 kompetensi teknis, Bloom C2/C3)", w:10, trans:10, bank:0, bahan:0 },
    { id:"eval3", label:"Evaluasi 3 tahap (ex ante, ongoing, ex post)", w:9, trans:8, bank:0, bahan:1 },
    { id:"ego", label:"Ego sektoral & ego daerah", w:7, trans:10, bank:0, bahan:0 },
    { id:"poic", label:"POIC (planning-organizing-actuating-controlling)", w:6, trans:5, bank:0, bahan:0 },
    { id:"rantai", label:"Rantai input-output-outcome-impact (eksplisit)", w:4, trans:6, bank:2, bahan:1 },
    { id:"smart", label:"Indikator SMART & kriteria pemilihan alternatif", w:3, trans:4, bank:2, bahan:1 },
    { id:"5m", label:"5M input perencanaan (man, money, material, method)", w:2, trans:2, bank:0, bahan:0 },
    { id:"hierarki", label:"Hierarki dokumen KL-Prov-Kab-Kel terpadu", w:3, trans:5, bank:3, bahan:2 },
  ],
  ekonomi: [
    { id:"kegagalan", label:"Kegagalan pasar (4 jenis + campur tangan pemerintah)", w:10, trans:30, bank:0, bahan:0 },
    { id:"barang", label:"Taksonomi barang (private, public, club, common, tragedy)", w:9, trans:12, bank:0, bahan:0 },
    { id:"chenery", label:"Chenery-Syrquin (5 faktor struktur ekonomi)", w:6, trans:2, bank:0, bahan:2 },
    { id:"klassen", label:"Matriks Klassen (pertumbuhan vs kontribusi)", w:6, trans:2, bank:0, bahan:2 },
    { id:"paradigma", label:"Paradigma pembangunan (capabilities, Todaro, Stiglitz)", w:5, trans:3, bank:0, bahan:0 },
    { id:"kegagalan-pem", label:"Kegagalan pemerintah vs kegagalan pasar", w:4, trans:4, bank:0, bahan:0 },
    { id:"floor", label:"Floor/ceiling price (soal aplikasi kebijakan)", w:3, trans:3, bank:1, bahan:2 },
    { id:"icor-gini", label:"ICOR & Gini (interpretasi kasus)", w:3, trans:4, bank:2, bahan:2 },
  ],
  sosial: [
    { id:"permen900", label:"Permen 900 / SIPD / indikator kerja vs kinerja", w:9, trans:9, bank:0, bahan:0 },
    { id:"stakeholder", label:"Matriks stakeholder (power-interest, strategi)", w:8, trans:8, bank:1, bahan:1 },
    { id:"pendampingan", label:"Pendampingan vs fasilitasi", w:7, trans:6, bank:0, bahan:0 },
    { id:"chambers", label:"Chambers - lima deprivasi kemiskinan", w:6, trans:5, bank:1, bahan:1 },
    { id:"gender", label:"Gender, inklusi, difabel, kelompok rentan", w:6, trans:6, bank:1, bahan:1 },
    { id:"partisipasi", label:"Partisipasi efektif (kesadaran, kemampuan, kemauan, kesempatan)", w:5, trans:7, bank:2, bahan:2 },
    { id:"mbg", label:"Studi kasus kebijakan sosial (MBG dll)", w:4, trans:4, bank:1, bahan:0 },
    { id:"eval-kebijakan", label:"Evaluasi program sosial / kebijakan publik", w:5, trans:6, bank:2, bahan:1 },
  ],
  spasial: [
    { id:"pbg", label:"PBG / SLF / alur perizinan bangunan gedung", w:8, trans:6, bank:1, bahan:1 },
    { id:"sig", label:"SIG / QGIS / peta tematik / analisis spasial", w:7, trans:5, bank:1, bahan:0 },
    { id:"lvc", label:"Land value capture / nilai tambah ruang", w:6, trans:3, bank:0, bahan:0 },
    { id:"asas", label:"Asas perencanaan (proporsionalitas, keterbukaan, akuntabilitas)", w:6, trans:2, bank:0, bahan:0 },
    { id:"institutional", label:"Institutional capability", w:5, trans:3, bank:0, bahan:0 },
    { id:"ikn", label:"IKN / PSN / proyek strategis nasional", w:5, trans:4, bank:2, bahan:1 },
    { id:"mitigasi", label:"Mitigasi bencana & adaptasi iklim (kasus)", w:5, trans:5, bank:3, bahan:2 },
    { id:"proyeksi", label:"Proyeksi penduduk (geometrik, aritmatik, Delphi)", w:4, trans:4, bank:3, bahan:2 },
  ],
};

function gapScore(t) {
  const bankGap = t.bank === 0 ? 3 : t.bank <= 1 ? 2 : 1;
  const bahanGap = t.bahan === 0 ? 2 : t.bahan <= 1 ? 1 : 0.5;
  return t.w * (bankGap + bahanGap) * (1 + Math.min(t.trans, 15) / 15);
}

const rows = [];
let total = 0;
for (const [cluster, topics] of Object.entries(gaps)) {
  let sum = 0;
  for (const t of topics) {
    t.score = gapScore(t);
    sum += t.score;
    total += t.score;
  }
  rows.push({ cluster, topics, sum, count: topics.length, priority: topics.filter(t => t.bank === 0 && (t.bahan === 0 || t.w >= 6)).length });
}
for (const r of rows) {
  r.pct = Math.round((r.sum / total) * 1000) / 10;
}
// normalize to 100
const raw = rows.reduce((a,r)=>a+r.pct,0);
for (const r of rows) r.pctRounded = Math.round(r.pct / raw * 100);
const diff = 100 - rows.reduce((a,r)=>a+r.pctRounded,0);
rows[0].pctRounded += diff;

console.log(JSON.stringify({ totalGapScore: total, clusters: rows.map(r=>({
  cluster:r.cluster,
  pct:r.pct,
  pctRounded:r.pctRounded,
  materiBelumLengkap:r.count,
  prioritasTinggi:r.priority,
  topics:r.topics.map(t=>({label:t.label, score:Math.round(t.score), bank:t.bank, bahan:t.bahan}))
}))}, null, 2));