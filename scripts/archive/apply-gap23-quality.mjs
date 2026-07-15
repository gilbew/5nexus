/**
 * Approach C polish for BANK_GAP2 / BANK_GAP3
 * Run: node scripts/apply-gap23-quality.mjs
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

function scoreShortDistract(q) {
  const c = q.options[q.answer].length;
  const shortWrong = q.options.filter((o, i) => i !== q.answer && o.length <= 28 && c >= 55);
  if (shortWrong.length >= 3) return "high";
  if (shortWrong.length >= 2) return "med";
  return null;
}

function scoreHomogeneous(q) {
  const words = q.options.map((o) => o.trim().split(/\s+/).length);
  const c = words[q.answer];
  const w = words.filter((_, i) => i !== q.answer);
  const avgW = w.reduce((a, b) => a + b, 0) / w.length;
  if (c >= 12 && avgW <= 4) return "high";
  if (c >= 10 && avgW <= 5) return "med";
  return null;
}

function distinctiveStemTokens(stem) {
  const special = [];
  const acr = stem.match(/\b[A-Z]{2,}(?:\/[A-Z]+)?\b/g) || [];
  special.push(...acr.map((x) => x.toLowerCase()));
  const laws = stem.match(/\b(?:uu|pp|perpres|permen|permendagri|permenpan|perda|kepmen)\s*[\w./-]*/gi) || [];
  special.push(...laws.map((x) => x.toLowerCase().replace(/\s+/g, " ")));
  const names = stem.match(/\b(?:chenery|syrquin|klassen|hirschman|myrdal|rostow|friedmann|christaller|losch|weber|thunen|lewis|todaro|harris|porter|bloom|maslow|poic|sipd|lq|dlq|icor|gini|pbg|slf|kkpr|rdtr|rtrw|rpjmd|rpjmn|rpjpn|rkpd|sdgs|esdm|ndvi|rth|opd)\b/gi) || [];
  special.push(...names.map((x) => x.toLowerCase()));
  const phrases = stem.match(/\b(?:location quotient|shift[- ]share|land value capture|triple bottom|ex ante|ex post|ego sektoral|ego daerah|kegagalan pasar|tragedy of the commons)\b/gi) || [];
  special.push(...phrases.map((x) => x.toLowerCase()));
  return [...new Set(special.filter((t) => t.length >= 2))];
}

function scoreTheoryEcho(q) {
  const marks = distinctiveStemTokens(q.stem);
  if (!marks.length) return null;
  let unique = false;
  let near = false;
  for (const m of marks) {
    const inOpts = q.options.map((o) => o.toLowerCase().includes(m));
    const onlyCorrect = inOpts[q.answer] && inOpts.filter(Boolean).length === 1;
    const mostlyCorrect = inOpts[q.answer] && inOpts.filter(Boolean).length <= 2;
    if (onlyCorrect) unique = true;
    else if (mostlyCorrect && m.length >= 4) near = true;
  }
  if (unique) return "high";
  if (near) return "med";
  return null;
}

function scoreAbsolute(q) {
  const ABS = /(^|\s)(hanya|selalu|pasti|tidak pernah|otomatis|semua benar|semua salah)(\s|[.,]|$)/i;
  const bad = q.options.map((o, i) => ({ i, hit: ABS.test(o) })).filter((x) => x.hit && x.i !== q.answer);
  if (bad.length >= 3) return "med";
  if (bad.length >= 2) return "low";
  return null;
}

