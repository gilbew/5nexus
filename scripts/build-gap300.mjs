/* Generator bank soal gap UKOM Perencana Ahli Muda batch 3 (50 soal).
   Jalankan dari folder Latihan UKOM: node scripts/build-gap300.mjs */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_PATH = path.join(__dirname, "parts", "gap300.js");
const PREVIOUS_BANK_PATHS = [
  path.join(__dirname, "parts", "gap100.js"),
  path.join(__dirname, "parts", "gap200.js"),
];

const LEVELS = ["singkat", "sedang", "panjang", "kasus"];
const EXPECTED_CLUSTERS = { teknis: 13, ekonomi: 15, sosial: 13, spasial: 9 };

function q(id, cluster, level, topic, stem, options, answer, explain) {
  return { id, cluster, level, source: "gap3", topic, stem, options, answer, explain, version: 1 };
}

/** Acak posisi jawaban benar agar distribusi A-E mendekati seimbang. */
function rebalanceAnswers(bank) {
  const pattern = [];
  for (let i = 0; i < bank.length; i += 1) pattern.push(i % 5);
  for (let i = pattern.length - 1; i > 0; i -= 1) {
    const j = (i * 17 + 13) % (i + 1);
    [pattern[i], pattern[j]] = [pattern[j], pattern[i]];
  }
  return bank.map((item, idx) => {
    const correctText = item.options[item.answer];
    const others = item.options.filter((_, i) => i !== item.answer);
    const target = pattern[idx];
    const opts = [...others];
    opts.splice(target, 0, correctText);
    return { ...item, options: opts, answer: target };
  });
}

