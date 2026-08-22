# Cek ulang kunci jawaban — Agustus 2026

Review faktual terhadap 470 soal (`scripts/parts/*` → `soal-bank.js`).

## Ringkasan

| Bank | Direview | Kunci salah (diperbaiki) | Clarifikasi teks | Catatan |
|------|----------|--------------------------|------------------|---------|
| Gap 1 | 100 | **G-E28** | — | Price floor → surplus |
| Gap 2 | 100 | 0 | — | ICOR/Giffen/Klassen OK |
| Gap 3 | 50 | 0 | — | OK |
| Pre Test | 40 | **PT-03**, **PT-39** | opsi C PT-39 | PT-03: analisis wilayah |
| Pre Test varian | 40 | 0 | explain PT-V39 | Selaras perbaikan PT-39 |
| Kasus | 40 | 0 | **K-T08**, **K-P01** | RTH publik 20% / total 30% |
| V1 | 60 | 0 | — | Lihat catatan di bawah |
| Simulasi | 40 | 0 | — | OK |

## Perbaikan kunci

| ID | Sebelum | Sesudah | Alasan |
|----|---------|---------|--------|
| **G-E28** | C — permintaan meningkat tanpa batas | **A** — surplus pasokan | Price floor di atas keseimbangan menciptakan surplus; explain sudah menyebut surplus |
| **PT-03** | A — perumusan rencana | **D** — analisis wilayah | Statistik, peta, citra, SIG = tahap analisis; varian PT-V03 sudah memisahkan tahap berikutnya |
| **PT-39** | C = “pernyataan pilihan tindakan” (justru ciri perencanaan) | C diganti **“hanya dokumentasi tanpa pilihan tindakan”** | Soal “kecuali” butuh pengecualian yang valid |

## Clarifikasi (kunci tetap, teks diperjelas)

- **K-T08 / K-P01**: UU 26/2007 membedakan RTH kota minimal **30%** (publik **20%** + privat **10%**). Stem/opsi/explain yang hanya menulis “RTH 20%” diperjelas agar tidak menyamakan publik dengan total.

## Catatan (tidak diubah kunci)

- **v1 #55** (unit RTH 2.500 m²): mengikuti materi pre-test/UKOM; Permen PU 05/2008 memakai standar berbeda per tipe taman — angka generik tetap dipertahankan agar konsisten dengan jebakan silang soal pulau kecil.
- **G-T03** (Bloom C2 vs C4 untuk “membedakan”): C2 tetap kunci terbaik di antara opsi yang ada.
- **K-T06 / K-P04** (sempadan sungai strategis nasional): penyederhanaan materi ujian; opsi lain lebih salah.

## Cara audit ulang

```bash
node scripts/audit-quality.mjs
node scripts/merge-bank.mjs
```