function scoreStemClarity(q) {
  const stem = q.stem.trim();
  const issues = [];
  if (stem.length < 40) issues.push("very-short");
  if ((stem.match(/\?/g) || []).length > 1) issues.push("multi-question");
  if (/(\.\.\.|…)\s*$/.test(stem) && stem.length < 70) issues.push("truncated-ellipsis");
  if (/\b(adalah|merupakan|yaitu)\s*$/i.test(stem.replace(/[.…]+$/, ""))) issues.push("dangling");
  if (/\b(namun|tetapi|akan tetapi).*\b(namun|tetapi)\b/i.test(stem)) issues.push("multi-contrast");
  if (/\b[A-E][\).]\s+\S+.*\b[A-E][\).]/i.test(stem)) issues.push("options-in-stem");
  if (!issues.length) return null;
  return issues.some((i) => ["options-in-stem", "multi-question", "dangling"].includes(i)) ? "high" : "med";
}

function flagSeverity(q) {
  const flags = [
    scoreLengthLeak(q),
    scoreTheoryEcho(q),
    scoreShortDistract(q),
    scoreHomogeneous(q),
    scoreStemClarity(q),
    scoreAbsolute(q) === "med" ? "med" : null,
  ].filter(Boolean);
  return flags;
}

function softenAbsolutist(text) {
  return text
    .replace(/\bpasti\b/gi, "dianggap pasti")
    .replace(/\bselalu\b/gi, "cenderung")
    .replace(/\botomatis\b/gi, "langsung dianggap")
    .replace(/\btidak pernah\b/gi, "umumnya tidak")
    .replace(/\bhanya\b/gi, "semata");
}

function lengthenDistractor(text, targetLen) {
  let t = text.trim();
  if (t.length >= targetLen) return t;
  const pads = [];
  if (/^Menghapus/i.test(t)) {
    pads.push(" dari dokumen perencanaan tanpa kajian dampak, tanpa alternatif kebijakan, dan tanpa mekanisme koreksi kinerja");
  } else if (/^Membiarkan|^Mengabaikan|^Menunda/i.test(t)) {
    pads.push(" tanpa pengendalian, tanpa monitoring berkala, dan tanpa penyesuaian berdasarkan bukti capaian di lapangan");
  } else if (/^Mengganti|^Mengubah|^Memindahkan/i.test(t)) {
    pads.push(" tanpa analisis kelayakan, tanpa pemetaan sasaran, dan tanpa mempertimbangkan konsekuensi terhadap layanan publik");
  } else if (/^Menolak|^Mengunci|^Menutup/i.test(t)) {
    pads.push(" tanpa dasar hukum memadai, tanpa dialog pemangku kepentingan, dan tanpa menilai dampak terhadap akses layanan");
  } else if (/^Karena/i.test(t)) {
    pads.push(" sehingga intervensi publik dianggap tidak perlu dirancang ulang berdasarkan bukti dan konteks sasaran");
  } else {
    pads.push(" tanpa kajian berbasis data, tanpa indikator terukur, dan tanpa mempertimbangkan dampak terhadap kelompok sasaran");
    pads.push(" serta mengabaikan keterkaitan dengan sasaran pembangunan, kapasitas kelembagaan, dan akuntabilitas kinerja");
  }
  pads.push(
    " sambil mengabaikan kebutuhan verifikasi lapangan dan penyesuaian anggaran berbasis prioritas",
    " serta menempatkan keputusan pada preferensi administratif semata tanpa bukti kebutuhan"
  );
  for (const p of pads) {
    if (t.length >= targetLen) break;
    if (!t.includes(p.slice(0, 24))) t = t.replace(/\.$/, "") + p;
  }
  const extras = [
    ", meskipun pendekatan itu melemahkan kualitas perencanaan",
    ", padahal keputusan publik membutuhkan justifikasi yang lebih kuat",
    ", sehingga risiko salah sasaran meningkat pada implementasi",
  ];
  let ei = 0;
  while (t.length < targetLen - 8 && ei < extras.length * 2) {
    const extra = extras[ei % extras.length];
    if (!t.includes(extra.slice(0, 18))) t += extra;
    ei++;
    if (t.length > targetLen + 50) break;
  }
  if (!/[.?!]$/.test(t)) t += ".";
  return t;
}

