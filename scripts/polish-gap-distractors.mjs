import fs from "fs";
const files = [
  ["c:/Users/gilbe/Desktop/latihan ukom/Latihan UKOM/scripts/build-gap100.mjs", [
    ["C1, karena peserta hanya mengingat nama indikator.", "C1, karena tugas terbatas pada mengingat daftar indikator tanpa memakai data kasus."],
    ["C2, karena peserta hanya menjelaskan definisi indikator tanpa menggunakan data.", "C2, karena tugas terbatas menjelaskan istilah tanpa menerapkan kriteria pada data."],
    ["C5, karena peserta hanya memberi penilaian etis tanpa prosedur.", "C5, karena tugas menilai normatif tanpa menerapkan kriteria pada data program."],
    ["C6, karena peserta harus menciptakan teori pembangunan baru.", "C6, karena tugas menuntut penelitian konseptual baru tanpa data kasus."],
    ["Barang private selalu harus disubsidi penuh.", "Barang private umumnya disediakan pasar tanpa subsidi penuh pemerintah."],
    ["Common goods selalu menghasilkan surplus produsen.", "Common resource rentan overuse meski sulit dikecualikan."],
    ["Monopoli alamiah tidak pernah butuh regulasi.", "Monopoli alamiah justru sering memerlukan regulasi tarif dan mutu layanan."],
    ["Tragedy of the commons karena pasti habis digunakan.", "Tragedy of the commons karena overuse sumber bersama tanpa aturan."],
    ["Izin lingkungan otomatis tanpa verifikasi tata ruang.", "Izin lingkungan tidak menggantikan persyaratan teknis bangunan dan KKPR."],
    ["Sertifikat tanah sebagai pengganti semua izin bangunan.", "Sertifikat tanah tidak menggantikan PBG atau kesesuaian tata ruang."],
  ]],
  ["c:/Users/gilbe/Desktop/latihan ukom/Latihan UKOM/scripts/build-gap200.mjs", [
    ["Tetap memakai seluruh rincian lama karena jabatan fungsional tidak pernah berubah.", "Tetap memakai seluruh rincian lama tanpa memetakan substansi ke ketentuan terbaru."],
    ["Menghapus semua bukti kerja sebelum 2020 karena otomatis tidak sah.", "Menghapus bukti kerja lama tanpa kajian transisi administrasi."],
    ["C1, karena hanya menghafal definisi transportasi.", "C1, karena tugas terbatas menghafal istilah tanpa evaluasi opsi."],
    ["C2, karena hanya menjelaskan arti emisi.", "C2, karena tugas terbatas menjelaskan konsep tanpa memilih opsi terbaik."],
    ["C3, karena hanya mengikuti prosedur tanpa pertimbangan nilai.", "C3, karena tugas menerapkan prosedur tanpa menilai kriteria kebijakan."],
    ["C6 karena pasti menciptakan kebijakan baru.", "C6 karena tugas menciptakan model baru tanpa menilai opsi yang ada."],
    ["Semua pertumbuhan otomatis berasal dari daya saing lokal daerah.", "Seluruh pertumbuhan sektor otomatis dianggap unggulan lokal tanpa analisis komponen."],
    ["Pariwisata tidak pernah dipengaruhi ekonomi provinsi.", "Pertumbuhan pariwisata tidak terkait tren provinsi sama sekali."],
    ["Semua pekerja informal harus dilarang.", "Pekerja informal harus segera dipindah ke sektor formal tanpa transisi."],
    ["PDRB otomatis cukup untuk mengukur semua dampak.", "PDRB saja dianggap cukup tanpa indikator kesejahteraan tenaga kerja."],
    ["Kedua kebijakan pasti selalu seimbang tanpa biaya.", "Kombinasi kebijakan harga dianggap bebas distorsi tanpa subsidi atau stok."],
    ["Semua UMKM otomatis merekrut lebih banyak pekerja.", "UMKM dianggap pasti menyerap tenaga kerja meski margin tertekan."],
    ["Pasti menurunkan Gini karena semua bantuan bernama UMKM.", "Program UMKM dianggap otomatis meratakan distribusi pendapatan."],
    ["Tidak perlu koreksi karena seleksi administratif selalu adil.", "Seleksi administratif dianggap netral tanpa verifikasi penerima rentan."],
    ["Isolasi dan powerlessness yang membuat rumah tangga miskin tidak otomatis mengakses program.", "Isolasi dan powerlessness yang menghambat rumah tangga miskin mengakses program."],
    ["Bahwa semua warga miskin punya akses informasi sama.", "Bahwa warga miskin memiliki akses informasi dan prosedur yang setara."],
    ["PBG otomatis menghapus semua aturan zonasi.", "PBG dianggap mengesampingkan ketentuan zonasi RDTR."],
    ["Target pasti terpenuhi sempurna karena total 30%.", "Target dianggap tercapai hanya karena angka agregat 30%."],
    ["RTH privat selalu menggantikan taman publik.", "RTH privat dianggap setara fungsi taman publik terbuka."],
    ["Buffer selalu lebih akurat dari survei akses.", "Buffer jarak lurus dianggap lebih andal daripada analisis akses lapangan."],
    ["Cakupan tinggi berarti semua masalah selesai.", "Cakupan spasial tinggi dianggap menutup masalah akses layanan."],
  ]],
];
for (const [path, reps] of files) {
  let b = fs.readFileSync(path);
  let s = b[1] === 0 ? b.toString("utf16le") : b.toString("utf8");
  for (const [a, b2] of reps) s = s.split(a).join(b2);
  fs.writeFileSync(path, s, "utf8");
  console.log("polished", path);
}