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
  const n = q.options.filter((o, i) => i !== q.answer && o.length <= 28 && c >= 55).length;
  if (n >= 3) return "high";
  if (n >= 2) return "med";
  return null;
}
function scoreHomogeneous(q) {
  const words = q.options.map((o) => o.trim().split(/\s+/).length);
  const c = words[q.answer];
  const avgW = words.filter((_, i) => i !== q.answer).reduce((a, b) => a + b, 0) / 4;
  if (c >= 12 && avgW <= 4) return "high";
  if (c >= 10 && avgW <= 5) return "med";
  return null;
}
function distinctiveStemTokens(stem) {
  const special = [];
  for (const x of stem.match(/\b[A-Z]{2,}(?:\/[A-Z]+)?\b/g) || []) special.push(x.toLowerCase());
  for (const x of stem.match(/\b(?:uu|pp|perpres|permen|permendagri|permenpan|perda|kepmen)\s*[\w./-]*/gi) || [])
    special.push(x.toLowerCase().replace(/\s+/g, " "));
  for (const x of stem.match(/\b(?:chenery|syrquin|klassen|hirschman|myrdal|rostow|friedmann|christaller|losch|weber|thunen|lewis|todaro|harris|porter|bloom|maslow|poic|sipd|lq|dlq|icor|gini|pbg|slf|kkpr|rdtr|rtrw|rpjmd|rpjmn|rpjpn|rkpd|sdgs|esdm|ndvi|rth|opd)\b/gi) || [])
    special.push(x.toLowerCase());
  for (const x of stem.match(/\b(?:location quotient|shift[- ]share|land value capture|triple bottom|ex ante|ex post|ego sektoral|ego daerah|kegagalan pasar|tragedy of the commons)\b/gi) || [])
    special.push(x.toLowerCase());
  return [...new Set(special.filter((t) => t.length >= 2))];
}
function scoreTheoryEcho(q) {
  const marks = distinctiveStemTokens(q.stem);
  if (!marks.length) return null;
  let unique = false, near = false;
  for (const m of marks) {
    const inOpts = q.options.map((o) => o.toLowerCase().includes(m));
    if (inOpts[q.answer] && inOpts.filter(Boolean).length === 1) unique = true;
    else if (inOpts[q.answer] && inOpts.filter(Boolean).length <= 2 && m.length >= 4) near = true;
  }
  if (unique) return "high";
  if (near) return "med";
  return null;
}
function scoreAbsolute(q) {
  const ABS = /(^|\s)(hanya|selalu|pasti|tidak pernah|otomatis|semua benar|semua salah)(\s|[.,]|$)/i;
  const bad = q.options.filter((o, i) => i !== q.answer && ABS.test(o)).length;
  if (bad >= 3) return "med";
  if (bad >= 2) return "low";
  return null;
}
function scoreStemClarity(q) {
  const stem = q.stem.trim();
  const issues = [];
  if ((stem.match(/\?/g) || []).length > 1) issues.push("multi-question");
  if (/\b(namun|tetapi|akan tetapi).*\b(namun|tetapi)\b/i.test(stem)) issues.push("multi-contrast");
  if (/\b(adalah|merupakan|yaitu)\s*$/i.test(stem.replace(/[.…]+$/, ""))) issues.push("dangling");
  if (/\b[A-E][\).]\s+\S+.*\b[A-E][\).]/i.test(stem)) issues.push("options-in-stem");
  if (!issues.length) return null;
  return issues.some((i) => ["options-in-stem", "multi-question", "dangling"].includes(i)) ? "high" : "med";
}
function flagsOf(q) {
  return [
    ["length-leak", scoreLengthLeak(q)],
    ["theory-echo", scoreTheoryEcho(q)],
    ["short-distract", scoreShortDistract(q)],
    ["homogeneous", scoreHomogeneous(q)],
    ["stem-clarity", scoreStemClarity(q)],
    ["absolute", scoreAbsolute(q)],
  ].filter(([, s]) => s && s !== "low");
}
function soften(t) {
  return t
    .replace(/\bpasti\b/gi, "dianggap pasti")
    .replace(/\bselalu\b/gi, "cenderung")
    .replace(/\botomatis\b/gi, "langsung dianggap")
    .replace(/\btidak pernah\b/gi, "umumnya tidak")
    .replace(/\bhanya\b/gi, "semata");
}
function hash(s) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}
const TAILS = [
  "meskipun tidak menjawab akar persoalan yang diuji pada kasus ini",
  "padahal pendekatan itu menjauh dari prinsip perencanaan berbasis bukti",
  "sehingga risiko salah sasaran dan inefisiensi kebijakan meningkat",
  "tanpa menelaah dampak terhadap kelompok penerima manfaat utama",
  "dengan mengabaikan keterkaitan antar dokumen dan indikator kinerja",
  "meskipun bukti di lapangan menuntut penanganan yang lebih substansial",
  "sehingga keputusan terlihat cepat tetapi lemah secara analitis",
  "padahal opsi tersebut tidak sejalan dengan praktik perencanaan yang baik",
];
function trimTo(text, maxLen) {
  if (text.length <= maxLen) return text;
  const cut = text.slice(0, maxLen - 1);
  const idx = Math.max(cut.lastIndexOf(","), cut.lastIndexOf(" "), cut.lastIndexOf(";"));
  let t = (idx > maxLen * 0.5 ? cut.slice(0, idx) : cut).replace(/[,\s;]+$/, "");
  if (!/[.?!]$/.test(t)) t += ".";
  return t;
}
function shortenCorrect(text) {
  let t = text.trim();
  if (t.length <= 115) return t;
  const parts = t.split(/,\s+/);
  if (parts.length >= 3) {
    let acc = parts[0];
    for (let i = 1; i < parts.length; i++) {
      const next = acc + ", " + parts[i];
      if (next.length > 115) break;
      acc = next;
    }
    t = acc.replace(/[,\s]+$/, "");
    if (!/[.?!]$/.test(t)) t += ".";
    if (t.length >= 55) return t;
  }
  return trimTo(text, 115);
}
function expandDistractor(opt, q, targetLen, idx) {
  let base = soften(opt.trim().replace(/\.$/, ""));
  if (base.length >= Math.floor(targetLen * 0.92)) {
    return /[.?!]$/.test(base) ? base : base + ".";
  }
  const topic = (q.topic || q.cluster || "perencanaan").toLowerCase();
  const tail = TAILS[(hash(base + q.id) + idx) % TAILS.length];
  let t;
  if (/^(meng|mem|men|me|di)/i.test(base)) {
    t = base + " dalam penanganan isu " + topic + ", " + tail;
  } else if (/^karena/i.test(base)) {
    t = base + "; klaim ini menyederhanakan isu " + topic + ", " + tail;
  } else if (/^\d|^0,/.test(base)) {
    t = base + " sebagai perhitungan alternatif untuk " + topic + ", " + tail;
  } else {
    t = "Memilih fokus pada " + base + " untuk isu " + topic + ", " + tail;
  }
  const maxLen = Math.max(targetLen + 10, Math.floor(targetLen * 1.06));
  t = trimTo(t, maxLen);
  if (!/[.?!]$/.test(t)) t += ".";
  if (t.length < targetLen - 5) {
    const extra = TAILS[(hash(t) + 3) % TAILS.length];
    t = trimTo(t.replace(/\.$/, "") + ", " + extra, maxLen);
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
      "30% RTH semata berupa taman kantor pemerintah yang tidak terbuka bagi warga umum.",
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
      "Keluarga non-migran dikeluarkan dari program desa agar fokus bantuan pada penerima remitansi saja.",
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
      "Menganggap akses tol menguntungkan semua kelompok tanpa membedakan petani dan penyewa terdampak.",
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

function polish(q) {
  const sp = SPECIALS[q.id];
  let stem = sp && sp.stem ? sp.stem : q.stem;
  let options = [...(sp && sp.options ? sp.options : q.options)];
  const answer = sp && sp.answer != null ? sp.answer : q.answer;
  const originals = [...options];

  options[answer] = shortenCorrect(options[answer]);
  options = options.map((o, i) => (i === answer ? o : soften(o)));

  for (const m of distinctiveStemTokens(stem)) {
    const hits = options.map((o) => o.toLowerCase().includes(m));
    if (hits[answer] && hits.filter(Boolean).length <= 2) {
      let need = 3 - hits.filter(Boolean).length;
      for (let i = 0; i < options.length && need > 0; i++) {
        if (i === answer || hits[i]) continue;
        options[i] = options[i].replace(/\.$/, "") + (m.length <= 5 ? (" pada konteks " + m.toUpperCase() + ".") : (" dalam bacaan " + m + "."));
        need--;
      }
    }
  }

  const target = Math.max(60, Math.floor(options[answer].length * 0.88));
  for (let i = 0; i < options.length; i++) {
    if (i === answer) continue;
    options[i] = expandDistractor(options[i], Object.assign({}, q, { stem }), target, i);
  }

  let probe = { stem, options, answer };
  if (scoreLengthLeak(probe) || scoreShortDistract(probe) || scoreHomogeneous(probe)) {
    options[answer] = trimTo(options[answer], Math.min(100, Math.max(70, options[answer].length - 10)));
    const t2 = Math.max(58, Math.floor(options[answer].length * 0.9));
    for (let i = 0; i < options.length; i++) {
      if (i === answer) continue;
      options[i] = expandDistractor(originals[i], Object.assign({}, q, { stem }), t2, i);
    }
  }

  options = options.map((o, i) => (i === answer ? o : soften(o)));
  return Object.assign({}, q, { stem, options, answer });
}

function serializeBank(varName, bank) {
  const body = bank.map((q) => {
    const opts = q.options.map((o) => "      " + JSON.stringify(o) + ",").join("\n");
    return "  {\n    id: " + JSON.stringify(q.id) + ",\n    cluster: " + JSON.stringify(q.cluster) + ",\n    level: " + JSON.stringify(q.level) + ",\n    source: " + JSON.stringify(q.source) + ",\n    topic: " + JSON.stringify(q.topic) + ",\n    stem: " + JSON.stringify(q.stem) + ",\n    options: [\n" + opts + "\n    ],\n    answer: " + q.answer + ",\n    explain: " + JSON.stringify(q.explain) + ",\n    version: " + (q.version ?? 1) + "\n  }";
  }).join(",\n");
  return "// Bank soal gap UKOM Perencana Ahli Muda — dipoles kualitas (Approach C)\nconst " + varName + " = [\n" + body + "\n];\n";
}

const g2 = loadBank("gap200.js", "BANK_GAP2");
const g3 = loadBank("gap300.js", "BANK_GAP3");
if (g2.length !== 100 || g3.length !== 50) throw new Error("bad lengths");

let n = 0;
function run(bank) {
  return bank.map((q) => {
    if (!flagsOf(q).length && !SPECIALS[q.id]) return q;
    n++;
    return polish(q);
  });
}
let f2 = run(g2);
let f3 = run(g3);
f2 = f2.map((q) => (flagsOf(q).length ? polish(q) : q));
f3 = f3.map((q) => (flagsOf(q).length ? polish(q) : q));
f2 = f2.map((q) => (flagsOf(q).length ? polish(q) : q));
f3 = f3.map((q) => (flagsOf(q).length ? polish(q) : q));

fs.writeFileSync(path.join(PARTS, "gap200.js"), serializeBank("BANK_GAP2", f2), "utf8");
fs.writeFileSync(path.join(PARTS, "gap300.js"), serializeBank("BANK_GAP3", f3), "utf8");

const left2 = f2.flatMap((q) => flagsOf(q).map((f) => q.id + ":" + f[0] + ":" + f[1]));
const left3 = f3.flatMap((q) => flagsOf(q).map((f) => q.id + ":" + f[0] + ":" + f[1]));
console.log("polished", n);
console.log("left2", left2.length, left2.slice(0, 20));
console.log("left3", left3.length, left3.slice(0, 20));

const all = f2.concat(f3);
let formula = 0, trunc = 0, over = 0;
for (const q of all) {
  for (let i = 0; i < q.options.length; i++) {
    const o = q.options[i];
    if (/dalam penanganan isu /.test(o) || /Memilih fokus pada /.test(o)) formula++;
    if (i === q.answer && (/\bjika\.?$/i.test(o) || /\bdan\.?$/i.test(o) || /\byang\.?$/i.test(o))) trunc++;
    if (i !== q.answer && o.length > q.options[q.answer].length + 25) over++;
  }
}
console.log({ formula, trunc, over, len2: f2.length, len3: f3.length });
const s = f2.find((q) => q.id === "G2-T02");
console.log("--- G2-T02 ---");
s.options.forEach((o, i) => console.log((i === s.answer ? "*" : " ") + i, o.length, o));
const s2 = f2.find((q) => q.id === "G2-P05");
console.log("--- G2-P05 ---");
s2.options.forEach((o, i) => console.log((i === s2.answer ? "*" : " ") + i, o.length, o));