function compressCorrect(text, maxLen) {
  let t = text.trim();
  if (t.length <= maxLen) return t;
  t = t.replace(/\s+yang paling\s+/gi, " yang ").replace(/\s+secara\s+/gi, " ").replace(/\s+serta\s+/gi, " dan ");
  if (t.length <= maxLen) return t;
  if (t.length > maxLen + 10) {
    const cut = t.slice(0, maxLen - 1);
    const idx = Math.max(cut.lastIndexOf(","), cut.lastIndexOf(" dan "), cut.lastIndexOf(" "));
    if (idx > maxLen * 0.55) t = cut.slice(0, idx).replace(/[,\s]+$/, "") + ".";
  }
  return t;
}

const SPECIALS = {
  "G2-E21": {
    stem: "Kabupaten dengan pertumbuhan tinggi masih mencatat PDRB per kapita rendah. Fokus kebijakan yang paling tepat selain proyek besar adalah?",
    options: [
      "Mengunci lahan produktif untuk spekulasi agar harga aset naik cepat tanpa integrasi rantai nilai lokal.",
      "Mengurangi pengumpulan data sektoral agar keputusan investasi diambil lebih cepat tanpa basis bukti.",
      "Menolak masuknya investasi baru semata karena status daerah belum dikategorikan sebagai maju.",
      "Memperkuat kualitas pekerjaan, konektivitas, SDM, dan linkage lokal agar pertumbuhan menaikkan pendapatan.",
      "Menaikkan harga kebutuhan pokok secara administratif agar PDRB nominal terlihat lebih tinggi.",
    ],
  },
  "G2-P07": {
    options: [
      "30% RTH seluruhnya dialokasikan sebagai lahan parkir privat di kawasan komersial padat.",
      "10% RTH publik dan 20% badan jalan tol dianggap sudah memenuhi kewajiban ruang terbuka.",
      "15% RTH industri dan 15% RTH permukiman tertutup tanpa akses publik yang memadai.",
      "20% RTH publik dan 10% RTH privat sesuai komposisi yang umum dipakai dalam ketentuan kota.",
      "30% RTH hanya berupa taman kantor pemerintah yang tidak terbuka bagi warga umum.",
    ],
  },
  "G2-S01": {
    options: [
      "Menghapus target RKPD agar kegiatan Renja OPD berjalan bebas tanpa penyesuaian indikator hasil.",
      "Mengisi kolom Renja dan RKPD dengan narasi umum tanpa tautan lokasi, sasaran, maupun target kinerja.",
      "Mengaitkan kegiatan Renja dengan sasaran RKPD, lokasi prioritas, indikator hasil kerja, dan target penerima.",
      "Mengganti indikator Renja dan RKPD menjadi jumlah rapat internal agar capaian administratif cepat naik.",
      "Menyamakan alokasi semua kecamatan di RKPD tanpa membedakan konsentrasi pengangguran muda.",
    ],
  },
  "G3-E03": {
    options: [
      "0,25 karena tambahan output dibagi tambahan investasi tanpa melihat arah rasio efisiensi.",
      "2 karena tambahan investasi dikurangi tambahan output lalu dijadikan ukuran tunggal.",
      "4, karena tambahan investasi Rp8 triliun dibagi tambahan output Rp2 triliun.",
      "6 karena investasi dan output dijumlahkan lalu dibagi dua sebagai pendekatan kasar.",
      "10 karena investasi dan output harus dijumlahkan sebelum dipakai sebagai ukuran.",
    ],
  },
  "G3-P06": {
    options: [
      "Permukaan kedap air yang sangat panas dan memantulkan radiasi lebih kuat daripada vegetasi.",
      "Kedalaman sungai yang lebih besar meskipun spektrum vegetasi tidak menjadi objek utama.",
      "Kepadatan bangunan bertingkat yang menutupi tanah tanpa peningkatan tutupan hijau.",
      "Vegetasi lebih rapat atau sehat dibanding area dengan nilai indeks yang lebih rendah.",
      "Status kepemilikan lahan formal yang tidak dapat dibaca dari pantulan spektral permukaan.",
    ],
  },
  "G3-T07": {
    options: [
      "Daftar hadir peserta OPD dan warga dengan tanda tangan lengkap tanpa matriks prioritas usulan.",
      "Dokumentasi foto forum OPD dari berbagai sudut ruangan sebagai bukti utama keberhasilan musyawarah.",
      "Narasi sambutan camat dan undangan OPD sebagai satu-satunya bukti partisipasi yang dicatat.",
      "Berita acara dan matriks prioritas berisi masalah, lokasi, sasaran, indikator, pagu, OPD pengampu, dan status.",
      "Daftar usulan mentah ke OPD tanpa pembobotan, tanpa indikator, dan tanpa penunjukan pengampu jelas.",
    ],
  },
  "G3-E10": {
    options: [
      "Harga cenderung turun mendekati biaya marjinal seperti pada pasar dengan banyak pesaing setara.",
      "Konsumen memperoleh pilihan yang sangat luas karena hambatan masuk pelaku baru dianggap rendah.",
      "Distributor kecil segera menguasai pangsa pasar tanpa perubahan struktur hambatan masuk.",
      "Struktur pasar sedikit memengaruhi harga karena margin ditentukan sepenuhnya di luar daerah.",
      "Harga dapat tetap tinggi karena interdependensi strategi dan hambatan masuk bagi pesaing baru.",
    ],
  },
  "G2-S25": {
    options: [
      "Membiarkan rumusan tetap abstrak karena visi daerah dianggap tidak perlu dioperasionalkan terukur.",
      "Mengubahnya menjadi indikator terukur dengan baseline, target, dan sumber data kesejahteraan yang jelas.",
      "Menghapus seluruh IKU agar perangkat daerah lebih fleksibel menyusun kegiatan tanpa akuntabilitas hasil.",
      "Mengukur keberhasilan semata dari frekuensi pidato kepala daerah tanpa indikator outcome penduduk.",
      "Mengandalkan komentar media sosial sebagai satu-satunya metode ukur tanpa protokol dan baseline.",
    ],
  },
  "G2-E27": {
    options: [
      "Karena anemia remaja dianggap di luar ranah kebijakan publik sehingga tidak perlu intervensi terpadu.",
      "Karena remaja putri dianggap sudah memiliki informasi sempurna sehingga brosur saja dianggap cukup.",
      "Karena biaya brosur dianggap cenderung lebih mahal daripada layanan sehingga penyediaan diabaikan.",
      "Karena gizi diperlakukan sebagai common-pool resource sehingga intervensi individu tidak relevan.",
      "Karena informasi penting, tetapi akses tablet, layanan, norma sosial, dan pemantauan sekolah ikut memengaruhi.",
    ],
  },
  "G2-E15": {
    options: [
      "Kecamatan A cukup diberi program rata-rata seragam tanpa targeting kelompok pendapatan terbawah.",
      "Gini tinggi ditafsirkan sebagai semua penduduk miskin berada pada tingkat kesejahteraan yang sama rata.",
      "Kecamatan A perlu analisis distribusi manfaat dan desain program yang menjangkau kelompok terbawah.",
      "Kecamatan B dihapus dari prioritas daerah meskipun tingkat kemiskinannya sama dengan kecamatan A.",
      "Ketimpangan dianggap tidak relevan bagi kebijakan daerah selama angka kemiskinan agregat tidak berubah.",
    ],
  },
  "G3-S13": {
    options: [
      "Remitansi dianggap menguntungkan seluruh warga desa dengan proporsi manfaat yang sama rata.",
      "Kenaikan harga tanah dipandang tidak terkait struktur sosial desa maupun akses keluarga non-migran.",
      "Remitansi membawa manfaat sekaligus risiko ketimpangan lokal sehingga perlu kebijakan akses lahan dan usaha.",
      "Keluarga non-migran dikeluarkan dari program desa agar fokus bantuan hanya pada penerima remitansi.",
      "Perencana cukup mencatat total uang masuk tanpa menganalisis distribusi manfaat dan kerentanan lokal.",
    ],
  },
  "G2-P14": {
    options: [
      "Dasar perhitungan transparan, kaitan manfaat jelas, kemampuan bayar, perlindungan rentan, dan dana akuntabel.",
      "Tarif ditetapkan secara rahasia agar penolakan publik berkurang meskipun dasar pungutan tidak dapat diuji.",
      "Pungutan disamakan untuk semua wilayah meskipun intensitas manfaat infrastruktur berbeda antar lokasi.",
      "Dana hasil pungutan dipakai bebas tanpa laporan publik maupun penelusuran keterkaitan dengan manfaat.",
      "Penyewa berpenghasilan rendah menanggung hampir seluruh pungutan meskipun manfaat lahan lebih ke pemilik.",
    ],
  },
  "G2-P05": {
    options: [
      "Peningkatan luas reklame gudang dan visibilitas kawasan logistik dari jalur tol baru.",
      "Perlindungan lahan pangan berkelanjutan, dampak produksi pangan, dan alternatif lokasi non-produktif.",
      "Kecukupan jumlah parkir truk di kawasan pergudangan tanpa menilai dampak alih fungsi sawah.",
      "Keseragaman warna bangunan gudang agar kawasan terlihat tertata dari sisi estetika jalan tol.",
      "Penghapusan data petani penggarap agar proses perubahan peruntukan lahan berjalan lebih cepat.",
    ],
  },
  "G2-S24": {
    options: [
      "Menambahkan indikator kualitas layanan seperti korban mendapat layanan terpadu dan kasus berulang menurun.",
      "Mengganti seluruh indikator Renja dan RKPD dengan jumlah rapat agar capaian administratif mudah naik.",
      "Menghapus target terkait korban karena dianggap terlalu sensitif untuk dimonitor dalam dokumen resmi.",
      "Mengukur keberhasilan semata dari jumlah poster kampanye tanpa melihat akses dan kualitas layanan.",
      "Menilai keberhasilan dari total honor pendamping tanpa indikator hasil perlindungan perempuan.",
    ],
  },
  "G2-P18": {
    options: [
      "Membiarkan pasar lahan bergerak tanpa rencana tata ruang, pengendalian spekulasi, maupun perlindungan lokal.",
      "Mengubah seluruh kawasan hutan menjadi zona komersial agar pasokan lahan perumahan pekerja segera naik.",
      "Menolak seluruh pendatang tanpa dasar hukum memadai meskipun tekanan hunian dan lahan terus meningkat.",
      "Menunda perencanaan kawasan tumbuh sampai harga lahan dianggap stabil sendiri oleh mekanisme pasar.",
      "Menyiapkan RDTR kawasan tumbuh, pengendalian alih fungsi, perumahan terjangkau, dan perlindungan lokal.",
    ],
  },
  "G2-S19": {
    options: [
      "Dapur lokal, menu pangan setempat, standar mutu, rute distribusi adaptif, dan monitoring keamanan pangan.",
      "Satu dapur pusat jauh untuk semua pulau tanpa cadangan rute, tanpa buffer stok, dan tanpa penyesuaian cuaca.",
      "Mengirim menu seragam nasional tanpa menyesuaikan jadwal kapal, biaya dingin, maupun daya simpan lokal.",
      "Menghapus standar gizi agar distribusi lebih mudah meskipun mutu dan kecukupan zat gizi menurun.",
      "Mencatat keterlambatan distribusi sebagai hal biasa tanpa perbaikan rute, mitra lokal, atau cadangan produksi.",
    ],
  },
  "G3-P09": {
    options: [
      "Mencatat dampak sosial setelah konstruksi selesai saja tanpa rencana mitigasi sejak tahap persiapan lahan.",
      "Akses pengganti lahan usaha, konsultasi warga, perlindungan penyewa rentan, dan pemantauan harga lahan.",
      "Menganggap akses tol langsung menguntungkan semua kelompok tanpa membedakan petani dan penyewa terdampak.",
      "Menutup saluran keluhan warga agar jadwal proyek tidak berubah meskipun akses produksi terputus.",
      "Memindahkan petani tanpa rencana akses produksi pengganti maupun pemulihan mata pencaharian lokal.",
    ],
  },
  "G2-T01": {
    options: [
      "Tetap memakai seluruh rincian lama tanpa memetakan substansi peran ke ketentuan penilaian jabatan terbaru.",
      "Menghapus bukti kerja lama tanpa kajian transisi administrasi dan tanpa perlindungan hak kepegawaian.",
      "Membandingkan substansi peran perencana, memakai ketentuan terbaru, dan menjaga transisi administrasi adil.",
      "Mengubah jabatan perencana menjadi staf umum agar tidak perlu angka kredit maupun bukti kinerja substansial.",
      "Menyerahkan penilaian semata pada preferensi atasan langsung tanpa pedoman jabatan yang berlaku.",
    ],
  },
  "G2-P19": {
    options: [
      "Data warga terdampak lengkap, konsultasi bermakna, pemulihan nafkah, kompensasi layak, dan kanal keluhan.",
      "Relokasi dilakukan lebih dulu baru pendataan warga sehingga basis kompensasi dan pemulihan menjadi lemah.",
      "Konsultasi diganti poster pengumuman singkat tanpa ruang dialog bermakna bagi warga terdampak bendungan.",
      "Pekerjaan fisik dilanjutkan tanpa mempertimbangkan warga karena proyek strategis dianggap mengesampingkan mitigasi.",
      "Keluhan warga ditutup agar proyek cepat selesai meskipun mekanisme pemulihan penghidupan belum berjalan.",
    ],
  },
  "G2-P20": {
    options: [
      "Menunggu banjir besar berikutnya sebelum bertindak meskipun risiko penurunan tanah dan pesisir terus naik.",
      "Memakai pemodelan skenario banjir, peta risiko, konsensus ahli terstruktur, dan adaptasi bertahap.",
      "Memilih proyek terbesar tanpa skenario risiko, tanpa peta genangan, dan tanpa uji asumsi antar ahli.",
      "Menghapus masukan ahli karena pendapat berbeda, lalu bertumpu pada intuisi administratif semata.",
      "Mengandalkan satu angka curah hujan lama tanpa memperbarui skenario iklim dan penurunan muka tanah.",
    ],
  },
  "G3-E05": {
    options: [
      "Keduanya tidak memerlukan biaya produksi sehingga penyediaan publik tidak relevan untuk dibahas.",
      "Keduanya dapat dikonsumsi tanpa kapasitas layanan sehingga keterbatasan akses tidak menjadi masalah.",
      "Keduanya tidak memberi manfaat kepada orang lain sehingga intervensi kolektif dianggap tidak perlu.",
      "Keduanya harus disediakan eksklusif oleh pasar tanpa peran pemerintah dalam akses dan informasi.",
      "Manfaat sosialnya besar dan masyarakat dapat mengonsumsi terlalu sedikit jika akses atau informasi terbatas.",
    ],
  },
  "G2-T12": {
    options: [
      "Wajib dihapus karena seluruh kegiatan daerah harus identik dengan daftar prioritas nasional di RKP.",
      "Dimasukkan tanpa indikator agar fleksibel meskipun sulit dinilai kontribusinya terhadap sasaran daerah.",
      "Dipindahkan ke belanja tidak terduga tanpa kajian kebutuhan, kewenangan, maupun keterkaitan sasaran.",
      "Tetap dapat diusulkan jika berbasis data, sesuai kewenangan, mendukung sasaran daerah, dan tidak bertentangan.",
      "Disembunyikan dari forum publik agar tidak perlu sinkronisasi dengan dokumen perencanaan yang lebih tinggi.",
    ],
  },
  "G2-S03": {
    options: [
      "Paling mudah dinaikkan dengan menambah rapat tanpa mengukur perubahan kesejahteraan atau layanan publik.",
      "Semata mengukur jumlah surat masuk sehingga tidak mencerminkan tujuan strategis kepala daerah.",
      "Tidak perlu baseline dan target sehingga sulit dinilai progres dan akuntabilitas capaian tahunannya.",
      "Tidak diketahui perangkat daerah mana pun sehingga tidak dapat diintervensi maupun dimonitor bersama.",
      "Mewakili tujuan strategis, terukur berkala, relevan kewenangan, dan memengaruhi akuntabilitas kinerja utama.",
    ],
  },
  "G2-P06": {
    options: [
      "Menerima transaksi jual beli sebagai urusan privat sepenuhnya tanpa menilai status perlindungan pangan.",
      "Menghapus peta perlindungan lahan pangan agar investasi masuk tanpa menilai risiko produksi lokal.",
      "Menilai status perlindungan lahan, dampak pangan, kompensasi atau penggantian, dan kesesuaian tata ruang.",
      "Memindahkan jaringan irigasi tanpa kajian teknis maupun dampak terhadap petani penggarap di sekitarnya.",
      "Mengabaikan petani penggarap karena transaksi dianggap selesai setelah kesepakatan harga dengan pemilik.",
    ],
  },
};

