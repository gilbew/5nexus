# Latihan UKOM (arsip)

Aplikasi latihan soal UKOM Perencana Ahli Muda — **tidak aktif di web publik** (root site menampilkan 404).

Bank soal & skrip regenerasi tetap ada di repo root (`scripts/`, `soal-bank.js` salinan di folder ini).

## Aktifkan kembali di `5nexus.diaidia.id`

1. **Salin app ke root** (dari folder repo):

   ```bash
   node scripts/merge-bank.mjs
   cp archive/ukom/index.html .
   cp soal-bank.js archive/ukom/
   ```

   Atau jika `soal-bank.js` sudah ada di root setelah merge, cukup salin `index.html` dari arsip dan pastikan `soal-bank.js` di root terbaru.

2. **Hapus blokir archive di `vercel.json`** — hapus baris `routes` yang mengembalikan 404 untuk `/archive/`.

3. **Regenerasi bank (opsional, jika parts berubah):**

   ```bash
   node scripts/merge-bank.mjs
   cp soal-bank.js archive/ukom/   # sinkronkan arsip
   ```

4. **Commit & push** → Vercel redeploy otomatis.

5. **Uji:** buka `/` — harus tampil Latihan UKOM, bukan 404.

## Nonaktifkan lagi

1. `cp index.html soal-bank.js archive/ukom/`
2. Ganti root `index.html` dengan halaman 404 (lihat commit arsip).
3. Kembalikan blokir `/archive/*` di `vercel.json`.
4. Push.

## Catatan

- Progress mode Belajar disimpan di **localStorage** browser, bukan server.
- Arsip di GitHub = sumber kebenaran; deploy Vercel mengikuti branch `main`.
