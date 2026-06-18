# BogorXplore

BogorXplore adalah aplikasi katalog dan rekomendasi wisata Bogor. Aplikasi ini menampilkan landing page, daftar destinasi, pencarian, filter kategori, peta lokasi, halaman detail, rekomendasi serupa, dan route map untuk rencana kunjungan.

Dataset utama berada di Supabase melalui tabel `public.places`. Seed bawaan berisi 296 destinasi wisata Bogor.

## Fitur

- Landing page BogorXplore dengan visual interaktif.
- Daftar destinasi di `/places` dengan pencarian, filter kategori, pagination, dan peta.
- Halaman detail destinasi di `/places/[id]` dengan info kunjungan, gambar, tag, sumber, dan rekomendasi serupa.
- Peta lokasi menggunakan MapLibre.
- Route map rekomendasi menggunakan OSRM public route service dengan fallback garis langsung.
- Optional semantic search dan rekomendasi dari Flask API.
- Supabase RLS untuk akses baca publik ke tabel `places`.

## Tech Stack

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS 4
- Supabase
- shadcn/ui, Radix UI, Lucide React
- MapLibre GL

## Prasyarat

- Node.js versi modern yang kompatibel dengan Next.js 16.
- npm.
- Project Supabase.
- Optional: Flask API rekomendasi/search jika ingin memakai semantic search.

## Setup Lokal

Install dependency:

```powershell
npm install
```

Salin env contoh:

```powershell
Copy-Item .env.example .env.local
```

Isi `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-supabase-publishable-key

# Optional. Isi jika Flask API sudah tersedia.
NEXT_PUBLIC_FLASK_API_URL=

```

Jalankan development server:

```powershell
npm run dev
```

Buka `http://localhost:3000`.

## Setup Supabase

1. Buka Supabase SQL Editor.
2. Jalankan isi file `supabase/schema.sql`.
3. Jalankan isi file `supabase/places_seed.sql` untuk mengisi data destinasi.
4. Buka aplikasi dan cek `/places`.

File Supabase yang tersedia:

- `supabase/schema.sql`: membuat tabel `public.places`, index, RLS, policy read-only publik, dan grant untuk `anon`.
- `supabase/places_seed.sql`: insert seed 296 destinasi.
- `supabase/places_seed.csv`: alternatif data import CSV.
- `supabase/reset_places.sql`: truncate tabel dan reset identity sebelum import ulang.

Catatan keamanan: pakai publishable key atau anon key di frontend. Jangan pernah memakai `service_role` key di `.env.local` untuk aplikasi browser.

## Optional Flask API

Jika `NEXT_PUBLIC_FLASK_API_URL` diisi, aplikasi akan mencoba:

- `GET /api/search?q=<keyword>&limit=100` untuk semantic search di halaman daftar.
- `POST /api/recommendations` untuk rekomendasi di halaman detail.

Jika Flask API kosong atau gagal, aplikasi tetap berjalan dengan fallback:

- Search memakai query Supabase `ilike`.
- Rekomendasi memakai destinasi dengan kategori yang sama, diurutkan dari `likes` tertinggi.

## Script

```powershell
npm run dev
npm run build
npm run start
npm run lint
npm run doctor
```

## Struktur Proyek

```text
app/
  page.tsx              Landing page
  places/page.tsx       Daftar, search, filter, pagination, peta
  places/[id]/page.tsx  Detail destinasi dan rekomendasi
components/
  PlaceMap.tsx
  RecommendationRouteMap.tsx
  NeoBrutalPlaceGrid.tsx
  ui/
lib/
  places.ts             Query Supabase, search, pagination, fallback rekomendasi
  flask-api.ts          Integrasi optional Flask API
  supabase.ts           Supabase client publik
  types.ts
supabase/
  schema.sql
  places_seed.sql
  places_seed.csv
  reset_places.sql
```

## Catatan Data

Kolom utama tabel `places`:

- `nama`
- `kategori`
- `label`
- `deskripsi`
- `alamat`
- `latitude`
- `longitude`
- `fasilitas`
- `harga_tiket`
- `jam_operasional`
- `telepon`
- `url`
- `url_gambar`
- `tags`
- `likes`
- `author`
- `sumber`

Koordinat yang kosong akan memakai fallback dari `lib/place-coordinates.ts` jika tersedia.
