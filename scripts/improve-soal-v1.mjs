/**
 * Perbaiki distraktor bank soal v1 (60 soal).
 * Jalankan: node improve-soal-v1.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SOAL_PATH = path.join(__dirname, "parts", "v1.js");

/** Indeks jawaban benar (0-based) — harus tetap sama setelah penggantian opsi */
const ANSWER_INDEX = {
  1: 1, 2: 2, 3: 2, 4: 2, 5: 1, 6: 2, 7: 1, 8: 1, 9: 1, 10: 2,
  11: 1, 12: 4, 13: 1, 14: 2, 15: 3, 16: 1, 17: 2, 18: 2, 19: 0, 20: 2,
  21: 1, 22: 2, 23: 1, 24: 2, 25: 1, 26: 1, 27: 2, 28: 1, 29: 3, 30: 1,
  31: 1, 32: 1, 33: 1, 34: 1, 35: 1, 36: 0, 37: 1, 38: 1, 39: 2, 40: 3,
  41: 1, 42: 1, 43: 1, 44: 2, 45: 2, 46: 1, 47: 1, 48: 1, 49: 1, 50: 1,
  51: 1, 52: 1, 53: 1, 54: 1, 55: 2, 56: 1, 57: 1, 58: 2, 59: 3, 60: 1,
};

