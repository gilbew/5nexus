# 5Nexus

Dashboard produktivitas harian: slot nexus, alokasi energi, timer run dengan sync **offline-first** (`localStorage`) dan **Supabase** (satu baris JSON per user + auth).

## Stack

- **Next.js** 16 (App Router), **React** 19, **TypeScript**
- **Tailwind CSS** 4
- **Supabase** (Postgres + Auth, `@supabase/ssr`)

## Setup

### 1. Dependencies

```bash
npm install
```

### 2. Environment

Salin `.env.example` → `.env.local` dan isi dari Supabase → **Project Settings → API**:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

`.env.local` tidak di-commit (lihat `.gitignore`).

### 3. Supabase database

Jalankan isi file migrasi SQL di **Supabase → SQL Editor** (atau lewat CLI jika kamu pakai):

- `supabase/migrations/20260328180000_user_dashboard_state.sql` — tabel `user_dashboard_state` + RLS.

### 4. Auth URL (Supabase Dashboard)

**Authentication → URL configuration**

- **Site URL:** sesuai domain produksi atau `http://localhost:3000` untuk lokal.
- **Redirect URLs:** sertakan `https://<domain>/auth/callback` dan `http://localhost:3000/auth/callback`.

## Scripts

```bash
npm run dev    # http://localhost:3000
npm run build
npm run start
npm run lint
```

## Arsitektur singkat (sync)

- State dashboard diserialkan sebagai **payload v5** (termasuk `runWallAnchorMs` untuk catch-up waktu saat tab tidak aktif).
- Push debounced, flush saat sign-out, **`pagehide`** → `POST /api/dashboard-beacon` (dengan cek versi server).
- Pull saat fokus / `pageshow` + interval cadangan (lebih rapat saat ada timer aktif).

## Catatan repo

- **`SESSIONTASK.md`** di-**`.gitignore`** — catatan produk/strategi lokal; tidak ikut push.

## Deploy

Sesuaikan env di host (mis. Vercel) dengan nilai yang sama seperti `.env.local` untuk production. Pastikan **Redirect URLs** di Supabase mencakup domain produksi.