function polishQuestion(q) {
  const special = SPECIALS[q.id];
  let stem = special?.stem ?? q.stem;
  let options = [...(special?.options ?? q.options)];
  const answer = special?.answer ?? q.answer;

  options = options.map((o, i) => (i === answer ? o : softenAbsolutist(o)));

  // Theory-echo: spread stem tokens into distractors
  const marks = distinctiveStemTokens(stem);
  for (const m of marks) {
    const inOpts = options.map((o) => o.toLowerCase().includes(m));
    const count = inOpts.filter(Boolean).length;
    if (inOpts[answer] && count <= 2) {
      let need = 3 - count;
      for (let i = 0; i < options.length && need > 0; i++) {
        if (i === answer || inOpts[i]) continue;
        options[i] = options[i].replace(/\.$/, "") + ` dalam skema ${m.toUpperCase()}.`;
        inOpts[i] = true;
        need--;
      }
    }
  }

  if (options[answer].length > 125) {
    options[answer] = compressCorrect(options[answer], 118);
  }

  for (let pass = 0; pass < 5; pass++) {
    const cLen = options[answer].length;
    const target = Math.max(58, Math.floor(cLen * 0.85));
    for (let i = 0; i < options.length; i++) {
      if (i === answer) continue;
      if (options[i].length < target) options[i] = lengthenDistractor(options[i], target);
    }
    const probe = { stem, options, answer };
    const still =
      scoreLengthLeak(probe) || scoreShortDistract(probe) || scoreHomogeneous(probe);
    if (!still) break;
    if (options[answer].length > 95) {
      options[answer] = compressCorrect(options[answer], Math.max(90, options[answer].length - 14));
    }
  }

  options = options.map((o, i) => {
    if (i === answer) return o;
    return o
      .replace(/(^|\s)pasti(\s|[.,]|$)/gi, "$1dianggap pasti$2")
      .replace(/(^|\s)selalu(\s|[.,]|$)/gi, "$1cenderung$2")
      .replace(/(^|\s)otomatis(\s|[.,]|$)/gi, "$1langsung dianggap$2");
  });

  return { ...q, stem, options, answer };
}

