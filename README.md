# Portal Pendaftaran BUKTY (Bantuan UKT Yatim)

Portal pendaftaran resmi program **Bantuan UKT Yatim (BUKTY)** oleh **Dompet Dhuafa × GREAT Edunesia** dengan tema visual **Neo-Brutalism (Biru & Kuning)**, dibangun menggunakan **React 18 + Vite 6 + Tailwind CSS v4 + Cloudflare Pages Functions + Cloudflare D1 + Cloudflare R2**.

## Fitur Utama

- **Landing Page Neo-Brutalism (Biru & Kuning)**:
  - Hero section dengan informasi manfaat maksimal **Rp3.000.000/semester** (1 tahun / 2 semester: Ganjil & Genap 2027).
  - Gambaran program & daftar **12 provinsi sasaran**.
  - **11 persyaratan resmi** & tracker kesiapan **13 dokumen wajib**.
  - **Jadwal seleksi 7 tahap** (19 Nov – 2 Des 2026) dengan status real-time & batas pendaftaran otomatis (`25 Nov 2026 23:59 WIB`).
  - FAQ interaktif dan kontak resmi.
- **Wizard Pendaftaran 5 Tahap (`RegistrationFormModal`)**:
  - Auto-save draft lokal (`bukty_draft_v1`), anti-duplikasi NIK/NIM/Email, prefix ID `BUKTY-2026-XXXXXX`.
  - Unggah dokumen langsung ke Cloudflare R2 (termasuk KK dan dokumen pendukung yatim).
  - Bukti pendaftaran otomatis dalam format PDF (`html2pdf.js`) + animasi confetti.
- **Halaman Pengumuman & Pantukhir**:
  - `#pengumuman` (dan `#bypasspengumuman`) untuk pengumuman seleksi administrasi + 3 dokumen PDF + link grup WA dinamis.
  - `#pantukhir` (dan `#bypasspantukhir`) untuk pengecekan kelulusan akhir (`status_seleksi = 'Diterima'`) & SK Pantukhir.
- **Dashboard Admin (`#admin`)**:
  - **Pendaftar**: pencarian, filter provinsi/status, edit data, hapus pendaftar.
  - **Leaderboard**: verifikasi split-screen dengan pratinjau dokumen inline, auto-screening kelayakan BUKTY (Islam, 12 provinsi sasaran, PTN, IPK ≥ 3.00 / maba, tidak menerima beasiswa lain), sistem skoring otomatis **35% Status Yatim + 45% Rasio UKT/Penghasilan + 20% Tanggungan**, serta sinkronisasi ke Google Sheets.
  - **Lolos Seleksi**: promosi peserta lolos administrasi ke status `Diterima` (Pantukhir) dan ekspor CSV.
  - **Pengumuman**: konfigurasi jadwal rilis, unggah 3 PDF administrasi + SK Pantukhir, serta link grup WhatsApp dinamis.

## Tech Stack

- **Frontend**: React 18, Vite 6, Tailwind CSS v4 (`@tailwindcss/vite`), Lucide React, `html2pdf.js`, `canvas-confetti`
- **Backend / API**: Cloudflare Pages Functions (`functions/api/*`)
- **Database**: Cloudflare D1 (`DB` -> `bukty-db`, skema di `schema.sql`)
- **Storage**: Cloudflare R2 (`FILES` -> `bukty-files`)

## Pengembangan Lokal

1. Instal dependensi:
   ```bash
   npm install
   ```
2. Jalankan frontend dev server:
   ```bash
   npm run dev
   ```
3. Build produksi:
   ```bash
   npm run build
   ```
4. Menjalankan full-stack secara lokal dengan Wrangler (D1 & R2 lokal):
   ```bash
   npx wrangler d1 execute bukty-db --local --file=./schema.sql
   npx wrangler pages dev dist
   ```

## Setup & Deployment ke Cloudflare Pages

1. **Buat D1 Database**:
   ```bash
   npx wrangler d1 create bukty-db
   ```
   Salin `database_id` yang dihasilkan lalu ganti nilai `REPLACE_WITH_YOUR_BUKTY_D1_DATABASE_ID` pada file `wrangler.jsonc`.

2. **Inisialisasi Skema Database**:
   ```bash
   npx wrangler d1 execute bukty-db --remote --file=./schema.sql
   ```

3. **Buat R2 Bucket**:
   ```bash
   npx wrangler r2 bucket create bukty-files
   ```

4. **Atur Environment Variables / Secrets di Cloudflare Pages**:
   - `ADMIN_PASSWORD`: Password login dashboard `#admin` (default fallback lokal: `admin2026`).
   - `GOOGLE_SHEET_WEBHOOK`: (Opsional) URL Apps Script webhook untuk sinkronisasi pendaftar ke Google Sheets.

5. **Deploy**:
   ```bash
   npm run build
   npx wrangler pages deploy dist --project-name=bukty
   ```
   Atau hubungkan repositori GitHub ini langsung ke Cloudflare Pages dengan:
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
   - **Bindings**: D1 (`DB` → `bukty-db`) dan R2 (`FILES` → `bukty-files`).
