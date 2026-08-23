# Latihan UKOM — Perencana Ahli Muda

Aplikasi latihan soal pilihan ganda (statis: `index.html` + `soal-bank.js`).

## Bank soal (244)

| Sumber | Jumlah |
|--------|--------|
| Pre Test + Varian | 40 + 40 |
| Pembahasan 2026 | 164 |

Sumber lama (v1, kasus, simulasi, gap) diarsipkan di `scripts/parts/archive/`.

## Regenerasi bank

```bash
node scripts/build-pembahasan2026.mjs   # dari PDF Pembahasan 2026
node scripts/merge-bank.mjs
```

Sumber aktif: `scripts/parts/pretest.js`, `scripts/parts/pembahasan2026.js`. Audit kualitas: `node scripts/audit-quality.mjs`.

## Deploy

Lihat `docs/DEPLOY.md` (Vercel / Netlify / GitHub Pages).

## Struktur

```
index.html          UI latihan/ujian
soal-bank.js        bank gabungan (hasil merge)
scripts/parts/      sumber soal aktif
scripts/parts/archive/  bank lama (tidak digabung)
scripts/merge-bank.mjs
scripts/audit-quality.mjs
docs/               panduan deploy & screening
scripts/archive/    skrip sekali-pakai (tidak dipakai runtime)
```