/** Distraktor diperketat — kategori seragam, hampir benar, tanpa opsi lelucon */
const IMPROVED_OPTIONS = {
  1: ["RPJMD (5 tahun)", "RPJPN (20 tahun)", "RKPD (1 tahun)", "RPJPD (20 tahun daerah)", "Renstra K/L (5 tahun)"],
  2: ["Undang-Undang", "Peraturan Pemerintah", "Produk hukum / peraturan perundang-undangan", "Naskah akademik perencanaan", "Panduan teknis internal"],
  3: ["RPJPD", "RPJMD", "RKPD", "RPJPN", "RKP"],
  4: ["Evaluasi akhir periode", "Pengendalian saja", "Monitoring", "Perumusan visi", "Penetapan RPJMN"],
  5: ["RKPD → RPJMD → RPJPD → APBD", "RPJPD → RPJMD → Renstra PD → RKPD → APBD", "RPJPN → RKPD → RPJMD", "Renstra PD → RPJPD → RKPD → APBD", "APBD → RKPD → RPJMD"],
  6: ["Keduanya identik dan diukur hanya dengan PDB", "Pembangunan hanya fokus pada kenaikan PDB", "Pertumbuhan ekonomi adalah salah satu aspek pembangunan yang lebih luas", "Pertumbuhan ekonomi selalu menurunkan kemiskinan", "Pembangunan tidak memerlukan perencanaan"],
  7: ["Mengganti seluruh struktur organisasi", "Menilai capaian dan menentukan lanjut/henti/perbaiki", "Mengukur capaian indikator program secara berkala", "Menetapkan zonasi kawasan tata ruang", "Menganalisis elastisitas permintaan"],
  8: ["RPJPN (20 tahun)", "RPJMN (5 tahun)", "RKPD (1 tahun)", "RPJMD (5 tahun daerah)", "Renja K/L (1 tahun)"],
  9: ["Tindakan preventif tanpa data capaian", "Tindakan korektif berdasarkan temuan monitoring/evaluasi", "Tindakan konsultatif tanpa dasar data", "Penyusunan RPJPN pertama kali", "Partisipasi masyarakat pada tahap perumusan"],
  10: ["Masyarakat sipil", "Media massa", "Pemerintah (pemerintah pusat/daerah)", "Dunia usaha", "Akademisi tanpa mandat resmi"],
  11: ["A benar; RPJPN boleh dilewati", "B benar; RPJPN memberi konsistensi arah jangka panjang sebelum RPJMN/RKPD", "C benar; pertumbuhan PDB sama dengan pembangunan manusiawi", "A dan C benar", "Semua salah karena hanya APBD yang penting"],
  12: ["Penyusunan rencana", "Penetapan rencana", "Pengendalian pelaksanaan", "Evaluasi", "Penetapan tarif pajak daerah"],
  13: [
    "Pernyataan operasional misi untuk mencapai visi",
    "Keadaan/gambaran masa depan daerah yang ingin dicapai",
    "Langkah teknis penyusunan RKPD tahun berjalan",
    "Indikator kinerja tahunan tanpa horizon jangka panjang",
    "Rincian belanja barang per SKPD tahun berjalan",
  ],
  14: [
    "Menghentikan seluruh program tanpa analisis capaian",
    "Menunggu periode rencana baru tanpa penyesuaian program",
    "Koreksi alokasi, jadwal, atau ruang lingkup berdasarkan temuan monitoring-evaluasi",
    "Mengganti visi daerah tanpa meninjau indikator program",
    "Hanya memperbarui target indikator tanpa tinjauan capaian",
  ],
  15: ["RPJPN — 20 tahun", "RPJMD — 5 tahun", "RKPD — 1 tahun", "RPJPD — 5 tahun", "RKP — 1 tahun nasional"],
  16: ["Tertinggal dan perlu ditutup", "Merupakan sektor basis/unggulan relatif terhadap rujukan", "Tidak berkontribusi pada PDB daerah", "Selalu elastis terhadap harga", "Sama dengan DLQ < 1"],
  17: ["Kenaikan harga satu jenis barang sekali", "Penurunan harga umum berkelanjutan", "Kenaikan harga barang dan jasa secara umum secara terus-menerus", "Kenaikan nilai tukar rupiah", "Penurunan jumlah uang beredar saja"],
  18: ["Naik", "Tetap", "Turun", "Tidak terkait harga", "Menjadi tak terbatas"],
  19: ["PDB = C + I + G + (X − M)", "PDB = Gini × ICOR", "PDB = LQ / DLQ", "PDB = inflasi + pengangguran", "PDB = harga × kuantitas saja tanpa komponen"],
  20: [
    "PDB Indonesia",
    "PDRB kabupaten setempat",
    "GNP/GNI Indonesia",
    "PDB riil per kapita tanpa komponen agregat",
    "Nilai ekspor barang dan jasa saja",
  ],
  21: ["Rp 90.000.000", "Rp 150.000.000", "Rp 300.000", "Rp 1.500.000.000", "Rp 15.000.000"],
  22: ["Modal semakin boros", "Investasi kurang efisien menghasilkan output", "Modal relatif lebih efisien menghasilkan pertumbuhan output", "Inflasi pasti tinggi", "Gini coefficient mendekati 1"],
  23: ["Ekspor dan impor", "Inflasi dan pengangguran", "LQ dan DLQ", "Pertanian dan industri saja", "Pajak dan subsidi"],
  24: ["Inelastis", "Unitary", "Elastis", "Nol", "Tidak terdefinisi"],
  25: ["Distribusi pendapatan semakin merata", "Distribusi pendapatan semakin tidak merata", "Tidak ada perubahan ketimpangan", "Inflasi turun", "Sektor basis hilang"],
  26: ["Mengalami pertumbuhan lebih lambat dari nasional", "Prospektif (pertumbuhan sektor lokal lebih cepat dari nasional)", "Bukan sektor unggulan", "Sama persis dengan LQ < 1", "Menyebabkan deflasi"],
  27: ["Inflasi = 80% karena cabai", "Tidak ada inflasi karena hanya satu komoditas", "Inflasi umum ≈ 5,51% dari perubahan IHK, bukan kenaikan satu barang", "Inflasi = 113,59%", "Deflasi karena IHK naik"],
  28: ["P = 2, Q = 40", "P = 3, Q = 30", "P = 4, Q = 20", "P = 5, Q = 10", "P = 6, Q = 0"],
  29: ["Perbedaan teknologi produksi", "Perbedaan kelimpahan sumber daya alam", "Efisiensi skala ekonomi", "Ketersediaan sumber daya alam yang sama persis antarnegara", "Perbedaan preferensi konsumen"],
  30: ["Surplus besar; pemerintah membeli surplus", "Kekurangan pasar; operasi pasar/penambahan supply untuk melindungi konsumen", "Harga naik bebas; tidak perlu intervensi", "Penawaran melebihi permintaan tanpa batas", "Keseimbangan pasar tetap tanpa perubahan"],
  31: [
    "Infrastruktur fisik jalan dan jembatan semata",
    "Norma, kepercayaan, dan jaringan yang mendukung produktivitas sosial",
    "Kekuatan hukum tanpa norma dan kepercayaan sosial",
    "Modal finansial perusahaan besar saja",
    "Partisipasi masyarakat hanya pada tahap evaluasi akhir",
  ],
  32: ["Ekspor, impor, investasi", "Umur hidup, pendidikan, pendapatan", "Lindung, budi daya, industri", "Inflasi, pengangguran, PDB", "Gotong royong, pajak, partisipasi"],
  33: ["Tim eksternal sebagai satu-satunya ahli", "Masyarakat sebagai pusat proses", "Pemerintah tanpa dialog", "Analisis tertutup dan formal semata", "Hanya data satelit"],
  34: ["Memperkuat ikatan dalam kelompok homogen saja", "Menjembatani hubungan antarkelompok berbeda", "Menghubungkan rakyat langsung ke presiden tanpa perantara", "Mengganti peran KKPR", "Menghitung ICOR"],
  35: ["Subyek menjadi obyek", "Obyek menjadi subyek aktif", "Pemerintah menjadi swasta", "Visi menjadi misi", "RPJPN menjadi RKPD"],
  36: [
    "Kemauan ditambah kesempatan dan akses sumber daya",
    "Kepatuhan pajak sebagai satu-satunya faktor kemiskinan",
    "Tingkat pendidikan tanpa memperhatikan akses layanan",
    "Partisipasi masyarakat hanya pada tahap perencanaan",
    "Indikator kemiskinan moneter tanpa dimensi multidimensi",
  ],
  37: [
    "Evaluasi → Penjajakan → Pelaksanaan",
    "Penjajakan kebutuhan → Kajian potensi → Pelaksanaan → Pemantauan → Evaluasi",
    "Pelaksanaan → Penjajakan → Penyusunan APBD",
    "Perumusan visi → Pelaksanaan → Evaluasi tanpa pemantauan",
    "Pemantauan → Penjajakan → Penetapan indikator",
  ],
  38: [
    "Kepatuhan pajak yang seragam di semua wilayah",
    "Perbedaan ketersediaan dan pola pemanfaatan sumber daya alam",
    "Visi pembangunan daerah yang identik",
    "Kepadatan penduduk sebagai satu-satunya pembeda",
    "Tingkat inflasi nasional yang sama",
  ],
  39: ["Peningkatan akses pendidikan", "Jaminan kesehatan", "Kepatuhan pajak sebagai pilar utama kemiskinan", "Pemberdayaan ekonomi produktif", "Perlindungan sosial"],
  40: ["Partisipatif dan terbuka", "Triangulasi informasi", "Santai dan iteratif", "Tertutup dan sangat formal seperti audit", "Masyarakat sebagai pusat"],
  41: ["Hanya bonding", "Bonding + bridging + linking", "Hanya linking tanpa bonding", "SOC = hanya jalan tol", "PRA tertutup formal"],
  42: ["Cukup lihat satu indikator kemiskinan", "Perlu analisis multidimensi (pendapatan + IPM + akses layanan)", "Ganti RPJPN saja", "Hanya hitung LQ", "Tingkatkan kepadatan 10–40 rumah/ha"],
  43: ["Industri dan perdagangan saja", "Lindung dan budi daya", "Pertanian dan pertambangan saja", "Permukiman dan pelabuhan saja", "RTH 30% nasional tunggal"],
  44: ["1 : 250.000", "1 : 100.000", "1 : 2.000 – 1 : 5.000", "1 : 50.000", "1 : 500.000"],
  45: ["6 bulan", "12 bulan", "18 bulan", "24 bulan", "36 bulan"],
  46: ["Kawasan Konservasi Pesisir Rakyat", "Kesesuaian Kegiatan Pemanfaatan Ruang", "Kredit Kepemilikan Perumahan Rakyat", "Kurva Keseimbangan Permintaan Regional", "Klasifikasi Kepadatan Perumahan Rendah"],
  47: ["50 m dari bibir pantai", "100 m dari garis pasang tertinggi", "200 m dari jalan raya", "30 m dari ROW jalan", "10 m dari bangunan"],
  48: ["10%", "20%", "30%", "40%", "50%"],
  49: ["1–5 rumah/ha", "10–40 rumah/ha", "50–100 rumah/ha", "100–200 rumah/ha", "Tidak ada standar"],
  50: ["Menetapkan 30% kawasan lindung nasional tunggal untuk seluruh NKRI", "Mengatur tata ruang; kawasan lindung ditetapkan per karakter wilayah", "Menggantikan UU 25/2004 tentang SPPN", "Hanya berlaku untuk DKI Jakarta", "Menghapus kebutuhan RDTR"],
  51: [
    "Izin Mendirikan Bangunan (IMB) tanpa penilaian kesesuaian ruang",
    "Kesesuaian Kegiatan Pemanfaatan Ruang (KKPR)",
    "Persetujuan Bangunan Gedung (PBG) sebagai pengganti penilaian ruang",
    "Rencana Induk RTRW provinsi",
    "Analisis dampak lalu lintas jalan nasional",
  ],
  52: ["25 m satu sisi", "50 m kiri dan kanan", "100 m kiri dan kanan", "200 m kiri dan kanan", "Tidak perlu sempadan"],
  53: ["Kemampuan menyerap limbah tanpa batas", "Kemampuan lingkungan menopang kehidupan secara lestari", "Hanya luas lahan industri", "Skala peta RTR 1:1.000", "Trade-off Phillips"],
  54: ["Bupati/Walikota saja", "Gubernur", "DPRD provinsi", "Presiden langsung", "LSM internasional"],
  55: ["500 m²", "1.000 m²", "2.500 m²", "5.000 m²", "10.000 m²"],
  56: ["≤ 500 km²", "≤ 2.000 km²", "≤ 5.000 km²", "≤ 10.000 km²", "≤ 100 km²"],
  57: ["A benar; B dan C salah", "B dan C benar; A salah tentang % lindung nasional tunggal", "Semua benar", "Hanya A benar", "B salah karena RTH 30% adalah lindung hutan nasional"],
  58: ["RDTR 1:250.000", "RTRWP untuk tapak bangunan", "Rencana Teknik (RTR) skala 1:1.000", "RPJPN 20 tahun", "KKPR mengganti semua peta"],
  59: ["Sempadan pantai — 100 m", "RTH total kota — 30%", "ROW jalan bebas hambatan — 30 m", "Sempadan sungai kecil — 100 m kiri-kanan", "RTH publik — 20%"],
  60: ["Semua sudah sesuai", "Sempadan sungai kecil kurang (min 50 m), KKPR diperlukan tanpa RDTR, kepadatan melebihi sedang (10–40), RTH di bawah 30%", "Hanya KKPR yang salah", "Hanya Phillips curve", "UU 26 mengharuskan 30% lindung nasional tunggal"],
};

