-- BUKTY (Bantuan UKT Yatim) 2026 - Cloudflare D1 SQLite Database Schema

CREATE TABLE IF NOT EXISTS registrations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  reg_id TEXT UNIQUE NOT NULL,
  submitted_at TEXT NOT NULL,

  -- A. Data Pribadi
  nama TEXT NOT NULL,
  nik TEXT NOT NULL,
  ttl TEXT NOT NULL,
  gender TEXT NOT NULL,
  agama TEXT NOT NULL,
  provinsi TEXT NOT NULL,
  alamat_domisili TEXT NOT NULL,
  alamat_ktp TEXT,
  no_hp TEXT NOT NULL,
  email TEXT NOT NULL,
  instagram TEXT NOT NULL,
  follow_sosmed TEXT NOT NULL,

  -- B. Data Akademik
  status_mahasiswa TEXT NOT NULL DEFAULT 'Mahasiswa Aktif',
  jenis_pt TEXT NOT NULL DEFAULT 'PTN',
  perguruan_tinggi TEXT NOT NULL,
  fakultas_prodi TEXT NOT NULL,
  jenjang TEXT NOT NULL,
  semester TEXT NOT NULL,
  nim TEXT,
  ipk TEXT NOT NULL,
  tahun_kelulusan TEXT NOT NULL,
  nominal_ukt TEXT NOT NULL,
  status_ukt TEXT NOT NULL,
  kendala_ukt TEXT,
  upaya_ukt TEXT,
  pernah_beasiswa_ukt TEXT,
  detail_beasiswa_ukt_lama TEXT,
  sedang_beasiswa_lain TEXT,
  detail_beasiswa_lain TEXT,
  prestasi_text TEXT,
  nomor_rekening TEXT,
  bank_rekening TEXT,
  atas_nama_rekening TEXT,

  -- C. Data Ekonomi Keluarga & Status Yatim
  status_yatim TEXT NOT NULL DEFAULT 'Yatim',
  nama_ortu TEXT NOT NULL,
  pekerjaan_ortu TEXT NOT NULL,
  penghasilan_ortu TEXT NOT NULL,
  jumlah_tanggungan TEXT NOT NULL,
  kondisi_pekerjaan TEXT NOT NULL,
  status_rumah TEXT NOT NULL,
  kondisi_khusus TEXT NOT NULL,

  -- D. Aktivitas Sosial & Komitmen
  pengalaman_sosial TEXT,
  bersedia_program_sosial TEXT NOT NULL DEFAULT 'Ya',
  bersedia_publikasi TEXT NOT NULL,

  -- E. Dokumen & Status Seleksi
  uploaded_files_json TEXT,
  status_seleksi TEXT DEFAULT 'Pending',
  catatan_admin TEXT
);

CREATE TABLE IF NOT EXISTS announcements (
  id INTEGER PRIMARY KEY,
  publish_time TEXT,
  file1_name TEXT,
  file1_url TEXT,
  file2_name TEXT,
  file2_url TEXT,
  file3_name TEXT,
  file3_url TEXT,
  wa_group_admin_url TEXT,
  pantukhir_publish_time TEXT,
  pantukhir_file_name TEXT,
  pantukhir_file_url TEXT,
  wa_group_pantukhir_url TEXT,
  updated_at TEXT
);

CREATE INDEX IF NOT EXISTS idx_registrations_reg_id ON registrations(reg_id);
CREATE INDEX IF NOT EXISTS idx_registrations_status ON registrations(status_seleksi);
CREATE INDEX IF NOT EXISTS idx_registrations_kampus ON registrations(perguruan_tinggi);
CREATE INDEX IF NOT EXISTS idx_registrations_provinsi ON registrations(provinsi);
CREATE INDEX IF NOT EXISTS idx_registrations_yatim ON registrations(status_yatim);
