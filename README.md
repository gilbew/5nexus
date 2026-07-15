# Latihan UKOM — Perencana Ahli Muda

Aplikasi latihan soal pilihan ganda (statis: `index.html` + `soal-bank.js`).

## Bank soal (470)

| Sumber | Jumlah |
|--------|--------|
| V1 | 60 |
| Kasus | 40 |
| Pre Test + Varian | 40 + 40 |
| Simulasi | 40 |
| Gap 1 / 2 / 3 | 100 + 100 + 50 |

## Regenerasi bank

```bash
node scripts/merge-bank.mjs
```

Sumber per bagian: `scripts/parts/*.js`. Audit kualitas: `node scripts/audit-quality.mjs`.

## Deploy

Lihat `docs/DEPLOY.md` (Vercel / Netlify / GitHub Pages).

## Struktur

```
index.html          UI latihan/ujian
soal-bank.js        bank gabungan (hasil merge)
scripts/parts/      sumber soal per bank
scripts/merge-bank.mjs
scripts/audit-quality.mjs
docs/               panduan deploy & screening
scripts/archive/    skrip sekali-pakai (tidak dipakai runtime)
```