const QUESTIONS = [
  // === TEKNIS (13) ===
  q("G3-T01", "teknis", "panjang", "PP 17/2017 dan PP 39/2006", "Dalam penyusunan RKP dan rencana kerja K/L, PP 17/2017 menekankan sinkronisasi perencanaan dan penganggaran, sementara PP 39/2006 menuntut pengendalian serta evaluasi pelaksanaan. Praktik yang paling tepat untuk menghubungkan keduanya adalah?", ["Menyusun matriks yang menautkan prioritas, kegiatan, output, alokasi, target antara, realisasi, dan tindak lanjut koreksi.", "Memisahkan dokumen anggaran dari rencana agar setiap unit bebas menyesuaikan kegiatan.", "Mengganti evaluasi kinerja dengan daftar serapan anggaran triwulanan.", "Menunggu akhir periode sebelum memeriksa keterkaitan rencana dan anggaran.", "Mengukur sinkronisasi dari kesamaan judul program dalam dokumen."], 0, "Sinkronisasi perlu terlihat dari rantai prioritas sampai evaluasi, bukan berhenti pada kesamaan nomenklatur atau serapan."),
  q("G3-T02", "teknis", "kasus", "Renstra PBD", "OPD menyusun Renstra Program Berbasis Data, tetapi indikatornya masih berupa daftar kegiatan tahunan. Koreksi paling penting agar Renstra benar-benar berorientasi hasil adalah?", ["Menurunkan sasaran strategis ke indikator outcome, baseline, target tahunan, sumber data, dan penanggung jawab data.", "Memperbanyak narasi visi agar dokumen terlihat komprehensif.", "Menyamakan semua target dengan realisasi tahun sebelumnya.", "Memindahkan seluruh indikator ke lampiran tanpa baseline.", "Menghapus indikator yang sulit dicapai agar laporan lebih ringan."], 0, "Renstra berbasis data membutuhkan ukuran hasil yang punya baseline, target, sumber data, dan akuntabilitas pemutakhiran."),
  q("G3-T03", "teknis", "sedang", "Indikator antara", "Program penurunan stunting menargetkan prevalensi turun dalam tiga tahun. Indikator antara yang paling berguna untuk pengendalian tahunan adalah?", ["Persentase balita berisiko yang mendapat paket lengkap layanan gizi, kesehatan, sanitasi, dan pendampingan keluarga.", "Jumlah spanduk kampanye gizi yang dipasang di kantor kecamatan.", "Jumlah rapat koordinasi lintas perangkat daerah selama satu tahun.", "Panjang laporan pelaksanaan kegiatan konvergensi stunting.", "Jumlah foto kegiatan posyandu dalam laporan bulanan."], 0, "Indikator antara menjembatani output kegiatan dengan outcome akhir sehingga dapat dipakai mengoreksi pelaksanaan lebih dini."),
  q("G3-T04", "teknis", "panjang", "Evaluasi impact", "Evaluasi program pelatihan digital UMKM menunjukkan peserta puas dan sertifikat terbit, tetapi penjualan belum jelas berubah. Desain evaluasi impact yang lebih kuat adalah?", ["Membandingkan perubahan penjualan peserta dengan kelompok pembanding yang serupa, memakai baseline dan follow-up setelah periode yang cukup.", "Menambah survei kepuasan pada hari penutupan pelatihan.", "Menganggap jumlah sertifikat sebagai dampak akhir program.", "Mengukur keberhasilan dari total materi presentasi yang dibagikan.", "Memilih testimoni peserta yang paling menarik untuk laporan."], 0, "Evaluasi impact perlu mengisolasi perubahan yang dapat dikaitkan dengan intervensi, bukan sekadar output atau kepuasan segera."),
  q("G3-T05", "teknis", "kasus", "Triple bottom line", "Rencana kawasan wisata mangrove menjanjikan PAD tinggi, tetapi berisiko mengurangi fungsi ekologis dan akses nelayan kecil. Analisis triple bottom line menuntut perencana untuk?", ["Menilai kelayakan ekonomi, dampak sosial pada nelayan, dan daya dukung ekologi sebelum menentukan desain investasi.", "Memprioritaskan pendapatan daerah meski manfaat sosial dan lingkungan belum terukur.", "Menolak semua kegiatan wisata tanpa melihat desain pengelolaan.", "Mengubah kawasan menjadi parkir agar penerimaan retribusi cepat naik.", "Mengukur keberhasilan dari jumlah pengunjung pada hari pertama pembukaan."], 0, "Triple bottom line menimbang profit, people, dan planet secara bersama agar keputusan tidak bias pada satu dimensi."),
  q("G3-T06", "teknis", "sedang", "Efisiensi vs efektivitas", "Dua program beasiswa menghabiskan anggaran sama. Program A menyalurkan dana lebih cepat, sedangkan Program B lebih banyak membuat siswa miskin bertahan sampai lulus. Pernyataan evaluatif yang paling tepat adalah?", ["Program A tampak lebih efisien secara proses, tetapi Program B lebih efektif terhadap tujuan pendidikan.", "Program A pasti lebih baik karena kecepatan penyaluran adalah tujuan akhir.", "Program B tidak relevan karena outcome pendidikan tidak perlu diukur.", "Kedua program tidak dapat dibandingkan karena anggarannya sama.", "Efisiensi dan efektivitas selalu memberi kesimpulan identik."], 0, "Efisiensi melihat penggunaan sumber daya atau proses, sedangkan efektivitas melihat pencapaian tujuan."),
  q("G3-T07", "teknis", "kasus", "Musrenbang hasil", "Hasil musrenbang kecamatan berisi 120 usulan, tetapi tidak memuat prioritas, indikator, lokasi rinci, atau kesepakatan OPD pengampu. Keluaran yang perlu diperbaiki adalah?", ["Berita acara dan matriks prioritas yang memuat masalah, lokasi, sasaran, indikator, pagu indikatif, OPD pengampu, dan status usulan.", "Daftar hadir peserta dengan tanda tangan lengkap saja.", "Dokumentasi foto forum dari berbagai sudut ruangan.", "Narasi sambutan camat sebagai bukti partisipasi.", "Daftar usulan mentah tanpa pembobotan."], 0, "Musrenbang harus menghasilkan kesepakatan yang dapat ditelusuri ke perencanaan, bukan sekadar daftar aspirasi."),
  q("G3-T08", "teknis", "panjang", "RAN dan RKPD", "Rencana aksi nasional penurunan emisi meminta daerah memperkuat transportasi rendah karbon, sementara RKPD daerah fokus kemacetan dan kualitas udara. Harmonisasi yang paling tepat adalah?", ["Memilih kegiatan yang menjawab kedua agenda, seperti angkutan umum, manajemen parkir, jalur pejalan kaki, indikator emisi, dan target kemacetan.", "Menyalin semua kegiatan pusat tanpa menilai masalah transportasi daerah.", "Menolak rencana aksi nasional karena RKPD bersifat daerah.", "Memisahkan program emisi dan kemacetan agar tidak saling memengaruhi.", "Mengganti indikator lingkungan dengan jumlah rapat koordinasi."], 0, "Harmonisasi mencari irisan sasaran, indikator, dan intervensi agar prioritas nasional serta daerah saling menguatkan."),
  q("G3-T09", "teknis", "sedang", "Partisipatif vs teknokratik", "Perencanaan partisipatif dan teknokratik sering dianggap bertentangan. Cara memadukannya secara sehat adalah?", ["Memakai data teknis untuk menguji kelayakan usulan warga, lalu menjelaskan alasan prioritas dan alternatif dalam forum terbuka.", "Menerima seluruh aspirasi warga tanpa verifikasi data dan kewenangan.", "Menyerahkan semua keputusan kepada model statistik tanpa konsultasi publik.", "Menghapus forum warga karena pakar sudah memiliki data.", "Menyusun daftar proyek berdasarkan urutan kedatangan proposal."], 0, "Partisipasi memberi legitimasi dan pengetahuan lokal, sedangkan teknokrasi menjaga kelayakan, data, dan konsistensi kebijakan."),
  q("G3-T10", "teknis", "kasus", "PP 17/2017 sinkronisasi", "K/L mengusulkan kegiatan prioritas baru setelah pagu indikatif disepakati, tetapi tidak menunjukkan perubahan sasaran nasional atau evidence gap. Sesuai prinsip sinkronisasi PP 17/2017, sikap perencana adalah?", ["Meminta justifikasi berbasis prioritas, output, lokasi, kebutuhan anggaran, dan konsekuensi terhadap kegiatan lain sebelum memasukkan usulan.", "Memasukkan usulan karena setiap unit berhak menambah kegiatan kapan pun.", "Menghapus seluruh kegiatan lama agar kegiatan baru mendapat ruang.", "Menunda penyusunan rencana sampai semua usulan sektoral berhenti.", "Menilai usulan cukup dari kesesuaian nama kegiatan dengan arahan pimpinan."], 0, "Perubahan usulan harus tetap terhubung dengan prioritas, output, dan konsekuensi anggaran."),
  q("G3-T11", "teknis", "panjang", "Indikator antara", "Dalam program reformasi birokrasi, target akhir adalah kepuasan layanan meningkat. Manakah indikator antara yang paling tajam untuk memantau perubahan sebelum survei akhir tahun?", ["Persentase layanan prioritas yang memenuhi standar waktu, kanal pengaduan aktif, dan penyelesaian keluhan sesuai SLA.", "Jumlah pegawai yang mengikuti apel pagi setiap minggu.", "Jumlah halaman dokumen SOP yang dicetak ulang.", "Jumlah banner budaya kerja di ruang pelayanan.", "Jumlah rapat internal tanpa catatan keputusan."], 0, "Indikator antara harus menangkap perubahan proses layanan yang logis menuju kepuasan pengguna."),
  q("G3-T12", "teknis", "kasus", "Evaluasi impact", "Program subsidi alat tangkap ramah lingkungan diklaim berhasil karena alat dibagikan seluruhnya. Namun nelayan kembali memakai alat lama setelah tiga bulan. Pertanyaan impact yang perlu dijawab adalah?", ["Apakah subsidi mengubah perilaku penangkapan dan pendapatan nelayan secara berkelanjutan dibanding kondisi sebelum program.", "Apakah semua kuitansi pengadaan tersusun sesuai nomor urut.", "Apakah warna alat tangkap sesuai desain katalog.", "Apakah acara penyerahan bantuan dihadiri pejabat lengkap.", "Apakah jumlah paket sama dengan rencana belanja."], 0, "Impact menilai perubahan perilaku dan kesejahteraan sasaran, bukan berhenti pada distribusi bantuan."),
  q("G3-T13", "teknis", "sedang", "Efisiensi vs efektivitas", "Sebuah intervensi sanitasi memakai biaya per sambungan rumah lebih rendah daripada daerah pembanding, tetapi banyak sambungan tidak dipakai warga. Kesimpulan paling tepat adalah?", ["Efisiensi biaya perlu diakui, tetapi efektivitas rendah jika layanan tidak digunakan dan perilaku sanitasi tidak berubah.", "Program berhasil penuh karena biaya satuan rendah.", "Penggunaan warga tidak relevan dalam evaluasi sanitasi.", "Biaya rendah membuktikan outcome kesehatan tercapai.", "Sambungan tidak terpakai cukup dicatat sebagai variasi administrasi."], 0, "Biaya satuan rendah tidak cukup jika output tidak dimanfaatkan dan outcome tidak bergerak."),

  // === EKONOMI (15) ===
  q("G3-E01", "ekonomi", "kasus", "DLQ interpretasi", "Sektor ekonomi kreatif memiliki LQ di bawah 1, tetapi DLQ konsisten di atas 1 selama tiga tahun. Implikasi perencanaan yang paling hati-hati adalah?", ["Sektor belum menjadi basis, tetapi momentum pertumbuhannya layak diuji melalui dukungan talenta, pasar, dan infrastruktur digital.", "Sektor pasti sudah basis sehingga tidak perlu analisis lanjutan.", "Sektor harus dikeluarkan dari perencanaan karena LQ rendah.", "DLQ membuktikan ketimpangan pendapatan sudah turun.", "DLQ tidak dapat memberi informasi dinamika sektor."], 0, "DLQ di atas 1 memberi sinyal pertumbuhan relatif lebih cepat, bukan status basis saat ini."),
  q("G3-E02", "ekonomi", "panjang", "Shift-share komponen", "Analisis shift-share menunjukkan sektor logistik daerah tumbuh terutama karena komponen pertumbuhan nasional, sedangkan komponen daya saing lokal negatif. Rekomendasi yang paling tepat adalah?", ["Menguji hambatan lokal seperti biaya bongkar muat, konektivitas, perizinan, dan kualitas SDM karena daerah belum menangkap keunggulan sendiri.", "Mengklaim pertumbuhan sepenuhnya akibat keunggulan lokal.", "Menghentikan semua investasi logistik karena tren nasional positif.", "Mengabaikan komponen daya saing karena shift-share hanya menghitung inflasi.", "Mengganti sektor logistik dengan bantuan sosial dalam tabel PDRB."], 0, "Komponen daya saing negatif menunjukkan kinerja lokal tertinggal dari tren yang lebih luas."),
  q("G3-E03", "ekonomi", "sedang", "ICOR angka", "Jika tambahan investasi Rp8 triliun menghasilkan tambahan output Rp2 triliun, nilai ICOR sederhana adalah?", ["4, karena ICOR adalah tambahan investasi dibagi tambahan output.", "0,25 karena output dibagi investasi.", "2 karena investasi dikurangi output.", "6 karena investasi dan output dijumlahkan lalu dibagi dua.", "10 karena investasi dan output harus dijumlahkan."], 0, "ICOR sederhana dihitung sebagai delta modal atau investasi dibagi delta output."),
  q("G3-E04", "ekonomi", "kasus", "Gini redistribusi", "Gini daerah meningkat setelah kawasan industri tumbuh karena pekerja lokal berpendidikan rendah tidak masuk rantai nilai utama. Kebijakan redistribusi yang paling produktif adalah?", ["Pelatihan terarah, beasiswa vokasi, dukungan UMKM pemasok, dan perlindungan sosial untuk kelompok tertinggal.", "Menaikkan PDRB tanpa melihat siapa yang menikmati manfaat.", "Menghapus pengukuran Gini agar citra investasi membaik.", "Membatasi pendidikan vokasi untuk pekerja luar daerah.", "Menyamaratakan bantuan tanpa memeriksa kelompok terbawah."], 0, "Redistribusi produktif memperluas akses kemampuan dan manfaat pertumbuhan bagi kelompok yang tertinggal."),
  q("G3-E05", "ekonomi", "sedang", "Merit goods", "Imunisasi dan pendidikan dasar disebut merit goods terutama karena?", ["Manfaat sosialnya besar dan masyarakat dapat mengonsumsi terlalu sedikit jika akses, informasi, atau kemampuan bayar terbatas.", "Keduanya tidak pernah memerlukan biaya produksi.", "Keduanya dapat dikonsumsi tanpa kapasitas layanan.", "Keduanya tidak memberi manfaat kepada orang lain.", "Keduanya harus disediakan eksklusif oleh pasar."], 0, "Merit goods sering didorong pemerintah karena manfaat sosialnya kurang diperhitungkan oleh keputusan individu."),
  q("G3-E06", "ekonomi", "kasus", "Normal vs inferior goods", "Ketika pendapatan rumah tangga naik, konsumsi mi instan murah menurun dan konsumsi protein segar meningkat. Interpretasi yang paling tepat adalah?", ["Mi instan murah dalam kasus ini berperilaku sebagai barang inferior, sedangkan protein segar cenderung barang normal.", "Keduanya pasti barang publik karena dikonsumsi banyak orang.", "Protein segar adalah barang inferior karena lebih mahal.", "Mi instan murah pasti barang Giffen dalam semua kondisi.", "Perubahan pendapatan tidak dapat memengaruhi pola konsumsi."], 0, "Barang inferior dikonsumsi lebih sedikit saat pendapatan naik, sedangkan barang normal naik seiring pendapatan."),
  q("G3-E07", "ekonomi", "sedang", "Multiplier sederhana", "Jika pemerintah daerah membelanjakan Rp100 miliar untuk proyek padat karya dan marginal propensity to consume lokal 0,8, multiplier Keynesian sederhana adalah?", ["5, sehingga potensi dampak pendapatan bruto dapat mencapai Rp500 miliar sebelum kebocoran lain diperhitungkan.", "0,2, sehingga dampak pasti turun menjadi Rp20 miliar.", "1,25, karena multiplier adalah 1 dikali MPC.", "8, karena MPC dikalikan 10.", "100, karena belanja awal menjadi multiplier."], 0, "Multiplier sederhana adalah 1/(1-MPC), sehingga 1/(1-0,8)=5."),
  q("G3-E08", "ekonomi", "panjang", "Economic base export", "Dalam teori economic base, mengapa ekspor komoditas olahan ke luar daerah dapat mendorong pertumbuhan lokal?", ["Pendapatan dari luar daerah masuk, meningkatkan permintaan lokal, dan memicu kegiatan non-basis melalui belanja turunan.", "Ekspor membuat uang keluar sehingga kegiatan lokal pasti turun.", "Sektor basis adalah sektor yang melayani warga setempat saja.", "Pertumbuhan lokal hanya ditentukan oleh jumlah kantor pemerintah.", "Ekspor tidak terkait pendapatan karena barang berpindah lokasi."], 0, "Sektor basis membawa permintaan eksternal yang menjadi penggerak pendapatan dan multiplier lokal."),
  q("G3-E09", "ekonomi", "kasus", "Phillips dan fiskal", "Pengangguran naik karena permintaan melemah, sementara inflasi inti rendah. Dalam kerangka Phillips jangka pendek, respons fiskal daerah yang paling masuk akal adalah?", ["Belanja publik terarah dan padat karya yang menjaga daya beli tanpa mendorong tekanan harga berlebihan.", "Memotong seluruh belanja produktif agar pengangguran turun sendiri.", "Menaikkan pajak konsumsi tajam saat daya beli lemah.", "Membiarkan proyek tertunda walau pekerja banyak menganggur.", "Mendorong permintaan pada sektor pasokan terbatas tanpa mitigasi inflasi."], 0, "Saat inflasi rendah dan pengangguran tinggi, stimulus fiskal terarah dapat membantu permintaan dan pekerjaan dengan tetap memperhatikan risiko harga."),
  q("G3-E10", "ekonomi", "sedang", "Oligopoli", "Pasar semen daerah dikuasai tiga distributor besar yang saling memantau harga dan enggan menurunkan margin. Risiko utama struktur oligopoli tersebut adalah?", ["Harga dapat tetap tinggi karena interdependensi strategi dan hambatan masuk bagi pesaing baru.", "Harga pasti turun ke biaya marjinal seperti persaingan sempurna.", "Konsumen selalu memperoleh pilihan tidak terbatas.", "Distributor kecil otomatis menguasai pasar.", "Struktur pasar tidak memengaruhi harga."], 0, "Oligopoli membuat keputusan harga saling bergantung dan dapat mengurangi tekanan persaingan."),
  q("G3-E11", "ekonomi", "kasus", "DLQ interpretasi", "Sektor pertanian memiliki LQ tinggi, tetapi DLQ turun di bawah 1 karena produktivitas stagnan dan tenaga kerja muda keluar. Pesan kebijakan yang paling tepat adalah?", ["Basis saat ini perlu diremajakan melalui produktivitas, hilirisasi, dan regenerasi agar tidak melemah secara relatif.", "Sektor pasti aman karena LQ tinggi pada satu tahun pengamatan.", "DLQ rendah berarti sektor tidak pernah menyumbang ekonomi daerah.", "LQ tinggi membuat inovasi tidak diperlukan.", "Perencana cukup menaikkan target tanpa intervensi."], 0, "LQ menggambarkan posisi saat ini, sedangkan DLQ memberi peringatan tentang arah dinamika relatif."),
  q("G3-E12", "ekonomi", "panjang", "Shift-share komponen", "Komponen bauran industri dalam shift-share sektor farmasi daerah positif, tetapi komponen kompetitif lokal negatif. Interpretasi yang paling tepat adalah?", ["Sektor berada pada industri yang tumbuh cepat secara acuan, tetapi kinerja lokal kalah dibanding daerah lain dalam industri yang sama.", "Sektor farmasi pasti tidak memiliki pasar nasional.", "Komponen positif berarti semua aspek lokal sudah unggul.", "Komponen kompetitif tidak berguna untuk strategi daerah.", "Pertumbuhan farmasi hanya dipengaruhi jumlah penduduk miskin."], 0, "Bauran industri positif menunjukkan sektor acuan sedang menarik, sementara komponen kompetitif negatif menunjukkan masalah lokal."),
  q("G3-E13", "ekonomi", "kasus", "ICOR angka", "ICOR daerah turun dari 6 menjadi 4, tetapi investasi terkonsentrasi pada tambang padat modal dengan serapan kerja rendah. Kehati-hatian analitis yang tepat adalah?", ["Efisiensi output membaik secara agregat, namun dampak inklusi kerja dan keberlanjutan lingkungan tetap perlu diuji.", "ICOR turun membuktikan semua warga mendapat pekerjaan layak.", "Analisis sosial tidak diperlukan jika rasio makro membaik.", "ICOR rendah berarti investasi bebas risiko lingkungan.", "Serapan kerja tidak berkaitan dengan kualitas pertumbuhan."], 0, "ICOR agregat perlu dibaca bersama indikator distribusi manfaat, pekerjaan, dan keberlanjutan."),
  q("G3-E14", "ekonomi", "sedang", "Merit goods", "Mengapa subsidi transportasi pelajar miskin dapat dibaca sebagai kebijakan merit good?", ["Karena membantu konsumsi layanan pendidikan yang manfaat sosialnya besar dan sering terkendala biaya akses.", "Karena transportasi pelajar tidak membutuhkan kendaraan dan pengemudi.", "Karena semua perjalanan adalah barang publik murni.", "Karena subsidi membuat pendidikan tidak lagi memiliki manfaat privat.", "Karena pelajar miskin tidak perlu memilih sekolah."], 0, "Subsidi akses dapat mencegah under-consumption pendidikan akibat biaya perjalanan."),
  q("G3-E15", "ekonomi", "panjang", "Oligopoli", "Empat perusahaan penggilingan padi besar membeli gabah dari banyak petani kecil. Jika mereka memiliki kekuatan tawar tinggi, kebijakan daerah yang paling proporsional adalah?", ["Memperkuat informasi harga, koperasi petani, akses gudang, pembiayaan, dan pengawasan persaingan tanpa menetapkan harga sembarangan.", "Membiarkan asimetri tawar karena petani pasti mendapat harga adil.", "Melarang semua penggilingan besar beroperasi tanpa analisis pasokan.", "Menetapkan satu harga tetap sepanjang tahun tanpa melihat kualitas gabah.", "Menghapus data harga agar pasar tidak bereaksi."], 0, "Kekuatan pasar pembeli dapat ditekan melalui transparansi, kelembagaan petani, dan pengawasan yang proporsional."),

  // === SOSIAL (13) ===
  q("G3-S01", "sosial", "sedang", "Transect walk", "Dalam transect walk, tim menemukan area permukiman bawah sering tergenang karena saluran tertutup sampah dan elevasi rendah. Keluaran PRA yang paling berguna adalah?", ["Sketsa lintasan, titik masalah, penyebab lokal, kelompok terdampak, dan prioritas tindakan yang disepakati warga.", "Daftar belanja alat kebersihan tanpa lokasi masalah.", "Foto kegiatan tanpa catatan ruang dan aktor.", "Kesimpulan tunggal dari fasilitator tanpa validasi warga.", "Peta administrasi kabupaten tanpa detail dusun."], 0, "Transect walk menghubungkan pengamatan ruang dengan pengetahuan warga dan prioritas tindakan."),
  q("G3-S02", "sosial", "kasus", "Social mapping", "Program rumah layak huni gagal menjangkau janda lansia karena ia tidak dekat dengan pengurus RT dan tidak tercatat sebagai penerima. Social mapping seharusnya membantu dengan cara?", ["Memetakan jaringan kuasa, kelompok rentan, akses informasi, dan warga yang tidak terlihat dalam daftar formal.", "Mengambil data dari tokoh dominan sebagai sumber tunggal.", "Mengabaikan relasi sosial karena bantuan rumah bersifat teknis.", "Mengurutkan penerima berdasarkan kedekatan dengan panitia.", "Menghapus warga yang tidak hadir dalam rapat malam."], 0, "Social mapping membantu melihat struktur sosial, akses, dan eksklusi yang tidak tampak dalam data administratif."),
  q("G3-S03", "sosial", "sedang", "IPM komponen", "Komponen utama IPM yang digunakan untuk membaca kualitas pembangunan manusia adalah?", ["Umur panjang dan hidup sehat, pengetahuan, serta standar hidup layak.", "Jumlah kantor pemerintahan, luas jalan, dan nilai investasi.", "Produksi beras, PAD, dan jumlah pasar modern.", "Jumlah rapat OPD, dokumen perencanaan, dan serapan anggaran.", "Kepadatan penduduk, luas wilayah, dan jumlah desa."], 0, "IPM menggabungkan dimensi kesehatan, pendidikan, dan standar hidup layak."),
  q("G3-S04", "sosial", "panjang", "Kemiskinan ekstrem", "Daerah ingin menurunkan kemiskinan ekstrem, tetapi bantuan tersebar ke rumah tangga miskin umum tanpa memprioritaskan desil terbawah. Perbaikan strategi yang paling tepat adalah?", ["Menggunakan data mikro terpadu untuk memprioritaskan keluarga ekstrem, memastikan paket bantuan lengkap, dan memantau perubahan kesejahteraan.", "Membagi bantuan sama rata ke semua penduduk agar proses cepat.", "Menghapus verifikasi lapangan karena data awal cukup untuk semua kasus.", "Mengalihkan semua anggaran ke kegiatan seremonial anti-kemiskinan.", "Mengukur keberhasilan dari jumlah rapat koordinasi kemiskinan."], 0, "Kemiskinan ekstrem membutuhkan targeting presisi, konvergensi layanan, dan pemantauan rumah tangga sasaran."),
  q("G3-S05", "sosial", "kasus", "Remitansi", "Banyak keluarga pekerja migran menerima remitansi, tetapi sebagian besar dipakai untuk konsumsi jangka pendek dan biaya sosial. Kebijakan pemberdayaan yang paling sesuai adalah?", ["Literasi keuangan, akses tabungan aman, investasi produktif kecil, dan perlindungan keluarga migran dari biaya informal.", "Membatasi seluruh konsumsi keluarga penerima remitansi.", "Menganggap remitansi selalu cukup menggantikan layanan publik.", "Memungut biaya tinggi dari remitansi untuk menambah PAD.", "Menghapus pendampingan karena uang berasal dari luar negeri."], 0, "Remitansi dapat memperkuat ketahanan keluarga jika didukung pengelolaan keuangan dan perlindungan yang baik."),
  q("G3-S06", "sosial", "panjang", "Desa berdaya", "Desa disebut berdaya bukan karena banyak menerima proyek, tetapi karena?", ["Warga dan kelembagaan lokal mampu mengenali masalah, mengelola aset, mengambil keputusan inklusif, dan mempertanggungjawabkan hasil.", "Semua keputusan pembangunan diambil oleh konsultan luar.", "Bantuan datang tanpa proses musyawarah dan pengawasan warga.", "Kegiatan desa bergantung pada tokoh tunggal yang menentukan penerima.", "Dokumen desa dibuat rapi meski warga tidak memahami isinya."], 0, "Pemberdayaan menekankan kapasitas, kontrol, inklusi, dan akuntabilitas lokal."),
  q("G3-S07", "sosial", "kasus", "Perencanaan berbasis komunitas", "Komunitas pesisir menyusun rencana adaptasi abrasi. Agar rencana berbasis komunitas tidak sekadar konsultasi formal, proses yang perlu dijaga adalah?", ["Warga memetakan risiko, memilih prioritas, membagi peran, menyepakati indikator, dan mendapat akses informasi teknis yang mudah dipahami.", "Rencana selesai di kantor konsultan lalu dimintakan tanda tangan warga.", "Masukan warga dibatasi pada warna desain papan informasi.", "Kelompok nelayan kecil dilibatkan setelah keputusan anggaran final.", "Data risiko disimpan agar warga tidak khawatir."], 0, "Community-based planning menempatkan komunitas sebagai pelaku analisis dan keputusan, dengan dukungan teknis yang dapat diakses."),
  q("G3-S08", "sosial", "sedang", "UU Perlindungan Disabilitas", "Dalam perspektif UU Penyandang Disabilitas, layanan publik inklusif menuntut pemerintah daerah untuk?", ["Menyediakan aksesibilitas, akomodasi yang layak, data kebutuhan, dan pelibatan penyandang disabilitas dalam perencanaan layanan.", "Menyediakan layanan bila ada sisa anggaran kegiatan sosial.", "Memisahkan semua warga difabel dari ruang layanan umum.", "Menyerahkan seluruh dukungan kepada keluarga masing-masing.", "Membatasi kanal pengaduan karena penyesuaian layanan sulit."], 0, "Hak penyandang disabilitas menuntut akses setara, akomodasi layak, dan partisipasi bermakna."),
  q("G3-S09", "sosial", "kasus", "Anggaran responsif gender", "Program revitalisasi pasar meningkatkan kios, tetapi tidak menyediakan ruang laktasi, toilet aman, dan penerangan bagi pedagang perempuan yang pulang malam. Respons anggaran responsif gender adalah?", ["Memasukkan kebutuhan keamanan, fasilitas pendukung, indikator manfaat terpilah, dan alokasi yang menjawab hambatan perempuan.", "Menyatakan pasar netral gender karena semua pedagang membayar retribusi.", "Mengganti fasilitas dasar dengan seminar pemberdayaan satu hari.", "Menghapus data pedagang perempuan agar desain lebih sederhana.", "Menunggu keluhan viral sebelum mengubah desain."], 0, "Anggaran responsif gender melihat akses, partisipasi, kontrol, dan manfaat yang berbeda antar kelompok."),
  q("G3-S10", "sosial", "panjang", "Social mapping", "Pemetaan sosial di kawasan kumuh menemukan penyewa kontrakan tidak ikut musyawarah karena dianggap bukan warga tetap, padahal mereka paling rentan banjir. Implikasi perencanaan yang tepat adalah?", ["Mekanisme partisipasi dan data sasaran perlu memasukkan penyewa rentan agar manfaat program tidak hanya diterima pemilik rumah.", "Penyewa dapat diabaikan karena tidak memiliki sertifikat tanah.", "Musyawarah cukup mewakili pemilik bangunan yang hadir.", "Program banjir sebaiknya ditunda sampai penyewa pindah.", "Data kerentanan tidak perlu membedakan status hunian."], 0, "Pemetaan sosial mengungkap kelompok rentan yang mudah tersisih dari proses formal."),
  q("G3-S11", "sosial", "sedang", "IPM komponen", "Jika IPM naik karena pengeluaran per kapita membaik, tetapi harapan lama sekolah stagnan, catatan kebijakan yang paling tepat adalah?", ["Perbaikan ekonomi belum otomatis memperkuat dimensi pendidikan sehingga intervensi akses dan mutu sekolah tetap diperlukan.", "Kenaikan satu dimensi membuat seluruh dimensi IPM tidak perlu diperiksa.", "Harapan lama sekolah tidak berhubungan dengan pembangunan manusia.", "Pengeluaran per kapita cukup untuk menggantikan layanan pendidikan.", "IPM hanya mengukur pendapatan daerah."], 0, "IPM perlu dibaca per dimensi agar kebijakan tidak menutup kelemahan pada pendidikan atau kesehatan."),
  q("G3-S12", "sosial", "kasus", "Kemiskinan ekstrem", "Keluarga miskin ekstrem menerima bantuan pangan, tetapi anaknya putus sekolah dan rumah belum memiliki sanitasi. Pendekatan yang paling tepat adalah?", ["Konvergensi bantuan sosial, pendidikan, kesehatan, sanitasi, dan pendampingan keluarga berdasarkan profil kebutuhan rumah tangga.", "Menambah bantuan pangan saja karena satu program lebih mudah dilaporkan.", "Mengeluarkan keluarga dari sasaran karena masalahnya terlalu banyak.", "Menunggu pendapatan naik tanpa intervensi layanan dasar.", "Mengganti semua bantuan dengan acara motivasi."], 0, "Kemiskinan ekstrem bersifat multidimensi sehingga perlu paket layanan yang saling melengkapi."),
  q("G3-S13", "sosial", "panjang", "Remitansi", "Remitansi meningkatkan konsumsi desa, tetapi harga tanah naik dan keluarga non-migran makin sulit membeli lahan. Analisis sosial yang paling tepat adalah?", ["Remitansi membawa manfaat sekaligus risiko ketimpangan lokal sehingga perlu kebijakan akses lahan, usaha produktif, dan perlindungan kelompok non-penerima.", "Remitansi pasti menguntungkan semua warga dengan proporsi sama.", "Kenaikan harga tanah tidak terkait struktur sosial desa.", "Keluarga non-migran harus dikeluarkan dari program desa.", "Perencana cukup mencatat total uang masuk tanpa melihat distribusi."], 0, "Dampak remitansi perlu dibaca dari sisi distribusi manfaat, harga aset, dan kerentanan kelompok yang tidak menerima."),

  // === SPASIAL (9) ===
  q("G3-P01", "spasial", "kasus", "Mitigasi banjir struktur", "Kota hilir ingin membangun tanggul tinggi untuk mengurangi banjir, tetapi kapasitas sungai dan drainase lingkungan tetap buruk. Mitigasi struktural yang lebih utuh adalah?", ["Menggabungkan tanggul, kolam retensi, normalisasi selektif, drainase lingkungan, operasi pintu air, dan pemeliharaan berbasis risiko.", "Membangun tanggul saja tanpa rencana operasi dan pemeliharaan.", "Menutup semua saluran kecil agar air tidak terlihat di permukiman.", "Mengandalkan pompa darurat tanpa peta genangan.", "Memindahkan banjir ke wilayah tetangga tanpa koordinasi."], 0, "Mitigasi struktural banjir perlu dirancang sebagai sistem, bukan satu bangunan terpisah."),
  q("G3-P02", "spasial", "panjang", "Adaptasi iklim RDTR", "RDTR kawasan pesisir disusun tanpa memperhitungkan kenaikan muka laut dan rob yang makin sering. Integrasi adaptasi iklim yang paling tepat adalah?", ["Memasukkan peta bahaya iklim, aturan zonasi adaptif, elevasi bangunan, sempadan aman, ruang retensi, dan jalur evakuasi.", "Menetapkan seluruh pesisir sebagai komersial agar nilai lahan naik.", "Menggunakan data rob lama tanpa skenario perubahan iklim.", "Menghapus zona rawan dari peta agar investasi tidak khawatir.", "Membuat aturan sama untuk semua blok meski tingkat bahaya berbeda."], 0, "RDTR dapat menjadi instrumen adaptasi melalui zonasi, ketentuan pemanfaatan ruang, dan standar bangunan berbasis risiko."),
  q("G3-P03", "spasial", "sedang", "Tapak bangunan", "Dalam analisis tapak bangunan fasilitas publik, aspek yang paling perlu diperiksa sebelum desain detail adalah?", ["Kemiringan lahan, akses, drainase, orientasi, utilitas, risiko bencana, dan hubungan dengan lingkungan sekitar.", "Warna cat gedung dan nama ruang rapat utama.", "Jumlah undangan peresmian dan desain spanduk.", "Preferensi kontraktor terhadap merek material tertentu.", "Panjang sambutan kepala daerah saat peletakan batu pertama."], 0, "Analisis tapak memastikan bangunan sesuai kondisi fisik, akses, utilitas, risiko, dan konteks sekitar."),
  q("G3-P04", "spasial", "kasus", "ROW jalan", "Pengembang ingin membangun kios permanen di ruang milik jalan karena lokasi ramai. Pertimbangan ROW jalan yang paling tepat adalah?", ["Ruang milik jalan harus menjaga fungsi jalan, keselamatan, utilitas, drainase, pelebaran, dan akses pemeliharaan.", "Kios dapat dibangun jika ramai pembeli meski mengganggu utilitas.", "ROW jalan hanya berlaku setelah jalan rusak.", "Ruang milik jalan dapat diabaikan jika retribusi tinggi.", "Keselamatan pejalan kaki cukup ditangani dengan imbauan."], 0, "ROW melindungi fungsi jalan dan ruang pendukungnya dari pemanfaatan yang mengganggu keselamatan serta operasi."),
  q("G3-P05", "spasial", "panjang", "Kawasan lindung", "Usulan vila masuk ke lereng curam yang berfungsi sebagai kawasan lindung resapan air. Sikap perencana tata ruang yang paling tepat adalah?", ["Menolak atau mengarahkan ulang pemanfaatan ke lokasi sesuai zonasi, sambil menjaga fungsi lindung dan mitigasi risiko longsor.", "Menyetujui vila karena investasi properti meningkatkan pajak daerah.", "Mengubah fungsi lindung melalui notulen rapat teknis.", "Membiarkan pembangunan selama desain bangunan terlihat hijau.", "Menghapus informasi lereng dari peta kerja."], 0, "Kawasan lindung memiliki fungsi ekologis dan risiko yang harus dijaga melalui pengendalian pemanfaatan ruang."),
  q("G3-P06", "spasial", "sedang", "Citra NDVI", "Dalam interpretasi citra, nilai NDVI yang tinggi umumnya menunjukkan?", ["Vegetasi lebih rapat atau sehat dibanding area dengan NDVI rendah.", "Permukaan kedap air yang sangat panas.", "Kedalaman sungai yang lebih besar.", "Kepadatan bangunan bertingkat.", "Status kepemilikan lahan."], 0, "NDVI memakai perbedaan reflektansi merah dan inframerah dekat untuk membaca kondisi vegetasi."),
  q("G3-P07", "spasial", "kasus", "Overlay flood", "Bappeda ingin mengidentifikasi sekolah yang berada pada zona banjir 25 tahunan dan melayani anak dari keluarga miskin. Analisis SIG yang paling tepat adalah?", ["Overlay zona banjir dengan titik sekolah dan data sosial wilayah layanan untuk menentukan prioritas mitigasi.", "Mengubah simbol sekolah menjadi warna biru tanpa analisis spasial.", "Menghitung rata-rata nilai ujian sebagai pengganti risiko banjir.", "Menghapus layer keluarga miskin karena bukan data fisik.", "Memilih sekolah terdekat kantor bupati sebagai prioritas."], 0, "Overlay menggabungkan bahaya, lokasi fasilitas, dan kerentanan sosial untuk menentukan prioritas risiko."),
  q("G3-P08", "spasial", "panjang", "Proyeksi aritmatik vs geometrik", "Penduduk kecamatan tumbuh stabil sekitar 1.000 jiwa per tahun selama satu dekade, bukan persentase tetap. Metode proyeksi yang lebih sesuai sebagai baseline sederhana adalah?", ["Aritmatik, karena kenaikan absolut relatif konstan dari tahun ke tahun.", "Geometrik, karena semua pertumbuhan penduduk pasti berbunga majemuk.", "Eksponensial tinggi tanpa melihat tren historis.", "Delphi murni tanpa data penduduk.", "Interpolasi spasial tutupan lahan."], 0, "Metode aritmatik cocok ketika pertambahan absolut cenderung stabil, sedangkan geometrik cocok untuk laju persentase relatif konstan."),
  q("G3-P09", "spasial", "kasus", "PSN dampak sosial", "PSN jalan tol membuka akses baru, tetapi memutus jalur petani ke sawah dan menaikkan harga sewa di desa sekitar gerbang tol. Mitigasi sosial-spasial yang perlu dimasukkan adalah?", ["Akses pengganti lahan usaha, konsultasi warga, perlindungan penyewa rentan, pemulihan mata pencaharian, dan pemantauan dampak harga lahan.", "Mencatat dampak sosial setelah konstruksi selesai saja.", "Menganggap akses tol otomatis menguntungkan semua kelompok.", "Menutup keluhan warga agar jadwal proyek tidak berubah.", "Memindahkan petani tanpa rencana akses produksi."], 0, "PSN dapat membawa manfaat dan beban ruang yang berbeda, sehingga mitigasi sosial harus konkret dan terpantau.")
];