function readSoalJs(filePath) {
  const buf = fs.readFileSync(filePath);
  const enc = buf[1] === 0 ? "utf16le" : "utf8";
  return buf.toString(enc);
}

function parseBank(source) {
  const m = source.match(/const\s+BANK\s*=\s*(\[[\s\S]*\]);/);
  if (!m) throw new Error("Tidak menemukan const BANK = [...] di soal.js");
  return eval(m[1]);
}

function escJs(s) {
  return JSON.stringify(s);
}

function serializeBank(bank) {
  let out = "const BANK = [\n";
  bank.forEach((q, idx) => {
    out += "  {\n";
    out += `    id: ${q.id},\n`;
    out += `    cluster: ${escJs(q.cluster)},\n`;
    out += `    level: ${escJs(q.level)},\n`;
    out += `    stem: ${escJs(q.stem)},\n`;
    out += "    options: [\n";
    q.options.forEach((o) => {
      out += `      ${escJs(o)},\n`;
    });
    out += "    ],\n";
    out += `    answer: ${q.answer},\n`;
    out += `    explain: ${escJs(q.explain)}`;
    if (q.version != null) out += `,\n    version: ${q.version}`;
    out += "\n  }" + (idx < bank.length - 1 ? "," : "") + "\n";
  });
  out += "];\n";
  return out;
}

