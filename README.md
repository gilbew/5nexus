# Latihan UKOM — Perencana Ahli Muda

Aplikasi latihan soal pilihan ganda (statis, tanpa server backend).

## Isi bank soal

| Sumber | Jumlah |
|--------|--------|
| V1 | 60 |
| Kasus | 40 |
| Pre Test | 40 |
| Pre Test Varian | 40 |
| Simulasi | 40 |
| Gap 1 (pembekalan) | 100 |
| Gap 2 (pembekalan) | 100 |
| Gap 3 (pembekalan) | 50 |
| **Total** | **470** |

Buka `index.html` di browser, atau jalankan server lokal (lihat `DEPLOY.md`).

## Regenerasi bank

```bash
node scripts/merge-bank.mjs
```

## Dokumen terkait

- `DEPLOY.md` — cara deploy ke web (Netlify / GitHub Pages / Vercel)
- `GAP-BAHAN-SCREENING.md` — prioritas topik gap untuk melengkapi bahan ajar HTML