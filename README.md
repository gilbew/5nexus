# 5nexus

Situs publik (`5nexus.diaidia.id`) saat ini menampilkan **404**. App latihan UKOM diarsipkan di `archive/ukom/` (lihat README di sana untuk **aktifkan kembali**).

## Latihan UKOM — Perencana Ahli Muda (arsip)

Aplikasi latihan soal pilihan ganda (statis: `index.html` + `soal-bank.js`).

### Bank soal (255)

| Sumber | Jumlah |
|--------|--------|
| Pre Test | 40 |
| JFP 2025 (Google Form, unik) | 51 |
| Pembahasan 2026 | 164 |

Sumber lama (v1, kasus, simulasi, gap, pretest varian) di `scripts/parts/archive/`.

### Regenerasi bank

```bash
node scripts/extract-googleform-jfp2025.mjs   # dari Google Form
node scripts/build-jfp2025.mjs                # parts/jfp2025.js
node scripts/build-pembahasan2026.mjs         # dari PDF Pembahasan 2026
node scripts/merge-bank.mjs
```

Sumber aktif: `pretest.js`, `jfp2025.js`, `pembahasan2026.js`.

### Deploy

Lihat `docs/DEPLOY.md`. Mode arsip: root = 404; `/archive/*` diblokir di `vercel.json`.
