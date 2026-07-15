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

const TOUCH = {
  "G2-E28": [
    "ICOR dapat memburuk karena investasi belum segera menghasilkan tambahan output.",
    "ICOR dianggap turun tajam karena jalan langsung dianggap produktif tanpa lag output.",
    "ICOR tidak dapat dihitung untuk investasi fisik sehingga analisis efisiensi diabaikan.",
    "ICOR semata mengukur kemiskinan sehingga tidak relevan untuk menilai produktivitas investasi.",
    "ICOR membaik jika serapan anggaran tinggi meskipun output tambahan belum terlihat.",
  ],
  "G2-S11": [
    "Jumlah uang tunai diperlakukan sebagai satu-satunya dimensi kemiskinan tanpa dimensi sosial.",
    "Kemiskinan dipandang tidak terkait relasi sosial maupun akses terhadap kelembagaan publik.",
    "Isolasi dan powerlessness yang menghambat rumah tangga miskin mengakses program.",
    "Warga miskin dianggap memiliki akses informasi dan prosedur yang setara dengan kelompok lain.",
    "Prosedur administrasi dianggap netral sehingga hambatan struktural tidak perlu dianalisis.",
  ],
  "G2-T05": [
    "C2, karena tugas terbatas memahami definisi irigasi tanpa menganalisis struktur masalah.",
    "C4, karena menganalisis struktur masalah dan hubungan antarbagian.",
    "C3, karena sekadar menerapkan rumus volume air tanpa membaca hubungan sistemik.",
    "C6, karena harus menciptakan teori baru tanpa memakai kerangka analisis yang ada.",
    "C1, karena terbatas mengingat istilah output tanpa menguraikan keterkaitan masalah.",
  ],
  "G2-T26": [
    "C1 karena peserta terbatas menyebut istilah tanpa memberi penilaian berbasis kriteria.",
    "C2 karena terbatas menerjemahkan data tanpa menyusun argumen prioritas.",
    "C5 karena ada penilaian prioritas berbasis kriteria dan argumen.",
    "C3 karena memakai rumus baku tanpa menimbang kriteria nilai dan prioritas.",
    "C6 karena tugas menciptakan model baru tanpa menilai opsi yang ada.",
  ],
  "G3-E06": [
    "Mi instan murah dalam kasus ini berperilaku sebagai barang inferior, sedangkan protein segar cenderung barang normal.",
    "Keduanya dianggap barang publik semata karena dikonsumsi banyak orang tanpa melihat efek pendapatan.",
    "Protein segar disebut barang inferior karena harganya lebih mahal, bukan karena respons terhadap pendapatan.",
    "Mi instan murah dianggap barang Giffen pada semua kondisi tanpa bukti pola konsumsi yang memadai.",
    "Perubahan pendapatan dianggap tidak memengaruhi pola konsumsi rumah tangga sama sekali.",
  ],
  "G3-T06": [
    "Program A dianggap lebih baik karena kecepatan penyaluran diperlakukan sebagai tujuan akhir.",
    "Program B dianggap tidak relevan karena outcome pendidikan dipandang tidak perlu diukur.",
    "Program A tampak lebih efisien secara proses, tetapi Program B lebih efektif terhadap tujuan pendidikan.",
    "Kedua program tidak dapat dibandingkan semata karena anggarannya sama besar.",
    "Efisiensi dan efektivitas dianggap selalu memberi kesimpulan yang identik dalam evaluasi program.",
  ],
  "G2-P13": [
    "Price ceiling sewa rumah untuk menekan biaya hunian tanpa menangkap kenaikan nilai lahan publik.",
    "Subsidi BBM umum yang menurunkan harga energi tanpa menarget kenaikan nilai akibat investasi ruang.",
    "Bantuan sosial tunai untuk daya beli rumah tangga tanpa instrumen pemulihan nilai lahan publik.",
    "Kuota tangkap ikan untuk menjaga stok sumber daya tanpa kaitan kenaikan nilai properti koridor.",
    "Betterment levy atas kenaikan nilai lahan akibat investasi publik sebagai bentuk land value capture.",
  ],
  "G2-P11": [
    "Daftar hadir rapat desa yang tidak merekam perubahan tutupan lahan antar waktu.",
    "Foto gedung kantor yang tidak menunjukkan dinamika konversi hutan menjadi kebun.",
    "Citra satelit multitemporal yang diklasifikasi dan diverifikasi dengan data lapangan.",
    "Tabel inflasi bulanan yang tidak berkaitan dengan deteksi perubahan tutupan lahan.",
    "Surat undangan musrenbang yang tidak menyediakan bukti spasial perubahan tutupan.",
  ],
  "G2-E08": [
    "Sektor belum basis saat ini, tetapi punya kecenderungan tumbuh lebih cepat dan berpotensi menjadi basis.",
    "Sektor dianggap sudah basis sehingga tidak perlu dukungan meskipun posisi saat ini belum kuat.",
    "Sektor harus ditutup karena nilai dinamisnya tinggi tanpa membaca peluang penguatan basis.",
    "Sektor semata cocok untuk belanja aparatur tanpa kaitannya dengan daya saing produksi lokal.",
    "Indikator dinamis dianggap tidak terkait pertumbuhan sektor sehingga tidak dipakai untuk proyeksi.",
  ],
};

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

const g2 = loadBank("gap200.js", "BANK_GAP2");
const g3 = loadBank("gap300.js", "BANK_GAP3");
let n = 0;
for (const bank of [g2, g3]) {
  for (const q of bank) {
    if (!TOUCH[q.id]) continue;
    q.options = [...TOUCH[q.id]];
    n++;
  }
}
fs.writeFileSync(path.join(PARTS, "gap200.js"), serializeBank("BANK_GAP2", g2), "utf8");
fs.writeFileSync(path.join(PARTS, "gap300.js"), serializeBank("BANK_GAP3", g3), "utf8");
console.log("touched", n);
