// Bank soal kasus UKOM — dihasilkan build-kasus.js
// Jangan edit manual; jalankan: node build-kasus.js
const BANK_KASUS = [
  {
    id: "K-T01",
    cluster: "teknis",
    level: "kasus",
    stem: "Kabupaten X sedang menyusun RPJMD 2025–2030. Tim perencanaan daerah diminta memastikan keselarasan dengan arah nasional dan kebijakan sektoral. Data menunjukkan prioritas nasional pada transformasi digital, ketahanan pangan, dan penurunan emisi. Bupati meminta agar indikator kinerja daerah tidak bertentangan dengan target RPJPN dan SPPN. Dalam rapat koordinasi, muncul kebingungan antara dokumen perencanaan jangka panjang nasional, daerah, dan tahunan. Manakah urutan hierarki dan hubungan dokumen yang benar untuk dijadikan acuan penyusunan RPJMD?",
    options: [
      "RPJPN → RPJMD → RKPD; SPPN menjadi acuan arah kebijakan nasional yang diturunkan ke indikator daerah",
      "RKPD → RPJMD → RPJPN karena RKPD yang paling operasional",
      "RPJMD → RPJPN → RKPD karena RPJMD disusun lebih dulu di daerah",
      "Renstra K/L → RPJMD → RKPD tanpa perlu merujuk RPJPN",
      "SPPN menggantikan RPJPN sehingga RPJMD cukup selaras dengan SPPN saja",
    ],
    answer: 0,
    explain: "RPJPN (20 tahun) menjadi payung; RPJMD (5 tahun) menjabarkan di daerah; RKPD tahunan. SPPN (2025–2045) memuat arah kebijakan nasional yang harus diturunkan, bukan menggantikan RPJPN."
  },
  {
    id: "K-T02",
    cluster: "teknis",
    level: "kasus",
    stem: "Pemerintah kota Y melaksanakan evaluasi tahun ke-3 RPJMD. Laporan triwulanan menunjukkan 62% indikator hijau, namun dua program prioritas (sampah dan banjir) stagnan. Tim monitoring menemukan data capaian antar-OPD tidak konsisten dan baseline indikator diubah di tengah tahun. Kepala dinas meminta perencana kota menyusun rekomendasi perbaikan yang sesuai prinsip evaluasi perencanaan. Apa langkah evaluatif yang paling tepat sebelum merekomendasikan perubahan anggaran?",
    options: [
      "Verifikasi data, evaluasi proses dan capaian, analisis hambatan, lalu susun rekomendasi kebijakan/anggaran",
      "Langsung revisi RKPD karena capaian di bawah target tanpa analisis penyebab",
      "Menghentikan monitoring sampai program selesai agar tidak mengganggu pelaksanaan",
      "Mengganti seluruh indikator RPJMD agar semua hijau di laporan berikutnya",
      "Evaluasi cukup dilakukan oleh BPK saat audit, bukan tim perencanaan daerah",
    ],
    answer: 0,
    explain: "Monitoring berkala + evaluasi (proses, output, outcome) wajib menganalisis konsistensi data dan hambatan sebelum rekomendasi perubahan RKPD/kebijakan."
  },
  {
    id: "K-T03",
    cluster: "teknis",
    level: "kasus",
    stem: "Provinsi Z menyusun Renstra Perencanaan Pembangunan Daerah (Perpres 39/2023). Beberapa SKPD mengusulkan program yang sama dengan prioritas nasional tetapi tanpa sinkronisasi indikator. Perencana provinsi diminta memetakan keterkaitan program dengan RPJMD dan arah SPPN. Dalam workshop, muncul pertanyaan tentang perbedaan Renstra pembangunan dengan Renstra teknis kementerian. Manakah pendekatan yang tepat untuk menghindari duplikasi dan misalignment?",
    options: [
      "Petakan program–indikator Renstra PBD ke sasaran RPJMD dan arah SPPN; koordinasi lintas SKPD",
      "Setiap SKPD menyusun Renstra sendiri tanpa konsolidasi karena otonomi daerah",
      "Renstra PBD hanya untuk Bappeda, SKPD cukup Renja tahunan",
      "Prioritas nasional otomatis menjadi program daerah tanpa penyesuaian indikator",
      "Renstra teknis K/L sudah cukup, daerah tidak perlu Renstra pembangunan",
    ],
    answer: 0,
    explain: "Renstra Perencanaan Pembangunan Daerah memetakan program pembangunan daerah ke RPJMD/SPPN; konsolidasi lintas perangkat mencegah duplikasi."
  },
  {
    id: "K-T04",
    cluster: "teknis",
    level: "kasus",
    stem: "Kabupaten A akan mengubah RTRW karena rencana kawasan industri baru. Masyarakat memprotes karena zonasi pertanian produktif berubah menjadi kawasan industri. Perencana diminta menjelaskan tahapan yang wajib dilalui agar perubahan RTRW sah secara prosedural dan substantif. Data menunjukkan kawasan industri masuk dalam rencana SPPN terkait hilirisasi. Tahapan manakah yang benar untuk perubahan RTRW dengan mempertimbangkan partisipasi publik?",
    options: [
      "Evaluasi RTRW berkala → kajian perubahan → revisi → harmonisasi → sosialisasi → penetapan sesuai PP 21/2021",
      "Perubahan RTRW cukup dengan SK Bupati karena mendukung investasi",
      "Langsung revisi RDTR tanpa mengubah RTRW karena lebih cepat",
      "Perubahan RTRW hanya perlu persetujuan DPRD, tanpa evaluasi",
      "RTRW tidak boleh diubah setelah ditetapkan meskipun ada SPPN",
    ],
    answer: 0,
    explain: "PP 21/2021 mengatur evaluasi berkala, kajian perubahan, harmonisasi, partisipasi, dan penetapan RTRW. RDTR tidak menggantikan perubahan RTRW."
  },
  {
    id: "K-T05",
    cluster: "teknis",
    level: "kasus",
    stem: "Kota B sedang integrasi RTRW dengan RDTR dan rencana detail kawasan strategis. Investor meminta kepastian KKPR untuk lahan komersial di zona yang pada RTRW masih pertanian. Perencana menemukan ketidaksesuaian antara peta RDTR (zona campuran) dan ketentuan UU 26/2007 tentang pertanian pangan. Dalam rapat, disebutkan bahwa 30% lahan lindung nasional harus dijaga. Pendekatan manakah yang paling tepat untuk rekomendasi perizinan berbasis tata ruang?",
    options: [
      "Cek kesesuaian RDTR/RTRW, status lahan, LP2B, dan aturan lindung; KKPR hanya jika sesuai rencana tata ruang",
      "KKPR dapat diterbitkan karena RDTR zona campuran mengizinkan komersial",
      "30% lindung nasional berlaku di setiap bidang tanah investor tanpa pengecualian",
      "UU 26/2007 tidak relevan jika ada investasi strategis nasional",
      "Rencana SPPN otomatis mengubah RTRW tanpa prosedur perubahan",
    ],
    answer: 0,
    explain: "KKPR wajib sesuai RTRW/RDTR dan regulasi sektoral (pertanian, lindung). UU 26 melindungi LP2B; 30% lindung nasional bukan berarti setiap bidang tanah wajib 30% lindung."
  },
  {
    id: "K-T06",
    cluster: "teknis",
    level: "kasus",
    stem: "Desa C berbatasan dengan sungai strategis nasional. Usulan pembangunan permukiman di sempadan sungai ditolak camat, tetapi pengurus desa menunjuk Perda setempat yang mengizinkan jarak 50 m. Perencana kabupaten membawa PP 21/2021 dan Perpres 87/2023 tentang sempadan. Terdapat juga rencana normalisasi sungai dari dinas PU. Berapa jarak sempadan minimum yang seharusnya menjadi acuan perencana desa untuk sungai strategis nasional?",
    options: [
      "100 m dari tepi sungai (sempadan sungai strategis nasional sesuai ketentuan nasional)",
      "50 m karena Perda desa lebih dekat dengan kondisi lapangan",
      "25 m cukup jika ada tanggul penahan banjir",
      "Tidak ada sempadan jika warga sudah lama menempati",
      "50 m untuk semua sungai tanpa membedakan klasifikasi",
    ],
    answer: 0,
    explain: "Trap umum: sungai strategis nasional sempadan 100 m (PP 21/2021). 50 m berlaku untuk kategori tertentu, bukan menggantikan 100 m pada sungai strategis nasional."
  },
  {
    id: "K-T07",
    cluster: "teknis",
    level: "kasus",
    stem: "Kabupaten D menetapkan kepadatan bangunan 40 di pusat kota dalam RDTR, sementara infrastruktur drainase dan jalan hanya mampu melayani kepadatan efektif 25. Pengembang mengajukan izin apartemen 12 lantai dengan GS 2,8. Tim perencanaan diminta menilai kebijakan kepadatan dan dampaknya. Data SIM menunjukkan peningkatan kemacetan 18% dalam dua tahun terakhir. Rekomendasi kebijakan tata ruang yang paling tepat adalah …",
    options: [
      "Review kepadatan/RDTR dengan kajian daya dukung infrastruktur dan Dampak Lalu Lintas",
      "Tetapkan kepadatan 40 agar PAD meningkat tanpa kajian infrastruktur",
      "GS tinggi tidak masalah selama ada parkir basement",
      "Kepadatan hanya ditentukan investor sesuai permintaan pasar",
      "Turunkan kepadatan ke nol di seluruh pusat kota tanpa analisis",
    ],
    answer: 0,
    explain: "Kepadatan RDTR harus selaras daya dukung–daya tampung. Kajian infrastruktur dan dampak lalu lintas menjadi dasar revisi kebijakan zonasi/kepadatan."
  },
  {
    id: "K-T08",
    cluster: "teknis",
    level: "kasus",
    stem: "Kota E merencanakan RTH publik 15% menurut UU 26/2007, tetapi realisasi di peta hanya 9%. Sebagian lahan RTH direncanakan alih fungsi menjadi pasar modern. Komunitas menuntut penegakan RTH minimal 20% menurut Perda kota. Perencana diminta harmonisasi norma. Dalam rapat, juga dibahas insentif developer untuk menyediakan RTH di dalam kavling. Manakah penafsiran yang benar terkait besaran RTH?",
    options: [
      "UU 26 mensyaratkan minimal 20% luas kota untuk RTH; RDTR menjabarkan lokasi dan pencapaian bertahap",
      "15% cukup karena angka 20% hanya rekomendasi SPPN",
      "Perda 20% menggantikan UU 26 sehingga 9% boleh jika ada pasar modern",
      "RTH dapat diganti dengan sumbangan uang kepada pemerintah kota",
      "RTH hanya wajib di kawasan permukiman baru, bukan pusat kota",
    ],
    answer: 0,
    explain: "UU 26/2007: minimal 20% RTH dari luas kota. Perda tidak boleh mengurangi standar minimum; rencana alih fungsi RTH harus melalui perubahan tata ruang."
  },
  {
    id: "K-T09",
    cluster: "teknis",
    level: "kasus",
    stem: "Provinsi F melakukan sinkronisasi RKPD 2026 dengan Musrenbang. Beberapa usulan kecamatan sama-sama mengajukan jalan desa, padahal prioritas RPJMD adalah ketahanan pangan. Bappeda provinsi meminta perencana menilai usulan dengan kriteria prioritas nasional, provinsi, dan kemampuan fiskal. Data DAUK menunjukkan belanja pegawai 62%. Prinsip perencanaan manakah yang harus diterapkan dalam memprioritaskan usulan?",
    options: [
      "Kesesuaian RPJMD/SPPN, urgensi, dampak, ketersediaan anggaran, dan kemampuan pelaksanaan",
      "Usulan dengan dukungan massa terbanyak otomatis masuk RKPD",
      "Semua usulan jalan desa masuk agar adil antarkecamatan",
      "Prioritas nasional diabaikan jika ada lobi DPRD",
      "RKPD tidak perlu sinkron dengan RPJMD karena tahunan",
    ],
    answer: 0,
    explain: "RKPD harus selaras RPJMD dan arah SPPN; prioritisasi mempertimbangkan urgensi, dampak, fiscal space, bukan votek politik semata."
  },
  {
    id: "K-T10",
    cluster: "teknis",
    level: "kasus",
    stem: "Kabupaten G menyusun laporan akhir RPJMD dan akan memulai RPJMD baru. Evaluasi menunjukkan program penurunan stunting berhasil, tetapi emisi GRK meningkat karena industri kecil. Perencana diminta mengintegrasikan agenda iklim ke dokumen perencanaan berikutnya sesuai arah SPPN. Kepala daerah meminta indikator yang terukur dan bisa dimonitor tiap semester. Komponen monitoring–evaluasi yang paling relevan untuk RPJMD berikutnya adalah …",
    options: [
      "Indikator kinerja utama, baseline emisi, target penurunan, dan mekanisme evaluasi tahunan",
      "Hanya laporan keuangan karena anggaran paling mudah diukur",
      "Monitoring cukup di akhir periode RPJMD tanpa indikator perantara",
      "Agenda iklim tidak perlu masuk RPJMD karena sudah ada SPPN",
      "Evaluasi dilakukan jika ada audit BPK saja",
    ],
    answer: 0,
    explain: "SPPN dan RPJMD perlu indikator iklim terukur; M&E berkala (semester/tahun) dengan baseline dan evaluasi proses–capaian."
  },
  {
    id: "K-E01",
    cluster: "ekonomi",
    level: "kasus",
    stem: "Data BPS menunjukkan pertumbuhan PDB kota H 5,2% (yoy), sementara GNI per kapita naik 3,8%. Warga mengeluhkan harga pangan dan sewa naik lebih cepat. Inflasi kota 4,1% dan inflasi pangan 6,5%. Tim ekonomi daerah diminta menjelaskan perbedaan konsep dan implikasi kebijakan. Bupati ingin argumen yang tepat untuk intervensi pasar pangan. Pernyataan manakah yang paling akurat?",
    options: [
      "PDB mengukur nilai produksi; GNI termasuk pendapatan dari luar wilayah; inflasi mengukur perubahan harga—ketiganya bisa bergerak berbeda",
      "PDB naik otomatis berarti kesejahteraan warga naik sama",
      "GNI sama dengan PDB karena hanya beda nama statistik",
      "Inflasi pangan tinggi tidak relevan jika PDB tinggi",
      "Inflasi 4,1% berarti semua barang naik tepat 4,1%",
    ],
    answer: 0,
    explain: "PDB (produksi), GNI (pendapatan penduduk termasuk transfer luar), inflasi (indeks harga) adalah indikator berbeda; pertumbuhan PDB tidak selalu berarti daya beli naik."
  },
  {
    id: "K-E02",
    cluster: "ekonomi",
    level: "kasus",
    stem: "Provinsi I menganalisis struktur ekonomi dengan LQ. Sektor A (pertanian) LQ 1,8; sektor B (logistik) LQ 0,9; sektor C (pariwisata) LQ 1,4. Pemerintah ingin memperkuat sektor unggulan dan menutup ketergantungan impor pangan. Perencana diminta menafsirkan LQ dan merumuskan arah kebijakan. Interpretasi dan rekomendasi yang tepat adalah …",
    options: [
      "Sektor A dan C unggulan (LQ>1); B perlu pengembangan; pertanian tetap diperkuat meski sudah unggulan",
      "Hanya sektor dengan LQ tertinggi yang diabaikan sisanya",
      "LQ 0,9 berarti sektor B harus ditutup",
      "LQ tidak relevan untuk perencanaan daerah",
      "Semua sektor LQ>1 harus diganti ke industri berat",
    ],
    answer: 0,
    explain: "LQ>1: spesialisasi/keunggulan komparatif; LQ<1: belum unggul. Kebijakan memperkuat unggulan sambil mengembangkan sektor strategis yang masih lemah."
  },
  {
    id: "K-E03",
    cluster: "ekonomi",
    level: "kasus",
    stem: "Kabupaten J menghitung DLQ untuk industri pengolahan kayu: DLQ turun dari 1,3 ke 0,95 dalam lima tahun. Ekspor kayu olahan meningkat, tetapi lapangan kerja hanya naik 2%. Dinas perindag meminta penjelasan apakah daya saing meningkat atau struktur melemah. Data menunjukkan investasi mesin pengeringan baru. Kesimpulan ekonomi regional yang paling tepat adalah …",
    options: [
      "Spesialisasi relatif melemah (DLQ<1); perlu analisis produktivitas, rantai nilai, dan dampak tenaga kerja",
      "DLQ turun selalu buruk sehingga industri harus dihentikan",
      "DLQ>1 pasti berarti banyak lapangan kerja baru",
      "Ekspor naik berarti DLQ pasti naik",
      "DLQ sama dengan LQ sehingga tidak perlu dihitung",
    ],
    answer: 0,
    explain: "DLQ mengukur pergeseran spesialisasi antarwaktu; turun ke <1 berarti keunggulan relatif melemah—analisis lanjut produktivitas dan employment diperlukan."
  },
  {
    id: "K-E04",
    cluster: "ekonomi",
    level: "kasus",
    stem: "Kota K melakukan simulasi kebijakan harga beras. Permintaan lokal elastisitas −0,6; subsidi 20% menurunkan harga 10%; stok impor terbatas. Tim ekonomi diminta memperkirakan dampak kuantitas yang diminta dan implikasi fiskal. Jika harga beras turun 10%, perkiraan perubahan kuantitas diminta (ceteris paribus) adalah …",
    options: [
      "Naik sekitar 6% (0,6 × 10%)",
      "Naik 10% karena harga turun 10%",
      "Tidak berubah karena beras kebutuhan pokok",
      "Turun 6% karena subsidi membuat kualitas buruk",
      "Naik 20% karena elastisitas 2,0",
    ],
    answer: 0,
    explain: "ΔQ% = elastisitas × ΔP% = −0,6 × (−10%) = +6%. Permintaan inelastis (<1) tetapi tetap bereaksi searah harga."
  },
  {
    id: "K-E05",
    cluster: "ekonomi",
    level: "kasus",
    stem: "Provinsi L: ICOR rencana 5,2; realisasi investasi meningkat 8%; pertumbuhan ekonomi 4,5%. Bappeda mempertanyakan efisiensi investasi infrastruktur jalan. Beberapa proyek mangkrak menahan penyerapan. Perencana diminta menafsirkan ICOR aktual kasar. ICOR aktual ≈ 8/4,5 ≈ 1,78 (investasi naik 8%, output 4,5%). Artinya …",
    options: [
      "ICOR aktual lebih rendah dari rencana—efisiensi investasi relatif membaik, tetapi perlu kualitas investasi",
      "ICOR aktual 5,2 sehingga investasi boros",
      "ICOR tidak bisa dihitung dari pertumbuhan",
      "ICOR tinggi selalu baik karena banyak investasi",
      "ICOR hanya untuk negara, bukan provinsi",
    ],
    answer: 0,
    explain: "ICOR = ΔInvestasi/ΔOutput. Aktual ~1,78 < rencana 5,2: secara kasar efisiensi membaik; tetap perlu cek kualitas & proyek mangkrak."
  },
  {
    id: "K-E06",
    cluster: "ekonomi",
    level: "kasus",
    stem: "Data makro kota M: pengangguran 6,8%, inflasi 3,2%, pertumbuhan 5,1%. Phillips curve jangka pendek menunjukkan trade-off. Pemerintah kota ingin menekan pengangguran dengan stimulus belanja infrastruktur tanpa memicu inflasi tinggi. Perencana ekonomi memberikan catatan kebijakan. Pernyataan tentang Phillips curve yang tepat dalam konteks ini adalah …",
    options: [
      "Stimulus dapat menekan pengangguran jangka pendek tetapi berisiko menaikkan inflasi jika demand overheating",
      "Phillips curve menjamin inflasi turun jika pengangguran naik",
      "Stimulus infrastruktur tidak mempengaruhi inflasi sama sekali",
      "Pengangguran 6,8% otomatis berarti inflasi harus 6,8%",
      "Trade-off hilang permanen di semua horizon waktu",
    ],
    answer: 0,
    explain: "Kurva Phillips: trade-off jangka pendek antara pengangguran dan inflasi; stimulus aggregate demand berisiko inflasi jika kapasitas terbatas."
  },
  {
    id: "K-E07",
    cluster: "ekonomi",
    level: "kasus",
    stem: "Kabupaten N menghitung Gini 0,36 (turun dari 0,39). Namun desa pesisir masih miskin ekstrem 12% sementara kota pusat makmur. Program BLT dan UMKM ditargetkan ulang. Perencana diminta menjelaskan arti Gini dan kebutuhan analisis tambahan. Kepala daerah bertanya apakah Gini saja cukup untuk menilai pemerataan. Jawaban analitis yang tepat adalah …",
    options: [
      "Gini membaik secara agregat, tetapi perlu peta kemiskinan spasial dan indeks desa untuk targeting",
      "Gini turun berarti semua desa sudah setara",
      "Gini tidak relevan untuk kabupaten",
      "Gini 0,36 berarti tidak ada kemiskinan",
      "Cukup lanjutkan BLT tanpa data spasial",
    ],
    answer: 0,
    explain: "Gini mengukur ketimpangan distribusi pendapatan agregat; tetap butuh analisis spasial/kemiskinan ekstrem untuk program targeted."
  },
  {
    id: "K-E08",
    cluster: "ekonomi",
    level: "kasus",
    stem: "Kota O menaikkan UMK 12%. Asosiasi pedagang khawatir penurunan lapangan kerja formal; serikat pekerja menduga daya beli naik. Data elastisitas permintaan tenaga kerja −0,4 terhadap upah. Biaya tenaga kerja naik ±8% untuk sektor formal kecil. Perkiraan dampak jumlah tenaga kerja formal (ceteris paribus) adalah …",
    options: [
      "Penurunan sekitar 3,2% (0,4 × 8%)",
      "Kenaikan 12% karena upah naik",
      "Tidak ada efek karena UMK wajib",
      "Penurunan 12% karena pedagang tutup",
      "Kenaikan 8% karena produktivitas otomatis naik",
    ],
    answer: 0,
    explain: "Elastisitas tenaga kerja −0,4: kenaikan biaya upah 8% → permintaan tenaga kerja turun ~3,2%; dampak riil bergantung struktur usaha."
  },
  {
    id: "K-E09",
    cluster: "ekonomi",
    level: "kasus",
    stem: "Provinsi P menyusun proyeksi PDB 5 tahun. Model input-output menunjukkan multiplier sektor pariwisata 1,7, sektor pertanian 1,3. Anggaran terbatas; dua skenario: (A) festival pariwisata, (B) irigasi pertanian. Tim diminta memilih berdasarkan dampak ekonomi dan ketahanan pangan SPPN. Pertimbangan kebijakan yang paling seimbang adalah …",
    options: [
      "Kombinasi: irigasi untuk ketahanan pangan + pariwisata terukur; gunakan IO untuk prioritas, bukan satu sektor saja",
      "Pilih pariwisata saja karena multiplier tertinggi",
      "Pilih pertanian saja karena SPPN mengabaikan pariwisata",
      "Multiplier IO tidak relevan untuk RPJMD",
      "Tidak perlu proyeksi, cukup tren historis",
    ],
    answer: 0,
    explain: "IO multiplier membantu membandingkan dampak ekonomi; kebijakan perlu selaras SPPN (pangan) dan potensi unggulan (pariwisata), bukan ekstrem tunggal."
  },
  {
    id: "K-E10",
    cluster: "ekonomi",
    level: "kasus",
    stem: "Kabupaten Q: harga cabai melonjak 80% karena panen gagal. Permintaan cabai elastisitas −1,2. Pemerintah mempertimbangkan operasi pasar dan impor terbatas. Tanpa intervensi, konsumsi diperkirakan turun kuat. Jika harga diturunkan 20% via OPS, perkiraan perubahan kuantitas adalah …",
    options: [
      "Naik sekitar 24% (1,2 × 20%)",
      "Naik 20% karena harga turun 20%",
      "Tidak berubah karena cabai kebutuhan pokok",
      "Turun karena OPS membuat kualitas buruk",
      "Naik 80% mengikuti lonjakan harga sebelumnya",
    ],
    answer: 0,
    explain: "Elastisitas >1 (elastis): ΔQ% = 1,2 × 20% = 24% naik jika harga turun 20%; OPS cocok untuk komoditas elastis saat shock supply."
  },
  {
    id: "K-S01",
    cluster: "sosial",
    level: "kasus",
    stem: "Desa R akan mengembangkan homestay wisata bahari. Tim PRA menemukan akses air bersih 40% rumah, remaja putus sekolah 15%, dan perempuan belum terlibat dalam musdes. Perencana sosial diminta merumuskan intervensi berbasis partisipasi. Kepala desa ingin cepat bangun dermaga tanpa forum. Langkah perencanaan sosial yang paling tepat adalah …",
    options: [
      "Lanjutkan PRA, fasilitasi musyawarah inklusif perempuan–remaja, baru integrasi ke RKPD desa",
      "Langsung bangun dermaga karena wisata menghasilkan PAD",
      "PRA cukup sekali di awal proyek, tidak perlu monitoring sosial",
      "Partisipasi ditunda sampai proyek selesai",
      "SOC tidak diperlukan karena sudah ada PRA",
    ],
    answer: 0,
    explain: "PRA + partisipasi inklusif (perempuan, remaja) → rencana aksi sosial → integrasi RKPD. Infrastruktur tanpa kesepakatan sosial berisiko konflik."
  },
  {
    id: "K-S02",
    cluster: "sosial",
    level: "kasus",
    stem: "Kota S: IPM 76,2; rata-rata lama sekolah 8,1 tahun; harapan sekolah 12,4; pengeluaran per kapita mendekati threshold. Program prioritas: beasiswa SMA dan posyandu lansia. Perencana diminta memilih intervensi yang paling mempengaruhi komponen IPM. Data menunjukkan putus sekolah usia 15–18 tertinggi di dua kecamatan. Intervensi yang paling tepat adalah …",
    options: [
      "Beasiswa dan penjaminan akses SMA di kecamatan rawan putus sekolah (komponen pendidikan IPM)",
      "Hanya posyandu lansia karena mudah diukur",
      "IPM hanya ditentukan pengeluaran, abaikan pendidikan",
      "Bangun mall untuk menaikkan pengeluaran per kapita",
      "Ganti indikator IPM dengan angka kemiskinan saja",
    ],
    answer: 0,
    explain: "IPM = f(Umur Hidup, Pendidikan, Pengeluaran). Putus SMA langsung menekan rata-rata & harapan sekolah—intervensi pendidikan paling relevan."
  },
  {
    id: "K-S03",
    cluster: "sosial",
    level: "kasus",
    stem: "Kabupaten T menurunkan kemiskinan 2,1 poin, tetapi Gini naik 0,02. Warga miskin perkotaan mengeluhkan kenaikan sewa. Program PKH dan PIP masih berjalan; data SOC menunjukkan akses transportasi ke pusat layanan buruk. Bupati meminta evaluasi sosial terintegrasi. Kesimpulan kebijakan sosial yang tepat adalah …",
    options: [
      "Capaian kemiskinan positif, tetapi perlu program pemerataan akses layanan dan monitoring dampak sewa",
      "Kemiskinan turun berarti tidak perlu program sosial lagi",
      "Gini naik selalu berarti program gagal total",
      "Hentikan PKH karena Gini naik",
      "Fokus hanya pada desa karena kemiskinan perkotaan tidak relevan",
    ],
    answer: 0,
    explain: "Kemiskinan dan ketimpangan bisa bergerak berbeda; perlu evaluasi dampak distribusi, akses layanan (SOC), dan intervensi perkotaan."
  },
  {
    id: "K-S04",
    cluster: "sosial",
    level: "kasus",
    stem: "Kecamatan U: indeks partisipasi perempuan dalam perencanaan desa 22%. Proyek drainase direncanakan tanpa konsultasi gender. Lurah meminta perencana menambahkan analisis gender dan rencana aksi. Data menunjukkan beban kerja perempuan meningkat saat musim banjir. Pendekatan yang paling sesuai prinsip perencanaan sosial inklusif adalah …",
    options: [
      "Gender analysis, forum perempuan, indikator partisipasi, dan desain drainase yang mengurangi beban kerja rumah tangga",
      "Drainase dibangun dulu, gender analysis setelah proyek",
      "Partisipasi perempuan tidak wajib dalam RPJMDes",
      "Cukup serahkan ke PKK tanpa integrasi RKPD",
      "Indeks partisipasi hanya simbolik di laporan",
    ],
    answer: 0,
    explain: "Perencanaan sosial inklusif: analisis gender, partisipasi substantif, indikator monitorable, desain proyek yang adil gender."
  },
  {
    id: "K-S05",
    cluster: "sosial",
    level: "kasus",
    stem: "Desa V: 35% rumah tangga penerima BLT, 18% usaha mikro terganggu banjir. Tim PRA dan SOC merekomendasikan diversifikasi mata pencaharian dan pelatihan BPJS Ketenagakerjaan bagi buruh harian. Anggaran desa terbatas Rp 800 juta. Prioritas RKPD desa yang paling tepat adalah …",
    options: [
      "Program ketahanan sosial–ekonomi: pelatihan, asuransi, dan mitigasi banjir terintegrasi PRA",
      "BLT ditambah tanpa program produktif karena paling cepat",
      "Hanya infrastruktur jalan karena terlihat fisik",
      "Tunda semua program sampai ada CSR perusahaan",
      "SOC dan PRA dihapus untuk efisiensi biaya",
    ],
    answer: 0,
    explain: "PRA/SOC mengarahkan intervensi produktif + proteksi sosial; integrasi mitigasi banjir dan peningkatan mata pencaharian lebih berkelanjutan daripada BLT saja."
  },
  {
    id: "K-S06",
    cluster: "sosial",
    level: "kasus",
    stem: "Kota W meluncurkan layanan digital administrasi kependudukan. Lansia 60+ kesulitan akses; digital divide tinggi di lima kelurahan. Perencana sosial mengusulkan pendamping lokal dan pos layanan terpadu. Kepala dinas meminta indikator keberhasilan sosial, bukan hanya jumlah download aplikasi. Indikator yang paling tepat adalah …",
    options: [
      "Proporsi lansia terlayani dengan pendamping, waktu layanan, dan kepuasan inklusif",
      "Jumlah download aplikasi dan follower media sosial dinas",
      "Jumlah smartphone yang dibagikan",
      "Indikator IT saja karena digitalisasi adalah tujuan akhir",
      "Tidak perlu indikator sosial jika aplikasi sudah launching",
    ],
    answer: 0,
    explain: "Evaluasi sosial: akses inklusif kelompok rentan, kualitas layanan, kepuasan—bukan metrik teknologi semata."
  },
  {
    id: "K-S07",
    cluster: "sosial",
    level: "kasus",
    stem: "Kabupaten X: stunting 28%, sanitasi 52%, akses air 61%. Program integrasi: PMT, sanitasi komunal, dan penyuluhan gizi. Setelah 2 tahun, stunting 24%, tetapi sanitasi 54%. Camat meminta penjelasan mengapa capaian tidak seimbang. Perencana sosial kesehatan diminta evaluasi. Penjelasan evaluatif yang tepat adalah …",
    options: [
      "Stunting multi-faktor; butuh waktu untuk intervensi sanitasi; evaluasi proses dan perbaikan targeting desa",
      "Program gagal karena sanitasi tidak 100%",
      "Stunting turun berarti semua indikator harus turun",
      "Ganti indikator ke jumlah PMT saja",
      "Hentikan program karena hasil tidak serentak",
    ],
    answer: 0,
    explain: "Stunting ditentukan gizi, sanitasi, air, ASI; capaian berbeda per indikator normal—evaluasi proses dan perpanjangan intervensi sanitasi."
  },
  {
    id: "K-S08",
    cluster: "sosial",
    level: "kasus",
    stem: "Provinsi Y: migrasi tenaga kerja remaja ke kota besar meningkat. Data SOC: remaja putus sekolah 19%, akses bursa kerja lokal terbatas. RPJMD memuat program vokasi dan link and match industri. Perusahaan menawarkan magang tetapi tanpa MOU sekolah. Rencana aksi sosial–ekonomi yang paling tepat adalah …",
    options: [
      "Vokasi terintegrasi MOU industri, bursa kerja lokal, dan monitoring SOC remaja",
      "Larang migrasi dengan Perda",
      "Magang tanpa kurikulum vokasi karena cepat",
      "Fokus hanya pada bantuan tiket pulang",
      "SOC tidak perlu jika ada program vokasi",
    ],
    answer: 0,
    explain: "Intervensi berkelanjutan: pendidikan vokasi + penghubung industri + monitoring SOC; larangan migrasi tidak efektif."
  },
  {
    id: "K-P01",
    cluster: "spasial",
    level: "kasus",
    stem: "Kabupaten Z meninjau RTH: peta menunjukkan 17% RTH, tetapi lapangan hanya 11% terawat. Sebagian ditandai RTH pada peta zoning tetapi berstatus sengketa. UU 26 mensyaratkan 20%. Perda menetapkan insentif developer 10% area kavling untuk ruang terbuka. Perencana diminta strategi pencapaian RTH substantif. Strategi yang paling tepat adalah …",
    options: [
      "Inventarisasi RTH riil, penegasan status lahan, penertiban, dan penambahan RTH melalui RDTR serta kavling",
      "Cukup ubah peta zoning tanpa penataan lapangan",
      "10% kavling developer mengganti 20% kota",
      "RTH 17% di peta sudah memenuhi UU 26",
      "Tunda pencapaian sampai akhir RPJMD",
    ],
    answer: 0,
    explain: "RTH substantif ≠ zoning semata; UU 26 minimal 20% luas kota; kombinasi penataan, penegakan, dan penambahan RTH fisik."
  },
  {
    id: "K-P02",
    cluster: "spasial",
    level: "kasus",
    stem: "Kota AA: RDTR zona perkantoran KDB 60%, KLB 5. Lahan 1 ha; rencana menara 30 lantai. Warga sekitar khawatir bayangan dan ventilasi. Perencana diminta hitung intensitas dan alternatif yang memenuhi kepadatan. Luas bangunan maksimum ≈ 1 ha × KLB 5 = 5 ha = 50.000 m². Jika luas lantai standar 1.500 m², perkiraan lantai efektif ≈ 33 lantai sebelum faktor teknis. Rekomendasi perencanaan yang paling tepat adalah …",
    options: [
      "Kaji kesesuaian KLB/KDB dengan infrastruktur, dampak lingkungan, dan alternatif bangunan bertingkat sedang",
      "Setuju 30 lantai karena investor menjanjikan PAD",
      "KDB 60% berarti 60% lahan boleh tidak hijau",
      "KLB tidak berlaku untuk perkantoran",
      "Tinggi bangunan bebas tanpa RDTR",
    ],
    answer: 0,
    explain: "KDB/KLB membatasi intensitas; analisis dampak dan infrastruktur wajib—bukan sekadar memaksimalkan lantai tanpa kajian."
  },
  {
    id: "K-P03",
    cluster: "spasial",
    level: "kasus",
    stem: "Desa BB di tepi pantai: usulan tambak 50 ha di kawasan mangrove. Peta SPPN mencatat hilirisasi perikanan, tetapi juga ketahanan ekosistem pesisir. KKP melarang konversi mangrove; masyarakat menuntut lapangan kerja. Perencana kabupaten diminta menyeimbangkan SPPN, UU 26, dan ekonomi lokal. Rekomendasi tata ruang pesisir yang tepat adalah …",
    options: [
      "Tolak konversi mangrove; kembangkan budidaya ramah lingkungan di lahan terdegradasi non-mangrove",
      "Setujui tambak 50 ha karena SPPN mendukung perikanan",
      "Mangrove boleh dikonversi 30% sesuai mitos lindung nasional per bidang",
      "KKPR tambak tanpa kajian karena desa miskin",
      "SPPN tidak berlaku di desa",
    ],
    answer: 0,
    explain: "Mangrove dilindungi; SPPN pesisir = hilirisasi + ekosistem. Alternatif budidaya di lahan bukan mangrove atau intensifikasi ramah lingkungan."
  },
  {
    id: "K-P04",
    cluster: "spasial",
    level: "kasus",
    stem: "Kota CC: sungai kota klasifikasi bukan strategis nasional. Camat mengutip sempadan 50 m; warga membangun di 40 m dari tepi. Perencana membawa PP 21/2021 dan menunjukkan klasifikasi sungai. Banjir tahun lalu merendam 120 rumah di 55 m dari tepi. Tindakan penataan yang paling tepat adalah …",
    options: [
      "Terapkan sempadan sesuai klasifikasi sungai (50 m untuk kategori tertentu), relocasi berisiko, dan normalisasi terukur",
      "100 m wajib untuk semua sungai termasuk anak sungai kecil",
      "50 m tidak berlaku karena banjir hanya musiman",
      "Biarkan karena sudah 40 m dan warga protes",
      "Sempadan ditentukan camat tanpa rujukan PP",
    ],
    answer: 0,
    explain: "Trap: 100 m untuk sungai strategis nasional; 50 m untuk kategori lain sesuai PP 21. Klasifikasi sungai menentukan jarak—bukan seragam 100 m semua."
  },
  {
    id: "K-P05",
    cluster: "spasial",
    level: "kasus",
    stem: "Kabupaten DD: investor meminta KKPR di lahan pertanian pangan (LP2B) untuk kawasan logistik. RDTR masih zona pertanian. UU 26/2007 melarang alih fungsi LP2B kecuali dengan mekanisme ketat. Bupati menekan agar cepat untuk PAD. Perencana diminta langkah prosedural. Langkah yang benar adalah …",
    options: [
      "Kaji LP2B, ubah RTRW/RDTR melalui prosedur, kajian ketersediaan pangan, baru pertimbangkan KKPR",
      "KKPR langsung karena logistik nasional strategis",
      "UU 26 tidak berlaku untuk logistik",
      "Alih fungsi 30% lindung nasional sudah cukup untuk LP2B",
      "RDTR zona pertanian bisa diabaikan jika ada investasi",
    ],
    answer: 0,
    explain: "LP2B dilindungi UU 26; alih fungsi butuh perubahan tata ruang & kajian pangan. KKPR tidak boleh melanggar RDTR/RTRW."
  },
  {
    id: "K-P06",
    cluster: "spasial",
    level: "kasus",
    stem: "Kota EE: peta RDTR skala 1:5000; TWR skala 1:1000 untuk blok pusat. Terdapat selisih batas sungai 8 m antara peta. Proyek jembatan menggunakan RDTR; warga menunjuk TWR. Perencana diminta harmonisasi. Prinsip yang benar adalah …",
    options: [
      "TWR/detail mengikuti ketelitian lebih tinggi; harmonisasi dengan RTRW/RDTR dan data survei lapangan",
      "RDTR selalu menggantikan TWR karena lebih luas cakupan",
      "Pilih peta yang mendukung proyek investor",
      "Selisih 8 m diabaikan karena kecil",
      "TWR tidak perlu selaras RDTR",
    ],
    answer: 0,
    explain: "Hierarchy: RTRW → RDTR → rencana teknis; detail site plan/TWR harus harmon dengan RDTR setelah verifikasi lapangan."
  },
  {
    id: "K-P07",
    cluster: "spasial",
    level: "kasus",
    stem: "Provinsi FF: koridor SPPN energi terbarukan melintasi dua kabupaten. Lahan status HPT sesuai UU 26. Pengembang PLTS meminta izin di HPT. Perencana provinsi diminta penafsiran status lahan dan tata ruang. Kementerian LH meminta kajian AMDAL. Pendekatan izin yang tepat adalah …",
    options: [
      "Cek status HPT/HPL, kesesuaian RTRW provinsi/kab, AMDAL, dan koordinasi SPPN–tata ruang",
      "PLTS otomatis diizinkan karena energi hijau",
      "HPT boleh dialihkan seperti lahan industri biasa",
      "AMDAL tidak perlu untuk PLTS skala menengah",
      "SPPN mengganti UU 26 untuk lahan HPT",
    ],
    answer: 0,
    explain: "HPT/HPL punya aturan khusus; proyek SPPN tetap melalui kesesuaian tata ruang, perlindungan lahan, dan AMDAL."
  },
  {
    id: "K-P08",
    cluster: "spasial",
    level: "kasus",
    stem: "Kota GG: kawasan permukiman padat di lereng 25–30°. Longsor 2024 menewaskan 4 jiwa. RDTR masih mengizinkan padat KDB 70%. Perencana diminta mitigasi berbasis tata ruang. Data kearifan lokal: rumah panggung tradisional lebih aman. Kebijakan spasial yang paling tepat adalah …",
    options: [
      "Revisi RDTR: batasi KDB, zona larangan bangun, peta bahaya, relocasi, dan bangunan panggung terstandar",
      "Tetap KDB 70% dengan pagar beton",
      "Mitigasi hanya tanggung jawab BPBD, bukan tata ruang",
      "Longsor tidak mempengaruhi zonasi",
      "Relokasi tidak perlu karena warga menolak",
    ],
    answer: 0,
    explain: "Mitigasi bencana integratif: peta bahaya, zonasi, kepadatan, standar bangunan, relocasi—bukan hanya respons BPBD."
  },
  {
    id: "K-P09",
    cluster: "spasial",
    level: "kasus",
    stem: "Kabupaten HH: jalan nasional direncanakan membelah hutan lindung 12 ha. UU 26 melarang konversi lindung kecuali kasus ketat. Kementerian PU mengusulkan jalan tol. Masyarakat adat menolak. Perencana diminta alternatif alignment. Opsi perencanaan yang paling tepat adalah …",
    options: [
      "Kaji alternatif jalur di luar lindung, kajian lingkungan, dan mekanisme perlindungan jika tidak ada alternatif",
      "Langsung setujui karena jalan nasional prioritas",
      "12 ha kecil sehingga UU 26 tidak berlaku",
      "30% lindung nasional berarti 12 ha boleh diambil lokal",
      "Tol tidak perlu izin tata ruang",
    ],
    answer: 0,
    explain: "Trap: 30% lindung nasional agregat, bukan izin konversi sembarang; hutan lindung dilindungi—alternatif alignment prioritas."
  },
  {
    id: "K-P10",
    cluster: "spasial",
    level: "kasus",
    stem: "Kota II: revitalisasi kawasan cagar budaya. Investor ingin hotel 15 lantai di buffer zone. RDTR buffer KDB 40%, tinggi maks 12 m. Tim budaya menolak; Dinas pariwisata mendukung hotel. Perencana diminta keputusan berbasis PP 21 dan perlindungan cagar. Keputusan tata ruang yang tepat adalah …",
    options: [
      "Patuhi buffer cagar budaya; tinggi dan KDB sesuai RDTR; hotel dirancang menyesuaikan, bukan menabrak",
      "Hotel 15 lantai boleh jika ada dampak positif PAD",
      "Buffer zone tidak mengikat jika ada investasi",
      "Revitalisasi berarti bangunan baru bebas tinggi",
      "Cagar budaya hanya urusan museum, bukan RDTR",
    ],
    answer: 0,
    explain: "Kawasan cagar + buffer diatur RDTR/PP 21; revitalisasi harus menjaga nilai budaya, bukan intensifikasi melanggar ketentuan."
  },
  {
    id: "K-P11",
    cluster: "spasial",
    level: "kasus",
    stem: "Desa JJ: permukiman di pesisir 100 m dari garis pantai. Badan geografi mencatat abrasi 3 m/tahun. SPPN pesisir menekankan adaptasi iklim. Usulan tanggul beton vs retreat dan vegetasi mangrove. Perencana diminta kombinasi teknis–tata ruang. Paket intervensi yang paling tepat adalah …",
    options: [
      "Garis sempadan pesisir, mangrove, zonasi retreat, dan infrastruktur pelindung terukur",
      "Tanggul beton saja tanpa zonasi",
      "Bangun padat di 100 m karena sudah ada permukiman",
      "Abrasi diabaikan karena 3 m kecil",
      "SPPN pesisir tidak berlaku di desa",
    ],
    answer: 0,
    explain: "Adaptasi pesisir: kombinasi vegetasi, infrastruktur, zonasi retreat/sempadan, bukan hard structure semata."
  },
  {
    id: "K-P12",
    cluster: "spasial",
    level: "kasus",
    stem: "Kota KK: integrasi transportasi publik BRT dengan RDTR. Koridor BRT melintasi zona perdagangan KLB tinggi. Parkir on-street 40% ruas. Evaluasi menunjukkan kecepatan BRT turun 35%. Perencana diminta kebijakan zonasi dan manajemen parkir. Target SPPN mobilitas berkelanjutan. Kebijakan yang paling selaras adalah …",
    options: [
      "Zonasi koridor transit, manajemen parkir, KLB bertahap dengan kajian dampak lalu lintas",
      "Abaikan BRT karena perdagangan lebih penting",
      "Tingkatkan parkir on-street untuk PAD",
      "KLB tinggi di semua koridor tanpa kajian",
      "SPPN mobilitas hanya nasional, tidak ke RDTR",
    ],
    answer: 0,
    explain: "Integrasi transit–tata ruang: zonasi koridor, manajemen parkir, kajian Dampak Lalu Lintas; SPPN mobilitas diturunkan ke RDTR."
  }
];