function esc(value) {
  return JSON.stringify(value);
}

function serializeBank(name, bank) {
  let output = `// Bank soal gap UKOM Perencana Ahli Muda batch 3 - dihasilkan build-gap300.mjs\n`;
  output += `// Jangan edit manual; jalankan: node scripts/build-gap300.mjs\n`;
  output += `const ${name} = [\n`;
  bank.forEach((item, index) => {
    output += "  {\n";
    output += `    id: ${esc(item.id)},\n`;
    output += `    cluster: ${esc(item.cluster)},\n`;
    output += `    level: ${esc(item.level)},\n`;
    output += `    source: ${esc(item.source)},\n`;
    output += `    topic: ${esc(item.topic)},\n`;
    output += `    stem: ${esc(item.stem)},\n`;
    output += "    options: [\n";
    item.options.forEach((option) => {
      output += `      ${esc(option)},\n`;
    });
    output += "    ],\n";
    output += `    answer: ${item.answer},\n`;
    output += `    explain: ${esc(item.explain)},\n`;
    output += `    version: ${item.version}\n`;
    output += `  }${index < bank.length - 1 ? "," : ""}\n`;
  });
  output += "];\n";
  return output;
}

function countBy(items, key) {
  return items.reduce((acc, item) => {
    acc[item[key]] = (acc[item[key]] || 0) + 1;
    return acc;
  }, {});
}

