// Cloudflare Pages Function: POST /api/register (BUKTY 2026 with Anti-Duplicate & Deadline Enforcement)
export async function onRequestPost({ request, env }) {
  try {
    const data = await request.json();

    // Automatic Deadline Enforcement (dynamic from D1 announcements table, fallback to 25 Nov 2026 23:59 WIB)
    let deadlineIso = '2026-11-25T23:59:59+07:00';
    if (env && env.DB) {
      try {
        const cfg = await env.DB.prepare(`SELECT registration_deadline FROM announcements WHERE id = 1`).first();
        if (cfg && cfg.registration_deadline) {
          const raw = String(cfg.registration_deadline).trim();
          if (/([+-]\d{2}:\d{2}|Z)$/i.test(raw)) deadlineIso = raw;
          else if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(raw)) deadlineIso = `${raw}:59+07:00`;
          else if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/.test(raw)) deadlineIso = `${raw}+07:00`;
        }
      } catch (e) {
        // Column or table may not exist yet; use default deadline
      }
    }

    const now = new Date().getTime();
    const deadline = new Date(deadlineIso).getTime();
    if (!Number.isNaN(deadline) && now >= deadline) {
      return new Response(
        JSON.stringify({
          success: false,
          message: 'Pendaftaran program BUKTY (Bantuan UKT Yatim) telah resmi ditutup sesuai batas jadwal yang ditetapkan panitia.',
        }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (!data.nama || !data.nik || !data.perguruanTinggi) {
      return new Response(
        JSON.stringify({ success: false, message: 'Data wajib tidak lengkap.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const regId = data.regId || ('BUKTY-2026-' + Math.floor(100000 + Math.random() * 900000));
    const submittedAt = data.submittedAt || new Date().toLocaleString('id-ID');

    if (env && env.DB) {
      // Check Duplicate NIK / NIM / Email in D1 Database
      const existing = await env.DB.prepare(`
        SELECT id, nama, nik, nim FROM registrations
        WHERE nik = ? OR (nim = ? AND nim != '') OR (email = ? AND email != '')
        LIMIT 1
      `).bind(data.nik, data.nim || '', data.email || '').first();

      if (existing) {
        return new Response(
          JSON.stringify({
            success: false,
            isDuplicate: true,
            message: `Pendaftaran dengan NIK (${data.nik}), NIM (${data.nim || '-'}), atau Email ini sudah terdaftar sebelumnya dalam sistem BUKTY!`,
          }),
          { status: 409, headers: { 'Content-Type': 'application/json' } }
        );
      }

      // Insert into D1 Database
      await env.DB.prepare(`
        INSERT INTO registrations (
          reg_id, submitted_at, nama, nik, ttl, gender, agama, provinsi,
          alamat_domisili, alamat_ktp, no_hp, email, instagram, follow_sosmed,
          status_mahasiswa, jenis_pt, perguruan_tinggi, fakultas_prodi, jenjang, semester, nim, ipk, tahun_kelulusan,
          nominal_ukt, status_ukt, kendala_ukt, upaya_ukt, pernah_beasiswa_ukt,
          detail_beasiswa_ukt_lama, sedang_beasiswa_lain, detail_beasiswa_lain, prestasi_text,
          nomor_rekening, bank_rekening, atas_nama_rekening,
          status_yatim, nama_ortu, pekerjaan_ortu, penghasilan_ortu, jumlah_tanggungan,
          kondisi_pekerjaan, status_rumah, kondisi_khusus,
          pengalaman_sosial, bersedia_program_sosial, bersedia_publikasi,
          uploaded_files_json, status_seleksi
        ) VALUES (
          ?, ?, ?, ?, ?, ?, ?, ?,
          ?, ?, ?, ?, ?, ?,
          ?, ?, ?, ?, ?, ?, ?, ?, ?,
          ?, ?, ?, ?, ?,
          ?, ?, ?, ?,
          ?, ?, ?,
          ?, ?, ?, ?, ?,
          ?, ?, ?,
          ?, ?, ?,
          ?, 'Pending'
        )
      `).bind(
        regId ?? '',
        submittedAt ?? '',
        String(data.nama ?? ''),
        String(data.nik ?? ''),
        String(data.ttl ?? ''),
        String(data.gender ?? ''),
        String(data.agama ?? ''),
        String(data.provinsi ?? ''),
        String(data.alamatDomisili ?? ''),
        String(data.alamatKtp ?? ''),
        String(data.noHp ?? ''),
        String(data.email ?? ''),
        String(data.instagram ?? ''),
        String(data.followSosmed ?? ''),
        String(data.statusMahasiswa ?? 'Mahasiswa Aktif'),
        String(data.jenisPt ?? 'PTN'),
        String(data.perguruanTinggi ?? ''),
        String(data.fakultasProdi ?? ''),
        String(data.jenjang ?? 'S1'),
        String(data.semester ?? ''),
        String(data.nim ?? ''),
        String(data.ipk ?? ''),
        String(data.tahunKelulusan ?? ''),
        String(data.nominalUkt ?? ''),
        String(data.statusUkt ?? ''),
        String(data.kendalaUkt ?? ''),
        String(data.upayaUkt ?? ''),
        String(data.pernahBeasiswaUkt ?? ''),
        String(data.detailBeasiswaUktLama ?? ''),
        String(data.sedangBeasiswaLain ?? ''),
        String(data.detailBeasiswaLain ?? ''),
        String(data.prestasiText ?? ''),
        String(data.nomorRekening ?? ''),
        String(data.bankRekening ?? ''),
        String(data.atasNamaRekening ?? ''),
        String(data.statusYatim ?? 'Yatim'),
        String(data.namaOrtu ?? ''),
        String(data.pekerjaanOrtu ?? ''),
        String(data.penghasilanOrtu ?? ''),
        String(data.jumlahTanggungan ?? ''),
        String(data.kondisiPekerjaan ?? ''),
        String(data.statusRumah ?? ''),
        String(data.kondisiKhusus ?? ''),
        String(data.pengalamanSosial ?? ''),
        String(data.bersediaProgramSosial ?? 'Ya'),
        String(data.bersediaPublikasi ?? 'Ya'),
        JSON.stringify(data.uploadedFiles || {})
      ).run();
    }

    return new Response(
      JSON.stringify({ success: true, regId, submittedAt, message: 'Pendaftaran BUKTY berhasil tersimpan di server.' }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ success: false, message: err.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
