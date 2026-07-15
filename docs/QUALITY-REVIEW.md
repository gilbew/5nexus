# Quality review — Juli 2026 (Approach C)

Audit: `node scripts/audit-quality.mjs` → `scripts/audit-quality-report.json`

## Kriteria
1. Jawaban benar tidak mencolok karena panjang opsi
2. Tidak ada theory-echo (token stem hanya di opsi benar)
3. Distraktor = miskonsepsi masuk akal, bukan fluff/meta
4. Stem jelas (satu pertanyaan)

## Hasil putaran ini
- Heuristic high: 270 → ~0
- Template fluff gap2/gap3 dibersihkan
- Perbaikan semantik: kunci terbalik, double-key, tautologi, ICOR, SOC Hirschman
- UI: statistik dikelompokkan, acak opsi A–E, sticky quiz bar, pintasan keyboard A–E, guard bank gagal load
- Struktur: `docs/`, `scripts/archive/`

## Catatan
Beberapa soal Bloom (mis. G2-T26) sengaja menyebut level C1–C6 di opsi — itu isi yang diuji, bukan fluff.