function readPreviousStems() {
  const stems = new Set();
  for (const bankPath of PREVIOUS_BANK_PATHS) {
    if (!fs.existsSync(bankPath)) continue;
    const text = fs.readFileSync(bankPath, "utf8");
    const pattern = /stem:\s*("(?:(?:\\.)|[^"\\])*")/g;
    let match;
    while ((match = pattern.exec(text))) {
      stems.add(JSON.parse(match[1]));
    }
  }
  return stems;
}

function validateIdSequence(bank, cluster, prefix, expected) {
  const actual = bank.filter((item) => item.cluster === cluster).map((item) => item.id);
  for (let i = 1; i <= expected; i += 1) {
    const id = `${prefix}${String(i).padStart(2, "0")}`;
    if (!actual.includes(id)) throw new Error(`Missing id: ${id}`);
  }
}

function validateWeakWords(item) {
  const weakWordOptions = item.options.filter((option) => /\b(hanya|selalu)\b/i.test(option));
  if (weakWordOptions.length > 2) {
    throw new Error(`Too many weak-word options in: ${item.id}`);
  }
}

function validateBank(bank) {
  const clusterCounts = countBy(bank, "cluster");
  const answerCounts = countBy(bank, "answer");
  const ids = new Set();
  const stems = new Set();
  const previousStems = readPreviousStems();

  if (bank.length !== 50) throw new Error(`Expected 50 questions, got ${bank.length}`);

  for (const [cluster, expected] of Object.entries(EXPECTED_CLUSTERS)) {
    if (clusterCounts[cluster] !== expected) {
      throw new Error(`Expected ${expected} ${cluster} questions, got ${clusterCounts[cluster] || 0}`);
    }
  }

  validateIdSequence(bank, "teknis", "G3-T", EXPECTED_CLUSTERS.teknis);
  validateIdSequence(bank, "ekonomi", "G3-E", EXPECTED_CLUSTERS.ekonomi);
  validateIdSequence(bank, "sosial", "G3-S", EXPECTED_CLUSTERS.sosial);
  validateIdSequence(bank, "spasial", "G3-P", EXPECTED_CLUSTERS.spasial);

  for (const item of bank) {
    if (ids.has(item.id)) throw new Error(`Duplicate id: ${item.id}`);
    if (stems.has(item.stem)) throw new Error(`Duplicate stem in batch 3: ${item.stem}`);
    if (previousStems.has(item.stem)) throw new Error(`Duplicate stem from previous bank: ${item.id}`);
    if (!Object.hasOwn(EXPECTED_CLUSTERS, item.cluster)) throw new Error(`Invalid cluster: ${item.id}`);
    if (!LEVELS.includes(item.level)) throw new Error(`Invalid level: ${item.id}`);
    if (item.source !== "gap3") throw new Error(`Invalid source: ${item.id}`);
    if (!item.topic || !item.stem || !item.explain || item.version !== 1) throw new Error(`Invalid metadata: ${item.id}`);
    if (!Array.isArray(item.options) || item.options.length !== 5) throw new Error(`Invalid options length: ${item.id}`);
    if (new Set(item.options).size !== 5) throw new Error(`Duplicate option in: ${item.id}`);
    if (!Number.isInteger(item.answer) || item.answer < 0 || item.answer > 4) throw new Error(`Invalid answer: ${item.id}`);
    if (typeof item.options[item.answer] !== "string" || item.options[item.answer].length === 0) {
      throw new Error(`Answer points to empty option: ${item.id}`);
    }
    validateWeakWords(item);
    ids.add(item.id);
    stems.add(item.stem);
  }

  for (let answer = 0; answer <= 4; answer += 1) {
    if (answerCounts[answer] !== 10) throw new Error(`Expected 10 answers at index ${answer}, got ${answerCounts[answer] || 0}`);
  }

  return { clusterCounts, answerCounts };
}

const BALANCED = rebalanceAnswers(QUESTIONS);
const { clusterCounts, answerCounts } = validateBank(BALANCED);
fs.mkdirSync(path.dirname(OUT_PATH), { recursive: true });
fs.writeFileSync(OUT_PATH, serializeBank("BANK_GAP3", BALANCED), "utf8");

console.log(`OK: ${OUT_PATH}`);
console.log(`total: ${QUESTIONS.length}`);
console.log(`teknis: ${clusterCounts.teknis} | ekonomi: ${clusterCounts.ekonomi} | sosial: ${clusterCounts.sosial} | spasial: ${clusterCounts.spasial}`);
console.log(`answer index counts: 0=${answerCounts[0]} | 1=${answerCounts[1]} | 2=${answerCounts[2]} | 3=${answerCounts[3]} | 4=${answerCounts[4]}`);