function main() {
  const raw = readSoalJs(SOAL_PATH);
  const bank = parseBank(raw);

  if (bank.length !== 60) {
    throw new Error(`Harus 60 soal, dapat: ${bank.length}`);
  }

  for (let id = 1; id <= 60; id++) {
    const opts = IMPROVED_OPTIONS[id];
    if (!opts || opts.length !== 5) {
      throw new Error(`IMPROVED_OPTIONS[${id}] harus berisi 5 opsi`);
    }
    if (ANSWER_INDEX[id] == null) {
      throw new Error(`ANSWER_INDEX[${id}] tidak ada`);
    }
  }

  const updated = bank.map((q) => {
    const id = q.id;
    const expected = ANSWER_INDEX[id];
    if (expected == null) throw new Error(`Soal id ${id} di luar 1–60`);

    const options = IMPROVED_OPTIONS[id];
    if (q.answer !== expected) {
      console.warn(
        `Peringatan: soal ${id} answer di file (${q.answer}) ≠ ANSWER_INDEX (${expected}); memakai ANSWER_INDEX`
      );
    }

    return {
      ...q,
      options,
      answer: expected,
      version: 2,
    };
  });

  fs.writeFileSync(SOAL_PATH, serializeBank(updated), { encoding: "utf8" });
  console.log("OK:", SOAL_PATH);
  console.log("Diperbarui:", updated.length, "soal (version: 2, distraktor diperketat)");
  console.log("Jalankan: node scripts/merge-bank.mjs");
}

main();
