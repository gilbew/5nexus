# Deploy — Latihan UKOM

Aplikasi ini **statis** (HTML + JS). Folder yang di-deploy: **`Latihan UKOM/`** (berisi `index.html` dan `soal-bank.js`).

## Sebelum deploy

Pastikan bank soal terbaru:

```bash
cd "Latihan UKOM"
node scripts/merge-bank.mjs
```

Total soal saat ini: **470** (termasuk Gap 1–3).

---

## Opsi 1: Netlify (paling mudah)

1. Buka https://app.netlify.com
2. **Add new site** → **Deploy manually**
3. Drag & drop folder **`Latihan UKOM`** (bukan folder root repo)
4. Site live dalam ~1 menit

File `netlify.toml` sudah disertakan jika deploy via Git.

---

## Opsi 2: GitHub Pages

1. Push repo ke GitHub
2. **Settings** → **Pages**
3. Source: deploy folder **`/Latihan UKOM`** (atau root dengan GitHub Action)
4. Untuk subfolder: set **Publish directory** = `Latihan UKOM`

Tambahkan `.nojekyll` (sudah ada) agar file besar `soal-bank.js` tidak diabaikan Jekyll.

---

## Opsi 3: Vercel + GitHub (pakai project lama — timpa isi repo)

Cocok jika Anda **sudah punya repo GitHub + project Vercel** yang mau diganti isinya. Domain/custom domain di Vercel **tetap** — tidak perlu setup ulang.

### Prinsip

1. Isi repo GitHub diganti dengan isi folder **`Latihan UKOM`** (bukan folder induk `latihan ukom`).
2. Push ke branch yang sudah dipakai Vercel (biasanya `main`).
3. Vercel otodeploy — URL `*.vercel.app` yang lama tetap dipakai.

### Langkah (PowerShell)

```powershell
cd "c:\Users\gilbe\Desktop\latihan ukom\Latihan UKOM"
node scripts/merge-bank.mjs

git init
git add .
git commit -m "Latihan UKOM: 470 soal + gap pembekalan"

# Ganti URL dengan repo GitHub yang mau dipakai ulang:
git branch -M main
git remote add origin https://github.com/USERNAME/NAMA-REPO.git

# Timpa isi repo lama (hati-hati: history lama hilang di branch main)
git push -u origin main --force
```

### Cek di Vercel (sekali saja)

Dashboard → project lama → **Settings** → **General**:

| Setting | Nilai |
|---------|--------|
| Root Directory | **kosong** / `.` (karena isi repo = isi folder Latihan UKOM) |
| Framework Preset | **Other** |
| Build Command | `node scripts/merge-bank.mjs` |
| Output Directory | `.` |
| Install Command | kosong |

Jika dulu Root Directory = subfolder lain, ubah jadi `.` lalu **Redeploy**.

File `vercel.json` di repo sudah mengatur build yang sama.

### Domain

- URL default `nama-project.vercel.app` **tidak berubah** selama project Vercel-nya sama.
- Custom domain (jika pernah dipasang) **tetap mengarah** ke project yang sama — tidak perlu daftar ulang.

---

## Opsi 4: Vercel (project baru)

1. https://vercel.com → Import project
2. **Root Directory**: `Latihan UKOM` (jika repo berisi seluruh folder `latihan ukom`)
3. Build command: `node scripts/merge-bank.mjs`
4. Output: `.`

---

## Uji lokal sebelum deploy

```bash
cd "Latihan UKOM"
npx --yes serve .
```

Buka URL yang ditampilkan (biasanya http://localhost:3000).

---

## Filter soal pembekalan

Di aplikasi, filter **Sumber**:
- Gap 1 / Gap 2 / Gap 3 — materi dari transkrip pembekalan
- Kombinasikan dengan cluster Teknis / Ekonomi / Sosial / Spasial