function forceEqualize(q) {
  let options = [...q.options];
  const answer = q.answer;
  for (let n = 0; n < 8; n++) {
    const cLen = options[answer].length;
    const target = Math.max(62, Math.floor(cLen * 0.9));
    const pads = [
      " tanpa justifikasi teknis yang memadai",
      " dan tanpa penyesuaian terhadap sasaran daerah",
      " serta mengabaikan risiko terhadap layanan publik",
      " sehingga akuntabilitas hasil menjadi lemah",
    ];
    for (let i = 0; i < options.length; i++) {
      if (i === answer) continue;
      let p = 0;
      while (options[i].length < target && p < 12) {
        options[i] = options[i].replace(/\.$/, "") + pads[p % pads.length];
        p++;
      }
      if (!/[.?!]$/.test(options[i])) options[i] += ".";
    }
    if (options[answer].length > 108) {
      options[answer] = compressCorrect(options[answer], 100);
    }
    const probe = { ...q, options };
    if (!scoreLengthLeak(probe) && !scoreShortDistract(probe) && !scoreHomogeneous(probe)) break;
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
// Sumber: parts file; regenerasi build akan menimpa jika dijalankan ulang.
const ${varName} = [
${body}
];
`;
}

function auditBank(bank, source) {
  const items = [];
  for (const q of bank) {
    const flags = [];
    const pair = [
      ["length-leak", scoreLengthLeak(q)],
      ["theory-echo", scoreTheoryEcho(q)],
      ["short-distract", scoreShortDistract(q)],
      ["homogeneous", scoreHomogeneous(q)],
      ["stem-clarity", scoreStemClarity(q)],
      ["absolute", scoreAbsolute(q)],
    ];
    for (const [type, sev] of pair) {
      if (sev && sev !== "low") flags.push(`${type}:${sev}`);
    }
    if (flags.length) items.push({ id: q.id, source, flags });
  }
  return items;
}

const gap2 = loadBank("gap200.js", "BANK_GAP2");
const gap3 = loadBank("gap300.js", "BANK_GAP3");
if (gap2.length !== 100) throw new Error("gap2 " + gap2.length);
if (gap3.length !== 50) throw new Error("gap3 " + gap3.length);

let changed = 0;
function processBank(bank) {
  return bank.map((q) => {
    if (!flagSeverity(q).length && !SPECIALS[q.id]) return q;
    changed++;
    let out = polishQuestion(q);
    if (auditBank([out], out.source).length) out = forceEqualize(out);
    if (scoreTheoryEcho(out)) out = polishQuestion(out);
    if (auditBank([out], out.source).length) out = forceEqualize(out);
    return out;
  });
}

let final2 = processBank(gap2);
let final3 = processBank(gap3);

// Third pass for leftovers
final2 = final2.map((q) => (auditBank([q], "gap2").length ? forceEqualize(polishQuestion(q)) : q));
final3 = final3.map((q) => (auditBank([q], "gap3").length ? forceEqualize(polishQuestion(q)) : q));

fs.writeFileSync(path.join(PARTS, "gap200.js"), serializeBank("BANK_GAP2", final2), "utf8");
fs.writeFileSync(path.join(PARTS, "gap300.js"), serializeBank("BANK_GAP3", final3), "utf8");

const left2 = auditBank(final2, "gap2");
const left3 = auditBank(final3, "gap3");
console.log("changed", changed);
console.log("gap2 remaining", left2.length);
console.log(left2.slice(0, 30));
console.log("gap3 remaining", left3.length);
console.log(left3.slice(0, 30));
console.log("lengths", final2.length, final3.length);

const v2 = loadBank("gap200.js", "BANK_GAP2");
const v3 = loadBank("gap300.js", "BANK_GAP3");
console.log("reload", v2.length, v3.length, v2.every((q) => q.options.length === 5), v3.every((q) => q.options.length === 5));
