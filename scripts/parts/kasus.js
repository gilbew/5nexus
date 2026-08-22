// Bank soal kasus UKOM — dihasilkan build-kasus.js
// Diedit untuk quality polish (Approach C); rebuild boleh menimpa.
const BANK_KASUS = [
  {
    id: "K-T01",
    cluster: "teknis",
    level: "kasus",
    stem: "Kabupaten X sedang menyusun RPJMD 2025–2030. Tim perencanaan daerah diminta memastikan keselarasan dengan arah nasional dan kebijakan sektoral. Data menunjukkan prioritas nasional pada transformasi digital, ketahanan pangan, dan penurunan emisi. Bupati meminta agar indikator kinerja daerah tidak bertentangan dengan target dokumen perencanaan nasional. Dalam rapat koordinasi, muncul kebingungan antara dokumen perencanaan jangka panjang nasional, daerah, dan tahunan. Manakah urutan hierarki dan hubungan dokumen yang benar untuk dijadikan acuan penyusunan RPJMD?",
    options: [
      "RPJPN menjadi payung nasional, dijabarkan ke RPJMD daerah, lalu dirinci tahunan dalam RKPD setiap tahun anggaran",
      "RKPD disusun terlebih dahulu karena paling operasional, baru dipakai menyusun RPJMD dan RPJPN sesudahnya",
      "RPJMD ditetapkan lebih awal di daerah sehingga RPJPN dan RKPD nasional harus menyesuaikan arah daerah",
      "Renstra kementerian dan lembaga menjadi acuan utama RPJMD tanpa perlu merujuk balik ke RPJPN nasional",
      "Arah kebijakan pembangunan jangka panjang dianggap cukup tanpa perlu dokumen RPJPN tersendiri lagi"
    ],
    answer: 0,
    explain: "RPJPN (20 tahun) menjadi payung; RPJMD (5 tahun) menjabarkan di daerah; RKPD tahunan. Arah kebijakan nasional jangka panjang harus diturunkan bertahap, bukan digantikan.",
    version: 2
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
      "Evaluasi cukup dilakukan oleh BPK saat audit, bukan tim perencanaan daerah"
    ],
    answer: 0,
    explain: "Monitoring berkala + evaluasi (proses, output, outcome) wajib menganalisis konsistensi data dan hambatan sebelum rekomendasi perubahan RKPD/kebijakan.",
    version: 2
  },
  {
    id: "K-T03",
    cluster: "teknis",
    level: "kasus",
    stem: "Provinsi Z menyusun Renstra Perencanaan Pembangunan Daerah (Perpres 39/2023). Beberapa SKPD mengusulkan program yang sama dengan prioritas nasional tetapi tanpa sinkronisasi indikator. Perencana provinsi diminta memetakan keterkaitan program dengan dokumen jangka menengah daerah dan arah kebijakan nasional. Dalam workshop, muncul pertanyaan tentang perbedaan renstra pembangunan dengan renstra teknis kementerian. Manakah pendekatan yang tepat untuk menghindari duplikasi dan misalignment?",
    options: [
      "Petakan program dan indikator renstra pembangunan daerah terhadap sasaran jangka menengah, lalu koordinasikan lintas satuan kerja",
      "Setiap satuan kerja menyusun rencana strategisnya sendiri tanpa konsolidasi karena otonomi daerah dijamin penuh",
      "Dokumen renstra pembangunan menjadi tanggung jawab badan perencanaan; satuan kerja cukup menyusun rencana kerja tahunan",
      "Program prioritas nasional langsung dijadikan program daerah tanpa penyesuaian indikator dan target lokal",
      "Renstra teknis kementerian dan lembaga sudah memadai sehingga daerah tidak perlu menyusun renstra pembangunan sendiri"
    ],
    answer: 0,
    explain: "Renstra Perencanaan Pembangunan Daerah memetakan program pembangunan daerah ke RPJMD/arah kebijakan nasional; konsolidasi lintas perangkat mencegah duplikasi.",
    version: 3
  },
  {
    id: "K-T04",
    cluster: "teknis",
    level: "kasus",
    stem: "Kabupaten A akan mengubah RTRW karena rencana kawasan industri baru. Masyarakat memprotes karena zonasi pertanian produktif berubah menjadi kawasan industri. Perencana diminta menjelaskan tahapan yang wajib dilalui agar perubahan RTRW sah secara prosedural dan substantif. Data menunjukkan kawasan industri masuk dalam rencana pembangunan nasional terkait hilirisasi. Tahapan manakah yang benar untuk perubahan RTRW dengan mempertimbangkan partisipasi publik?",
    options: [
      "Lakukan evaluasi RTRW berkala, kajian perubahan, revisi, harmonisasi, sosialisasi publik, baru penetapan resmi",
      "Perubahan RTRW dapat langsung ditetapkan lewat surat keputusan bupati karena mendukung rencana investasi baru",
      "Revisi rencana detail saja sudah cukup dilakukan tanpa mengubah RTRW karena prosesnya dianggap lebih singkat",
      "Perubahan RTRW hanya memerlukan persetujuan dewan perwakilan daerah tanpa melalui tahap evaluasi awal",
      "Dokumen RTRW yang telah ditetapkan tidak dapat diubah lagi meskipun ada perkembangan rencana pembangunan baru"
    ],
    answer: 0,
    explain: "PP 21/2021 mengatur evaluasi berkala, kajian perubahan, harmonisasi, partisipasi, dan penetapan RTRW. Revisi rencana detail tidak menggantikan perubahan RTRW.",
    version: 2
  },
  {
    id: "K-T05",
    cluster: "teknis",
    level: "kasus",
    stem: "Kota B sedang mengintegrasikan rencana tata ruang umum dengan rencana detail dan rencana kawasan strategis. Investor meminta kepastian izin lokasi untuk lahan komersial di zona yang pada rencana umum masih pertanian. Perencana menemukan ketidaksesuaian antara peta rencana detail (zona campuran) dan ketentuan perlindungan lahan pertanian pangan. Dalam rapat, disebutkan bahwa 30% lahan lindung nasional harus dijaga secara agregat. Pendekatan manakah yang paling tepat untuk rekomendasi perizinan berbasis tata ruang?",
    options: [
      "Periksa kesesuaian rencana tata ruang, status lahan pangan, dan aturan kawasan lindung sebelum izin lokasi diterbitkan",
      "Izin lokasi dapat langsung diterbitkan karena zona campuran pada rencana detail mengizinkan kegiatan komersial",
      "Ketentuan luasan lindung nasional berlaku merata di setiap bidang tanah milik investor tanpa pengecualian apa pun",
      "Aturan perlindungan lahan pertanian tidak relevan lagi ketika ada rencana investasi berskala strategis nasional",
      "Dokumen perencanaan pembangunan nasional otomatis mengubah rencana tata ruang tanpa melalui prosedur perubahan resmi"
    ],
    answer: 0,
    explain: "Izin lokasi wajib sesuai rencana tata ruang dan regulasi sektoral (pertanian, lindung). Perlindungan lahan pangan tetap berlaku; 30% lindung nasional bersifat agregat, bukan per bidang tanah.",
    version: 2
  },
  {
    id: "K-T06",
    cluster: "teknis",
    level: "kasus",
    stem: "Desa C berbatasan dengan sungai strategis nasional. Usulan pembangunan permukiman di sempadan sungai ditolak camat, tetapi pengurus desa menunjuk Perda setempat yang mengizinkan jarak 50 m. Perencana kabupaten membawa PP 21/2021 dan Perpres 87/2023 tentang sempadan. Terdapat juga rencana normalisasi sungai dari dinas PU. Berapa jarak sempadan minimum yang seharusnya menjadi acuan perencana desa untuk sungai strategis nasional?",
    options: [
      "Seratus meter dari tepi sungai karena tergolong sungai strategis nasional sesuai ketentuan yang berlaku",
      "Lima puluh meter sesuai peraturan desa karena dianggap lebih memahami kondisi lapangan setempat",
      "Dua puluh lima meter sudah memadai selama tersedia tanggul penahan banjir di sepanjang bantaran",
      "Sempadan tidak perlu diberlakukan karena warga telah menempati kawasan tersebut sejak lama",
      "Lima puluh meter berlaku untuk semua sungai tanpa membedakan klasifikasi dan tingkat kestrategisannya"
    ],
    answer: 0,
    explain: "Trap umum: sungai strategis nasional sempadan 100 m (PP 21/2021). 50 m berlaku untuk kategori tertentu, bukan menggantikan 100 m pada sungai strategis nasional.",
    version: 2
  },
  {
    id: "K-T07",
    cluster: "teknis",
    level: "kasus",
    stem: "Kabupaten D menetapkan kepadatan bangunan 40 di pusat kota dalam rencana detail tata ruang, sementara infrastruktur drainase dan jalan hanya mampu melayani kepadatan efektif 25. Pengembang mengajukan izin apartemen 12 lantai dengan garis sempadan 2,8. Tim perencanaan diminta menilai kebijakan kepadatan dan dampaknya. Data sistem informasi menunjukkan peningkatan kemacetan 18% dalam dua tahun terakhir. Rekomendasi kebijakan tata ruang manakah yang paling tepat diambil?",
    options: [
      "Meninjau ulang angka kepadatan melalui kajian daya dukung infrastruktur dan analisis dampak lalu lintas",
      "Menetapkan kepadatan setinggi mungkin agar pendapatan daerah meningkat tanpa kajian infrastruktur pendukung",
      "Mengizinkan garis sempadan bangunan tinggi selama tersedia area parkir bawah tanah yang luas",
      "Menyerahkan penentuan kepadatan kepada permintaan pasar dan preferensi pengembang semata",
      "Menurunkan kepadatan menjadi nol di seluruh pusat kota tanpa melalui kajian teknis apa pun"
    ],
    answer: 0,
    explain: "Kepadatan pada rencana detail harus selaras daya dukung–daya tampung. Kajian infrastruktur dan dampak lalu lintas menjadi dasar revisi kebijakan zonasi/kepadatan.",
    version: 2
  },
  {
    id: "K-T08",
    cluster: "teknis",
    level: "kasus",
    stem: "Kota E merencanakan RTH publik 15% menurut UU 26/2007, tetapi realisasi di peta hanya 9%. Sebagian lahan RTH direncanakan alih fungsi menjadi pasar modern. Komunitas menuntut penegakan RTH minimal 20% menurut Perda kota. Perencana diminta harmonisasi norma. Dalam rapat, juga dibahas insentif developer untuk menyediakan RTH di dalam kavling. Manakah penafsiran yang benar terkait besaran RTH?",
    options: [
      "Ketentuan nasional mensyaratkan RTH publik minimal 20% luas kota (dari total RTH minimal 30%), dijabarkan lokasinya secara bertahap",
      "Angka RTH publik lima belas persen sudah cukup karena batas dua puluh persen bersifat rekomendasi semata",
      "Target RTH publik daerah dua puluh persen menggantikan aturan nasional sehingga capaian sembilan persen dapat diterima",
      "Kewajiban penyediaan ruang terbuka hijau dapat diganti dengan sumbangan dana kepada pemerintah kota",
      "Ruang terbuka hijau diwajibkan di kawasan permukiman baru, sedangkan pusat kota lama dikecualikan"
    ],
    answer: 0,
    // UU 26/2007: RTH kota min. 30% = publik 20% + privat 10%
    explain: "UU 26/2007: RTH kota minimal 30% (publik 20% + privat 10%). Target RTH publik 15% di bawah standar; Perda tidak boleh mengurangi minimum nasional, dan alih fungsi RTH melalui perubahan tata ruang.",
    version: 4
  },
  {
    id: "K-T09",
    cluster: "teknis",
    level: "kasus",
    stem: "Provinsi F melakukan sinkronisasi RKPD 2026 dengan Musrenbang. Beberapa usulan kecamatan sama-sama mengajukan jalan desa, padahal prioritas dokumen jangka menengah adalah ketahanan pangan. Bappeda provinsi meminta perencana menilai usulan dengan kriteria prioritas nasional, provinsi, dan kemampuan fiskal. Data menunjukkan belanja pegawai 62%. Prinsip perencanaan manakah yang harus diterapkan dalam memprioritaskan usulan?",
    options: [
      "Menilai kesesuaian dengan rencana jangka menengah, urgensi, dampak, ketersediaan anggaran, dan kemampuan pelaksanaan",
      "Usulan dengan dukungan massa terbanyak akan otomatis dimasukkan ke dalam rencana kerja tanpa kajian lain",
      "Semua usulan jalan desa dimasukkan agar terlihat adil bagi setiap kecamatan yang mengajukan",
      "Prioritas nasional dapat diabaikan apabila terdapat lobi kuat dari anggota dewan perwakilan daerah",
      "Rencana kerja tahunan tidak perlu diselaraskan dengan rencana jangka menengah karena sifatnya tahunan"
    ],
    answer: 0,
    explain: "RKPD harus selaras RPJMD dan arah kebijakan nasional; prioritisasi mempertimbangkan urgensi, dampak, fiscal space, bukan votek politik semata.",
    version: 2
  },
  {
    id: "K-T10",
    cluster: "teknis",
    level: "kasus",
    stem: "Kabupaten G menyusun laporan akhir RPJMD dan akan memulai RPJMD baru. Evaluasi menunjukkan program penurunan stunting berhasil, tetapi emisi GRK meningkat karena industri kecil. Perencana diminta mengintegrasikan agenda iklim ke dokumen perencanaan berikutnya sesuai arah kebijakan nasional. Kepala daerah meminta indikator yang terukur dan bisa dimonitor tiap semester. Komponen monitoring dan evaluasi manakah yang paling relevan untuk RPJMD berikutnya?",
    options: [
      "Indikator kinerja utama, baseline emisi, target penurunan, dan mekanisme evaluasi setiap tahun",
      "Laporan keuangan yang dipantau karena anggaran dianggap paling mudah untuk diukur secara berkala",
      "Pemantauan cukup dilakukan pada akhir periode tanpa indikator antara sepanjang pelaksanaan",
      "Agenda perubahan iklim tidak perlu dimasukkan karena sudah tercantum dalam dokumen nasional",
      "Evaluasi dilaksanakan ketika terdapat pemeriksaan dari badan pengawas keuangan saja"
    ],
    answer: 0,
    explain: "Dokumen perencanaan nasional dan RPJMD perlu indikator iklim terukur; M&E berkala (semester/tahun) dengan baseline dan evaluasi proses–capaian.",
    version: 3
  },
  {
    id: "K-E01",
    cluster: "ekonomi",
    level: "kasus",
    stem: "Data BPS menunjukkan pertumbuhan PDB kota H 5,2% (yoy), sementara GNI per kapita naik 3,8%. Warga mengeluhkan harga pangan dan sewa naik lebih cepat. Inflasi kota 4,1% dan inflasi pangan 6,5%. Tim ekonomi daerah diminta menjelaskan perbedaan konsep dan implikasi kebijakan. Bupati ingin argumen yang tepat untuk intervensi pasar pangan. Pernyataan manakah yang paling akurat?",
    options: [
      "Produksi domestik, pendapatan nasional bruto, dan inflasi adalah tiga indikator berbeda yang dapat bergerak tidak searah",
      "Peningkatan produksi domestik berarti kesejahteraan seluruh warga ikut naik dalam proporsi yang sama",
      "Pendapatan nasional bruto sebenarnya sama saja dengan produksi domestik, hanya berbeda penyebutan istilah",
      "Kenaikan harga pangan tidak perlu diperhatikan selama produksi domestik tetap tumbuh tinggi",
      "Tingkat inflasi empat koma satu persen berarti seluruh jenis barang naik dengan persentase yang identik"
    ],
    answer: 0,
    explain: "PDB (produksi), GNI (pendapatan penduduk termasuk transfer luar), inflasi (indeks harga) adalah indikator berbeda; pertumbuhan PDB tidak selalu berarti daya beli naik.",
    version: 2
  },
  {
    id: "K-E02",
    cluster: "ekonomi",
    level: "kasus",
    stem: "Provinsi I menganalisis struktur ekonomi dengan LQ. Sektor pertanian LQ 1,8; sektor logistik LQ 0,9; sektor pariwisata LQ 1,4. Pemerintah ingin memperkuat sektor unggulan dan menutup ketergantungan impor pangan. Perencana diminta menafsirkan LQ dan merumuskan arah kebijakan. Interpretasi dan rekomendasi manakah yang paling tepat?",
    options: [
      "Sektor pertanian dan pariwisata tergolong unggulan karena nilai LQ di atas satu, sedangkan logistik masih perlu dikembangkan",
      "Hanya sektor dengan nilai LQ paling tinggi yang diperhatikan, sektor lainnya diabaikan begitu saja",
      "Nilai LQ di bawah satu pada sektor logistik berarti sektor tersebut harus segera dihentikan",
      "Perhitungan LQ dianggap tidak relevan lagi untuk keperluan perencanaan pembangunan daerah",
      "Semua sektor dengan nilai LQ di atas satu harus dialihkan menjadi sektor industri berat"
    ],
    answer: 0,
    explain: "LQ>1: spesialisasi/keunggulan komparatif; LQ<1: belum unggul. Kebijakan memperkuat unggulan sambil mengembangkan sektor strategis yang masih lemah.",
    version: 2
  },
  {
    id: "K-E03",
    cluster: "ekonomi",
    level: "kasus",
    stem: "Kabupaten J menghitung DLQ untuk industri pengolahan kayu: DLQ turun dari 1,3 ke 0,95 dalam lima tahun. Ekspor kayu olahan meningkat, tetapi lapangan kerja hanya naik 2%. Dinas perindag meminta penjelasan apakah daya saing meningkat atau struktur melemah. Data menunjukkan investasi mesin pengeringan baru. Kesimpulan ekonomi regional manakah yang paling tepat?",
    options: [
      "Keunggulan spesialisasi daerah melemah sehingga perlu dianalisis produktivitas, rantai nilai, dan dampak tenaga kerja",
      "Penurunan nilai spesialisasi berarti kegiatan industri tersebut sebaiknya segera dihentikan seluruhnya",
      "Nilai spesialisasi di atas satu dapat dipastikan akan menciptakan banyak lapangan kerja baru",
      "Peningkatan volume ekspor dapat dipastikan turut mendorong naiknya nilai spesialisasi daerah",
      "Pengukuran pergeseran spesialisasi dianggap sama dengan pengukuran keunggulan komparatif biasa"
    ],
    answer: 0,
    explain: "DLQ mengukur pergeseran spesialisasi antarwaktu; turun ke <1 berarti keunggulan relatif melemah—analisis lanjut produktivitas dan employment diperlukan.",
    version: 2
  },
  {
    id: "K-E04",
    cluster: "ekonomi",
    level: "kasus",
    stem: "Kota K melakukan simulasi kebijakan harga beras. Permintaan lokal elastisitas −0,6; subsidi 20% menurunkan harga 10%; stok impor terbatas. Tim ekonomi diminta memperkirakan dampak kuantitas yang diminta dan implikasi fiskal. Jika harga beras turun 10%, berapa perkiraan perubahan kuantitas yang diminta (ceteris paribus)?",
    options: [
      "Kuantitas yang diminta diperkirakan naik sekitar enam persen mengikuti nilai elastisitas permintaan",
      "Kuantitas yang diminta naik sepuluh persen karena mengikuti persentase penurunan harga secara langsung",
      "Kuantitas yang diminta tidak berubah sama sekali karena beras tergolong kebutuhan pokok masyarakat",
      "Kuantitas yang diminta justru turun karena subsidi dianggap menurunkan kualitas beras yang dijual",
      "Kuantitas yang diminta naik dua puluh persen karena nilai elastisitas dianggap sebesar dua koma nol"
    ],
    answer: 0,
    explain: "ΔQ% = elastisitas × ΔP% = −0,6 × (−10%) = +6%. Permintaan inelastis (<1) tetapi tetap bereaksi searah harga.",
    version: 2
  },
  {
    id: "K-E05",
    cluster: "ekonomi",
    level: "kasus",
    stem: "Provinsi L: ICOR rencana 5,2. Estimasi kebutuhan investasi untuk tumbuh 4,5% memakai ICOR aktual sementara 6,0 (lebih tinggi dari rencana). Beberapa proyek jalan mangkrak menahan penyerapan. Apa makna perbandingan ICOR aktual vs rencana bagi kebijakan investasi?",
    options: [
      "ICOR aktual lebih tinggi menandakan investasi relatif kurang efisien; perlu tinjau kualitas proyek dan hambatan penyerapan",
      "ICOR aktual lebih tinggi cenderung dibaca sebagai tanda pertumbuhan daerah sudah melampaui rencana",
      "ICOR kurang relevan untuk daerah karena lebih sering dikaitkan dengan perhitungan PDB nasional",
      "Proyek mangkrak tidak memengaruhi efisiensi investasi selama pagu anggaran tetap tersedia",
      "ICOR aktual lebih tinggi berarti setiap unit output membutuhkan lebih sedikit investasi"
    ],
    answer: 0,
    explain: "ICOR = investasi yang dibutuhkan per unit tambahan output. ICOR lebih tinggi = efisiensi relatif lebih rendah dibanding rencana; tinjau kualitas proyek dan hambatan penyerapan. Sebaliknya, ICOR aktual lebih rendah dari rencana menandakan efisiensi relatif membaik.",
    version: 5
  },
  {
    id: "K-E06",
    cluster: "ekonomi",
    level: "kasus",
    stem: "Data makro kota M: pengangguran 6,8%, inflasi 3,2%, pertumbuhan 5,1%. Kurva Phillips jangka pendek menunjukkan trade-off. Pemerintah kota ingin menekan pengangguran dengan stimulus belanja infrastruktur tanpa memicu inflasi tinggi. Perencana ekonomi memberikan catatan kebijakan. Pernyataan manakah yang paling tepat menggambarkan kondisi tersebut?",
    options: [
      "Stimulus dapat menekan pengangguran dalam jangka pendek, namun berisiko menaikkan inflasi jika permintaan memanas",
      "Hubungan pengangguran dan inflasi dipastikan membuat inflasi turun setiap kali pengangguran naik",
      "Stimulus belanja infrastruktur dipastikan tidak memengaruhi tingkat inflasi sama sekali",
      "Tingkat pengangguran enam koma delapan persen berarti inflasi harus berada di angka yang sama",
      "Hubungan timbal balik pengangguran dan inflasi dianggap hilang permanen di semua rentang waktu"
    ],
    answer: 0,
    explain: "Kurva Phillips: trade-off jangka pendek antara pengangguran dan inflasi; stimulus aggregate demand berisiko inflasi jika kapasitas terbatas.",
    version: 2
  },
  {
    id: "K-E07",
    cluster: "ekonomi",
    level: "kasus",
    stem: "Kabupaten N menghitung Gini 0,36 (turun dari 0,39). Namun desa pesisir masih miskin ekstrem 12% sementara kota pusat makmur. Program BLT dan UMKM ditargetkan ulang. Perencana diminta menjelaskan arti Gini dan kebutuhan analisis tambahan. Kepala daerah bertanya apakah Gini saja cukup untuk menilai pemerataan. Jawaban analitis manakah yang paling tepat?",
    options: [
      "Ketimpangan membaik secara agregat, namun tetap diperlukan pemetaan kemiskinan spasial untuk penargetan program",
      "Penurunan angka ketimpangan berarti seluruh desa telah mencapai tingkat kesejahteraan yang setara",
      "Ukuran ketimpangan pendapatan dianggap tidak relevan lagi untuk perencanaan tingkat kabupaten",
      "Nilai koefisien ketimpangan tiga puluh enam persen berarti tidak ada lagi warga yang miskin",
      "Program bantuan langsung dapat dilanjutkan tanpa perlu tambahan data kemiskinan spasial"
    ],
    answer: 0,
    explain: "Gini mengukur ketimpangan distribusi pendapatan agregat; tetap butuh analisis spasial/kemiskinan ekstrem untuk program targeted.",
    version: 2
  },
  {
    id: "K-E08",
    cluster: "ekonomi",
    level: "kasus",
    stem: "Kota O menaikkan UMK 12%. Asosiasi pedagang khawatir penurunan lapangan kerja formal; serikat pekerja menduga daya beli naik. Data elastisitas permintaan tenaga kerja −0,4 terhadap upah. Biaya tenaga kerja naik ±8% untuk sektor formal kecil. Ceteris paribus, berapa perkiraan dampaknya terhadap jumlah tenaga kerja formal?",
    options: [
      "Jumlah tenaga kerja formal diperkirakan turun sekitar tiga koma dua persen mengikuti nilai elastisitas",
      "Jumlah tenaga kerja formal diperkirakan naik dua belas persen karena kenaikan upah minimum",
      "Jumlah tenaga kerja formal tidak akan berubah sama sekali karena kenaikan upah bersifat wajib",
      "Jumlah tenaga kerja formal turun dua belas persen karena banyak pedagang memilih menutup usahanya",
      "Jumlah tenaga kerja formal naik delapan persen karena produktivitas dianggap otomatis meningkat"
    ],
    answer: 0,
    explain: "Elastisitas tenaga kerja −0,4: kenaikan biaya upah 8% → permintaan tenaga kerja turun ~3,2%; dampak riil bergantung struktur usaha.",
    version: 2
  },
  {
    id: "K-E09",
    cluster: "ekonomi",
    level: "kasus",
    stem: "Provinsi P menyusun proyeksi PDB lima tahun. Model input-output menunjukkan multiplier sektor pariwisata 1,7 dan sektor pertanian 1,3. Anggaran terbatas sehingga tim harus memilih antara festival pariwisata dan pembangunan irigasi pertanian. Tim diminta memilih berdasarkan dampak ekonomi dan ketahanan pangan sesuai arah kebijakan nasional. Pertimbangan kebijakan manakah yang paling seimbang?",
    options: [
      "Mengombinasikan irigasi untuk ketahanan pangan dengan pariwisata terukur, menggunakan analisis multiplier sebagai dasar prioritas",
      "Memilih festival pariwisata saja karena nilai multiplier ekonominya tercatat paling tinggi",
      "Memilih irigasi pertanian saja karena arah kebijakan nasional dianggap mengabaikan sektor pariwisata",
      "Mengabaikan hasil analisis multiplier karena dianggap tidak relevan bagi penyusunan rencana daerah",
      "Mengandalkan tren historis saja tanpa perlu menyusun proyeksi ekonomi lima tahun ke depan"
    ],
    answer: 0,
    explain: "Multiplier input-output membantu membandingkan dampak ekonomi; kebijakan perlu selaras arah kebijakan nasional (pangan) dan potensi unggulan (pariwisata), bukan ekstrem tunggal.",
    version: 2
  },
  {
    id: "K-E10",
    cluster: "ekonomi",
    level: "kasus",
    stem: "Kabupaten Q: harga cabai melonjak 80% karena panen gagal. Permintaan cabai elastisitas −1,2. Pemerintah mempertimbangkan operasi pasar dan impor terbatas. Tanpa intervensi, konsumsi diperkirakan turun kuat. Jika harga diturunkan 20% melalui operasi pasar, berapa perkiraan perubahan kuantitas yang terjadi?",
    options: [
      "Kuantitas yang diminta diperkirakan naik sekitar dua puluh empat persen mengikuti nilai elastisitas permintaan",
      "Kuantitas yang diminta naik dua puluh persen karena mengikuti besaran penurunan harga secara langsung",
      "Kuantitas yang diminta tidak berubah sama sekali karena cabai tergolong kebutuhan pokok masyarakat",
      "Kuantitas yang diminta justru turun karena operasi pasar dianggap menurunkan kualitas cabai yang dijual",
      "Kuantitas yang diminta naik delapan puluh persen mengikuti lonjakan harga yang terjadi sebelumnya"
    ],
    answer: 0,
    explain: "Elastisitas >1 (elastis): ΔQ% = 1,2 × 20% = 24% naik jika harga turun 20%; operasi pasar cocok untuk komoditas elastis saat shock supply.",
    version: 2
  },
  {
    id: "K-S01",
    cluster: "sosial",
    level: "kasus",
    stem: "Desa R akan mengembangkan homestay wisata bahari. Tim kajian partisipatif menemukan akses air bersih 40% rumah, remaja putus sekolah 15%, dan perempuan belum terlibat dalam musdes. Perencana sosial diminta merumuskan intervensi berbasis partisipasi. Kepala desa ingin cepat bangun dermaga tanpa forum. Langkah perencanaan sosial manakah yang paling tepat?",
    options: [
      "Memfasilitasi musyawarah inklusif perempuan dan remaja, lalu mengintegrasikan hasilnya ke rencana kerja desa",
      "Langsung membangun dermaga terlebih dahulu karena kegiatan wisata dianggap akan menghasilkan pendapatan asli desa",
      "Kajian partisipatif cukup dilakukan sekali di awal proyek tanpa pemantauan sosial berkelanjutan",
      "Proses partisipasi masyarakat ditunda hingga seluruh pembangunan fisik proyek selesai dilaksanakan",
      "Kajian sosial tambahan tidak diperlukan lagi karena penilaian partisipatif awal sudah dilakukan"
    ],
    answer: 0,
    explain: "Kajian partisipatif + inklusi (perempuan, remaja) → rencana aksi sosial → integrasi RKPD. Infrastruktur tanpa kesepakatan sosial berisiko konflik.",
    version: 2
  },
  {
    id: "K-S02",
    cluster: "sosial",
    level: "kasus",
    stem: "Kota S: IPM 76,2; rata-rata lama sekolah 8,1 tahun; harapan sekolah 12,4; pengeluaran per kapita mendekati threshold. Program prioritas: beasiswa pendidikan menengah dan posyandu lansia. Perencana diminta memilih intervensi yang paling mempengaruhi komponen IPM. Data menunjukkan putus sekolah usia 15–18 tertinggi di dua kecamatan. Intervensi manakah yang paling tepat diterapkan?",
    options: [
      "Memberikan beasiswa dan menjamin akses pendidikan menengah atas di kecamatan yang rawan putus sekolah",
      "Menjalankan program kesehatan lanjut usia karena capaiannya dianggap lebih mudah diukur di lapangan",
      "Menganggap indeks pembangunan manusia ditentukan pengeluaran, sehingga aspek pendidikan diabaikan",
      "Membangun pusat perbelanjaan besar untuk mendongkrak angka pengeluaran per kapita penduduk",
      "Mengganti indikator pembangunan manusia dengan angka kemiskinan sebagai ukuran utama kesejahteraan"
    ],
    answer: 0,
    explain: "IPM = f(Umur Hidup, Pendidikan, Pengeluaran). Putus sekolah menengah langsung menekan rata-rata & harapan sekolah—intervensi pendidikan paling relevan.",
    version: 3
  },
  {
    id: "K-S03",
    cluster: "sosial",
    level: "kasus",
    stem: "Kabupaten T menurunkan kemiskinan 2,1 poin, tetapi Gini naik 0,02. Warga miskin perkotaan mengeluhkan kenaikan sewa. Program PKH dan PIP masih berjalan; data lapangan menunjukkan akses transportasi ke pusat layanan buruk. Bupati meminta evaluasi sosial terintegrasi. Kesimpulan kebijakan sosial manakah yang paling tepat?",
    options: [
      "Kemiskinan turun, tetapi ketimpangan dan tekanan sewa kota masih perlu diintervensi lewat akses layanan",
      "Fokuskan anggaran hanya pada penurunan angka kemiskinan karena Gini dianggap indikator sekunder",
      "Naikkan semua nilai bantuan secara merata tanpa membedakan profil kemiskinan kota dan desa",
      "Hentikan PKH/PIP sementara karena kenaikan Gini menunjukkan bantuan tunai tidak efektif",
      "Alihkan seluruh program sosial ke desa dan tangguhkan intervensi kemiskinan perkotaan"
    ],
    answer: 0,
    explain: "Kemiskinan dan ketimpangan bisa bergerak berbeda; perlu evaluasi dampak distribusi, akses layanan, dan intervensi perkotaan.",
    version: 3
  },
  {
    id: "K-S04",
    cluster: "sosial",
    level: "kasus",
    stem: "Kecamatan U: indeks partisipasi perempuan dalam perencanaan desa 22%. Proyek drainase direncanakan tanpa konsultasi gender. Lurah meminta perencana menambahkan analisis gender dan rencana aksi. Data menunjukkan beban kerja perempuan meningkat saat musim banjir. Pendekatan manakah yang paling sesuai prinsip perencanaan sosial inklusif?",
    options: [
      "Analisis gender + forum perempuan + indikator partisipasi + desain drainase yang meringankan beban RT",
      "Bangun drainase dulu; analisis gender dilakukan setelah konstruksi selesai",
      "Cukup catat kehadiran perempuan di musdes tanpa mengubah desain teknis drainase",
      "Serahkan isu gender ke organisasi perempuan, tanpa mengubah dokumen rencana desa",
      "Naikkan target indeks partisipasi di laporan, tanpa mekanisme monitoring di lapangan"
    ],
    answer: 0,
    explain: "Perencanaan sosial inklusif: analisis gender, partisipasi substantif, indikator monitorable, desain proyek yang adil gender.",
    version: 3
  },
  {
    id: "K-S05",
    cluster: "sosial",
    level: "kasus",
    stem: "Desa V: 35% rumah tangga penerima bantuan tunai, 18% usaha mikro terganggu banjir. Tim kajian sosial merekomendasikan diversifikasi mata pencaharian dan pelatihan kepesertaan jaminan sosial bagi buruh harian. Anggaran desa terbatas Rp 800 juta. Prioritas rencana kerja desa manakah yang paling tepat?",
    options: [
      "Menyusun program ketahanan sosial ekonomi: pelatihan kerja, asuransi, dan mitigasi banjir terpadu",
      "Menambah jumlah bantuan tunai tanpa program produktif karena dianggap paling cepat untuk dilaksanakan",
      "Membangun infrastruktur jalan saja karena hasilnya lebih terlihat secara fisik oleh warga",
      "Menunda seluruh program hingga tersedia dana tanggung jawab sosial dari perusahaan swasta",
      "Menghapus kajian sosial partisipatif demi efisiensi anggaran pelaksanaan program desa"
    ],
    answer: 0,
    explain: "Kajian partisipatif mengarahkan intervensi produktif + proteksi sosial; integrasi mitigasi banjir dan peningkatan mata pencaharian lebih berkelanjutan daripada bantuan tunai saja.",
    version: 2
  },
  {
    id: "K-S06",
    cluster: "sosial",
    level: "kasus",
    stem: "Kota W meluncurkan layanan digital administrasi kependudukan. Lansia 60+ kesulitan akses; digital divide tinggi di lima kelurahan. Perencana sosial mengusulkan pendamping lokal dan pos layanan terpadu. Kepala dinas meminta indikator keberhasilan sosial, bukan hanya jumlah download aplikasi. Indikator manakah yang paling tepat digunakan?",
    options: [
      "Proporsi lanjut usia yang terlayani dengan pendamping, kecepatan waktu layanan, dan tingkat kepuasan atas layanan inklusif",
      "Jumlah unduhan aplikasi dan jumlah pengikut media sosial milik dinas terkait",
      "Banyaknya perangkat telepon pintar yang telah dibagikan kepada warga lanjut usia",
      "Indikator teknologi informasi saja karena digitalisasi dianggap sebagai tujuan akhir program",
      "Tidak perlu indikator sosial tambahan karena aplikasi layanan sudah resmi diluncurkan"
    ],
    answer: 0,
    explain: "Evaluasi sosial: akses inklusif kelompok rentan, kualitas layanan, kepuasan—bukan metrik teknologi semata.",
    version: 2
  },
  {
    id: "K-S07",
    cluster: "sosial",
    level: "kasus",
    stem: "Kabupaten X: stunting 28%, sanitasi 52%, akses air 61%. Program integrasi: pemberian makanan tambahan, sanitasi komunal, dan penyuluhan gizi. Setelah 2 tahun, stunting 24%, tetapi sanitasi 54%. Camat meminta penjelasan mengapa capaian tidak seimbang. Perencana sosial kesehatan diminta evaluasi. Penjelasan evaluatif manakah yang paling tepat?",
    options: [
      "Stunting dipengaruhi banyak faktor sehingga sanitasi butuh waktu lebih lama; evaluasi proses perlu diperbaiki",
      "Program dinyatakan gagal total karena capaian sanitasi belum mencapai seratus persen dalam dua tahun",
      "Penurunan angka stunting seharusnya membuat seluruh indikator lain ikut menurun bersamaan",
      "Indikator keberhasilan program diganti hanya dengan jumlah pemberian makanan tambahan",
      "Seluruh program dihentikan karena hasil antarindikator tidak tercapai secara bersamaan"
    ],
    answer: 0,
    explain: "Stunting ditentukan gizi, sanitasi, air, ASI; capaian berbeda per indikator normal—evaluasi proses dan perpanjangan intervensi sanitasi.",
    version: 2
  },
  {
    id: "K-S08",
    cluster: "sosial",
    level: "kasus",
    stem: "Provinsi Y: migrasi tenaga kerja remaja ke kota besar meningkat. Data lapangan: remaja putus sekolah 19%, akses bursa kerja lokal terbatas. RPJMD memuat program vokasi dan link and match industri. Perusahaan menawarkan magang tetapi tanpa kesepakatan formal dengan sekolah. Rencana aksi sosial ekonomi manakah yang paling tepat?",
    options: [
      "Menyelenggarakan vokasi terhubung kesepakatan formal industri, bursa kerja lokal, dan pemantauan data remaja",
      "Melarang migrasi tenaga kerja remaja ke kota besar melalui peraturan daerah yang baru",
      "Menjalankan program magang tanpa kurikulum vokasi karena dianggap lebih cepat dilaksanakan",
      "Memberikan bantuan tiket pulang saja sebagai satu-satunya bentuk intervensi program",
      "Menganggap pemantauan data remaja tidak diperlukan lagi karena program vokasi sudah berjalan"
    ],
    answer: 0,
    explain: "Intervensi berkelanjutan: pendidikan vokasi + penghubung industri + monitoring data remaja; larangan migrasi tidak efektif.",
    version: 2
  },
  {
    id: "K-P01",
    cluster: "spasial",
    level: "kasus",
    stem: "Kabupaten Z meninjau ruang terbuka hijau: peta menunjukkan 17% RTH, tetapi lapangan hanya 11% yang benar-benar terawat. Sebagian area yang ditandai RTH pada peta zonasi justru berstatus sengketa lahan. Ketentuan nasional mensyaratkan RTH publik minimal 20% (dari total RTH kota minimal 30%). Perda daerah menetapkan insentif bagi pengembang untuk menyediakan 10% area kavling sebagai ruang terbuka. Perencana diminta merumuskan strategi pencapaian RTH yang substantif. Strategi manakah yang paling tepat diterapkan?",
    options: [
      "Melakukan inventarisasi RTH riil, penegasan status lahan, penertiban area sengketa, serta penambahan RTH melalui rencana detail dan kavling pengembang",
      "Cukup memperbarui peta zonasi tanpa disertai penataan kondisi sebenarnya di lapangan",
      "Menganggap kewajiban sepuluh persen dari kavling pengembang sudah menggantikan target dua puluh persen kota",
      "Menganggap capaian tujuh belas persen pada peta sudah memenuhi ketentuan nasional yang berlaku",
      "Menunda seluruh upaya pencapaian target RTH hingga akhir periode rencana pembangunan daerah"
    ],
    answer: 0,
    explain: "RTH substantif ≠ zoning semata; UU 26: total RTH kota min. 30% (publik 20% + privat 10%); kombinasi penataan, penegakan, dan penambahan RTH fisik.",
    version: 3
  },
  {
    id: "K-P02",
    cluster: "spasial",
    level: "kasus",
    stem: "Kota AA: RDTR zona perkantoran KDB 60%, KLB 5. Lahan 1 ha; rencana menara 30 lantai. Warga sekitar khawatir bayangan dan ventilasi. Perencana diminta hitung intensitas dan alternatif yang memenuhi kepadatan. Luas bangunan maksimum ≈ 1 ha × KLB 5 = 5 ha = 50.000 m². Jika luas lantai standar 1.500 m², perkiraan lantai efektif ≈ 33 lantai sebelum faktor teknis. Rekomendasi perencanaan manakah yang paling tepat?",
    options: [
      "Mengkaji kesesuaian intensitas bangunan dengan infrastruktur dan dampak lingkungan sekitarnya",
      "Menyetujui rencana tiga puluh lantai karena pengembang menjanjikan tambahan pendapatan daerah yang besar",
      "Menganggap batas luas dasar bangunan berarti sisa lahannya boleh sepenuhnya tidak dihijaukan",
      "Menganggap batas luas lantai bangunan tidak berlaku untuk kawasan perkantoran",
      "Membiarkan ketinggian bangunan bebas ditentukan tanpa mengacu pada rencana detail tata ruang"
    ],
    answer: 0,
    explain: "KDB/KLB membatasi intensitas; analisis dampak dan infrastruktur wajib—bukan sekadar memaksimalkan lantai tanpa kajian.",
    version: 2
  },
  {
    id: "K-P03",
    cluster: "spasial",
    level: "kasus",
    stem: "Desa BB di tepi pantai: usulan tambak 50 ha di kawasan mangrove. Rencana pembangunan nasional mencatat hilirisasi perikanan, tetapi juga ketahanan ekosistem pesisir. Kementerian terkait melarang konversi mangrove; masyarakat menuntut lapangan kerja. Perencana kabupaten diminta menyeimbangkan arah kebijakan nasional, perlindungan lahan, dan ekonomi lokal. Rekomendasi tata ruang pesisir manakah yang paling tepat?",
    options: [
      "Menolak konversi kawasan mangrove dan mengembangkan budidaya ramah lingkungan di lahan terdegradasi non-mangrove",
      "Menyetujui pembukaan tambak lima puluh hektare karena arah kebijakan nasional mendukung sektor perikanan",
      "Menganggap konversi mangrove hingga tiga puluh persen masih diperbolehkan berdasarkan ketentuan lindung nasional",
      "Menerbitkan izin tambak tanpa kajian lingkungan karena kondisi ekonomi desa tergolong kurang mampu",
      "Menganggap arah kebijakan pembangunan nasional tidak berlaku bagi kawasan setingkat desa"
    ],
    answer: 0,
    explain: "Mangrove dilindungi; arah kebijakan pesisir mencakup hilirisasi sekaligus ekosistem. Alternatif budidaya di lahan bukan mangrove atau intensifikasi ramah lingkungan.",
    version: 2
  },
  {
    id: "K-P04",
    cluster: "spasial",
    level: "kasus",
    stem: "Kota CC: sungai kota klasifikasi bukan strategis nasional. Camat mengutip sempadan 50 m; warga membangun di 40 m dari tepi. Perencana membawa PP 21/2021 dan menunjukkan klasifikasi sungai. Banjir tahun lalu merendam 120 rumah di 55 m dari tepi. Tindakan penataan manakah yang paling tepat?",
    options: [
      "Menerapkan sempadan sesuai klasifikasi sungai, mempertimbangkan relokasi berisiko, dan normalisasi terukur",
      "Menerapkan jarak seratus meter untuk semua sungai termasuk anak sungai berukuran kecil sekalipun",
      "Menganggap ketentuan jarak sempadan tidak berlaku karena banjir hanya terjadi secara musiman",
      "Membiarkan permukiman tetap berdiri karena warga sudah lama menempati dan menolak dipindahkan",
      "Menyerahkan penentuan jarak sempadan kepada camat tanpa merujuk peraturan yang berlaku"
    ],
    answer: 0,
    explain: "Trap: 100 m untuk sungai strategis nasional; 50 m untuk kategori lain sesuai PP 21. Klasifikasi sungai menentukan jarak—bukan seragam 100 m semua.",
    version: 2
  },
  {
    id: "K-P05",
    cluster: "spasial",
    level: "kasus",
    stem: "Kabupaten DD: investor meminta izin lokasi di lahan pertanian pangan untuk kawasan logistik. Rencana detail masih zona pertanian. UU 26/2007 melarang alih fungsi lahan pangan kecuali dengan mekanisme ketat. Bupati menekan agar cepat untuk PAD. Perencana diminta langkah prosedural. Langkah manakah yang benar?",
    options: [
      "Mengkaji status lahan pangan, mengubah rencana tata ruang melalui prosedur resmi, mengkaji ketersediaan pangan, baru mempertimbangkan izin lokasi",
      "Menerbitkan izin lokasi secara langsung karena kawasan logistik dianggap bersifat strategis nasional",
      "Menganggap ketentuan perlindungan lahan pangan tidak berlaku untuk kegiatan logistik",
      "Menganggap kewajiban lindung nasional sebesar tiga puluh persen sudah cukup mewakili perlindungan lahan pangan",
      "Mengabaikan zonasi pertanian pada rencana detail karena adanya tawaran investasi baru"
    ],
    answer: 0,
    explain: "Lahan pangan dilindungi UU 26; alih fungsi butuh perubahan tata ruang & kajian pangan. Izin lokasi tidak boleh melanggar rencana detail/RTRW.",
    version: 2
  },
  {
    id: "K-P06",
    cluster: "spasial",
    level: "kasus",
    stem: "Kota EE: peta RDTR skala 1:5000; rencana teknis kawasan skala 1:1000 untuk blok pusat. Terdapat selisih batas sungai 8 m antara peta. Proyek jembatan menggunakan RDTR; warga menunjuk rencana teknis kawasan. Perencana diminta harmonisasi. Prinsip manakah yang benar?",
    options: [
      "Rencana teknis berketelitian tinggi diselaraskan dengan rencana di atasnya lewat verifikasi lapangan",
      "Rencana detail tata ruang dianggap selalu menggantikan rencana teknis karena cakupannya lebih luas",
      "Memilih peta yang paling menguntungkan bagi kepentingan investor proyek pembangunan",
      "Mengabaikan selisih delapan meter tersebut karena dianggap tidak signifikan bagi proyek",
      "Menganggap rencana teknis tidak perlu diselaraskan dengan rencana detail tata ruang di atasnya"
    ],
    answer: 0,
    explain: "Hierarki: RTRW → RDTR → rencana teknis; detail site plan harus harmon dengan RDTR setelah verifikasi lapangan.",
    version: 2
  },
  {
    id: "K-P07",
    cluster: "spasial",
    level: "kasus",
    stem: "Provinsi FF: koridor energi terbarukan sesuai arah kebijakan nasional melintasi dua kabupaten. Lahan status hutan produksi terbatas sesuai UU 26. Pengembang PLTS meminta izin di kawasan tersebut. Perencana provinsi diminta penafsiran status lahan dan tata ruang. Kementerian terkait meminta kajian dampak lingkungan. Pendekatan izin manakah yang tepat?",
    options: [
      "Memeriksa status kawasan hutan, kesesuaian tata ruang provinsi-kabupaten, dan kajian dampak lingkungan",
      "Menerbitkan izin pembangkit energi terbarukan secara otomatis karena tergolong energi ramah lingkungan bagi daerah",
      "Menganggap status kawasan hutan produksi dapat dialihfungsikan seperti lahan industri pada umumnya",
      "Menganggap kajian dampak lingkungan tidak diperlukan untuk pembangkit listrik berskala menengah",
      "Menganggap arah kebijakan pembangunan nasional menggantikan ketentuan perlindungan kawasan hutan"
    ],
    answer: 0,
    explain: "Kawasan hutan punya aturan khusus; proyek strategis nasional tetap melalui kesesuaian tata ruang, perlindungan lahan, dan kajian dampak lingkungan.",
    version: 2
  },
  {
    id: "K-P08",
    cluster: "spasial",
    level: "kasus",
    stem: "Kota GG: kawasan permukiman padat di lereng 25–30°. Longsor 2024 menewaskan 4 jiwa. Rencana detail masih mengizinkan KDB 70%. Perencana diminta mitigasi berbasis tata ruang. Data kearifan lokal: rumah panggung tradisional lebih aman. Kebijakan spasial manakah yang paling tepat?",
    options: [
      "Merevisi rencana detail: batasi luas dasar bangunan, zona larangan bangun, peta bahaya, relokasi, rumah panggung",
      "Mempertahankan batas luas dasar bangunan tujuh puluh persen dengan menambah pagar beton penahan tinggi",
      "Menganggap mitigasi bencana hanya menjadi tanggung jawab badan penanggulangan bencana, bukan tata ruang",
      "Menganggap kejadian longsor tidak memengaruhi ketentuan zonasi kawasan yang berlaku",
      "Membatalkan rencana relokasi karena warga setempat menolak untuk dipindahkan"
    ],
    answer: 0,
    explain: "Mitigasi bencana integratif: peta bahaya, zonasi, kepadatan, standar bangunan, relokasi—bukan hanya respons badan penanggulangan bencana.",
    version: 2
  },
  {
    id: "K-P09",
    cluster: "spasial",
    level: "kasus",
    stem: "Kabupaten HH: jalan nasional direncanakan membelah hutan lindung 12 ha. UU 26 melarang konversi lindung kecuali kasus ketat. Kementerian PU mengusulkan jalan tol. Masyarakat adat menolak. Perencana diminta alternatif alignment. Opsi perencanaan manakah yang paling tepat?",
    options: [
      "Mengkaji jalur alternatif di luar kawasan lindung, melakukan kajian lingkungan, dan menyiapkan mekanisme perlindungan bila tidak ada alternatif lain",
      "Menyetujui langsung pembangunan karena jalan nasional dianggap sebagai proyek prioritas",
      "Menganggap luas dua belas hektare terlalu kecil sehingga ketentuan lindung tidak perlu diberlakukan",
      "Menganggap kewajiban lindung nasional sebesar tiga puluh persen mengizinkan pengambilan area lokal tersebut",
      "Menganggap pembangunan jalan tol tidak memerlukan izin kesesuaian tata ruang"
    ],
    answer: 0,
    explain: "Trap: 30% lindung nasional agregat, bukan izin konversi sembarang; hutan lindung dilindungi—alternatif alignment prioritas.",
    version: 2
  },
  {
    id: "K-P10",
    cluster: "spasial",
    level: "kasus",
    stem: "Kota II: revitalisasi kawasan cagar budaya. Investor ingin hotel 15 lantai di buffer zone. RDTR buffer KDB 40%, tinggi maks 12 m. Tim budaya menolak; Dinas pariwisata mendukung hotel. Perencana diminta keputusan berbasis PP 21 dan perlindungan cagar. Keputusan tata ruang manakah yang paling tepat?",
    options: [
      "Mematuhi ketentuan zona penyangga kawasan cagar budaya sesuai rencana detail, dan mendesain hotel agar menyesuaikan ketentuan yang berlaku",
      "Mengizinkan hotel lima belas lantai karena dianggap memberikan dampak positif bagi pendapatan daerah",
      "Menganggap ketentuan zona penyangga tidak mengikat apabila terdapat investasi yang cukup besar",
      "Menganggap kegiatan revitalisasi berarti bangunan baru boleh dibangun bebas tanpa batas ketinggian",
      "Menganggap kawasan cagar budaya hanya menjadi urusan museum, bukan rencana detail tata ruang"
    ],
    answer: 0,
    explain: "Kawasan cagar + buffer diatur RDTR/PP 21; revitalisasi harus menjaga nilai budaya, bukan intensifikasi melanggar ketentuan.",
    version: 2
  },
  {
    id: "K-P11",
    cluster: "spasial",
    level: "kasus",
    stem: "Desa JJ: permukiman di pesisir 100 m dari garis pantai. Badan geografi mencatat abrasi 3 m/tahun. Arah kebijakan pesisir menekankan adaptasi iklim. Usulan tanggul beton dibandingkan dengan zonasi mundur dan vegetasi mangrove. Perencana diminta kombinasi teknis dan tata ruang. Paket intervensi manakah yang paling tepat?",
    options: [
      "Menetapkan sempadan pesisir, menanam mangrove, zonasi mundur bertahap, dan infrastruktur pelindung terukur",
      "Membangun tanggul beton saja tanpa disertai penetapan zonasi kawasan pesisir yang jelas",
      "Membangun permukiman padat di kawasan seratus meter karena sudah ada permukiman sebelumnya",
      "Mengabaikan laju abrasi tiga meter per tahun karena dianggap masih tergolong kecil",
      "Menganggap arah kebijakan pembangunan pesisir tidak berlaku pada wilayah setingkat desa"
    ],
    answer: 0,
    explain: "Adaptasi pesisir: kombinasi vegetasi, infrastruktur, zonasi mundur/sempadan, bukan hard structure semata.",
    version: 2
  },
  {
    id: "K-P12",
    cluster: "spasial",
    level: "kasus",
    stem: "Kota KK: integrasi transportasi publik BRT dengan rencana detail tata ruang. Koridor BRT melintasi zona perdagangan dengan batas lantai bangunan tinggi. Parkir on-street 40% ruas. Evaluasi menunjukkan kecepatan BRT turun 35%. Perencana diminta kebijakan zonasi dan manajemen parkir. Target arah kebijakan nasional adalah mobilitas berkelanjutan. Kebijakan manakah yang paling selaras?",
    options: [
      "Menetapkan zonasi koridor transit, mengelola parkir di badan jalan, dan menaikkan batas lantai bangunan secara bertahap disertai kajian dampak lalu lintas",
      "Mengabaikan keberadaan bus rapid transit karena kegiatan perdagangan dianggap lebih penting",
      "Menambah kapasitas parkir di badan jalan demi meningkatkan pendapatan asli daerah",
      "Menaikkan batas lantai bangunan di seluruh koridor tanpa disertai kajian dampak lalu lintas",
      "Menganggap arah kebijakan mobilitas berkelanjutan hanya berlaku nasional, tidak diturunkan ke rencana detail"
    ],
    answer: 0,
    explain: "Integrasi transit–tata ruang: zonasi koridor, manajemen parkir, kajian dampak lalu lintas; arah kebijakan mobilitas nasional diturunkan ke rencana detail.",
    version: 2
  }
]
