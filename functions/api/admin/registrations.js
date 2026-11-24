// Cloudflare Pages Function: GET / PATCH / DELETE / POST /api/admin/registrations (BUKTY 2026)

const TARGET_PROVINCES = [
  'jawa timur',
  'jawa barat',
  'di yogyakarta',
  'yogyakarta',
  'sumatera barat',
  'sumatera utara',
  'dki jakarta',
  'banten',
  'sumatera selatan',
  'sulawesi selatan',
  'riau',
  'lampung',
  'jawa tengah',
  'aceh',
  'nanggroe aceh darussalam',
];

function parseRp(val) {
  if (!val) return 0;
  return parseFloat(val.toString().replace(/[^0-9]/g, '')) || 0;
}

function isQualifiedBukty(r) {
  const religion = (r.agama || '').trim().toLowerCase();
  if (religion !== 'islam') return false;

  const prov = (r.provinsi || '').trim().toLowerCase();
  if (!TARGET_PROVINCES.includes(prov)) return false;

  const jenisPt = (r.jenis_pt || 'PTN').trim().toUpperCase();
  if (jenisPt !== 'PTN') return false;

  const isMaba = (r.status_mahasiswa || '') === 'Mahasiswa Baru';
  const ipkVal = parseFloat(String(r.ipk || '').replace(',', '.')) || 0;
  if (!isMaba && ipkVal < 3.0) return false;

  const otherSch = (r.sedang_beasiswa_lain || '').trim().toLowerCase();
  if (otherSch === 'ya' || otherSch === 'pernah') return false;

  return true;
}

// BUKTY Priority Scoring: 35% Status Yatim + 45% Rasio Beban UKT + 20% Tanggungan
function calculateScores(r) {
  const ukt = parseRp(r.nominal_ukt);
  const income = parseRp(r.penghasilan_ortu);
  const adjustedIncome = income === 0 ? 100000 : income;
  const ratio = ukt / adjustedIncome;

  const score_ratio = Math.min(ratio * 100, 100);

  const yatimRaw = (r.status_yatim || '').trim().toLowerCase();
  const kondisiRaw = (r.kondisi_khusus || '').trim().toLowerCase();
  let score_yatim = 30;
  if (yatimRaw === 'yatim piatu') score_yatim = 100;
  else if (yatimRaw === 'yatim') score_yatim = 90;
  else if (!yatimRaw && kondisiRaw.includes('meninggal')) score_yatim = 90;

  const tanggungan = parseInt(r.jumlah_tanggungan, 10) || 0;
  let score_tanggungan = 30;
  if (tanggungan >= 5) score_tanggungan = 100;
  else if (tanggungan === 4) score_tanggungan = 85;
  else if (tanggungan === 3) score_tanggungan = 70;
  else if (tanggungan === 2) score_tanggungan = 50;

  const score_total = (score_yatim * 0.35) + (score_ratio * 0.45) + (score_tanggungan * 0.20);

  return {
    score_yatim,
    score_ratio: parseFloat(score_ratio.toFixed(2)),
    score_tanggungan,
    score_total: parseFloat(score_total.toFixed(2)),
    raw_ratio: ratio,
    raw_ukt: ukt,
    raw_tanggungan: tanggungan,
  };
}

export async function onRequestGet({ request, env }) {
  try {
    const url = new URL(request.url);
    const search = url.searchParams.get('search') || '';
    const status = url.searchParams.get('status') || '';

    let results = [];

    if (env && env.DB) {
      let query = `SELECT * FROM registrations WHERE 1=1`;
      const params = [];

      if (search) {
        query += ` AND (nama LIKE ? OR nim LIKE ? OR perguruan_tinggi LIKE ? OR reg_id LIKE ? OR provinsi LIKE ?)`;
        const term = `%${search}%`;
        params.push(term, term, term, term, term);
      }

      if (status && status !== 'Semua') {
        query += ` AND status_seleksi = ?`;
        params.push(status);
      }

      query += ` ORDER BY id DESC`;

      const stmt = env.DB.prepare(query);
      const res = params.length > 0 ? await stmt.bind(...params).all() : await stmt.all();
      results = res.results || [];
    }

    return new Response(
      JSON.stringify({ success: true, data: results }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ success: false, message: err.message, data: [] }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

export async function onRequestPatch({ request, env }) {
  try {
    const body = await request.json();

    // Mode A: Batch Status Updates (e.g. Auto-Assign Top 32 Interview Recipients)
    if (Array.isArray(body.updates) && body.updates.length > 0) {
      if (env && env.DB) {
        const statements = body.updates
          .filter((u) => u && u.id && u.status_seleksi)
          .map((u) =>
            env.DB.prepare(`UPDATE registrations SET status_seleksi = ? WHERE id = ?`).bind(
              u.status_seleksi,
              u.id
            )
          );
        if (statements.length > 0) {
          await env.DB.batch(statements);
        }
      }
      return new Response(
        JSON.stringify({
          success: true,
          message: `${body.updates.length} status penerima BUKTY berhasil diperbarui secara otomatis`,
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Mode B: Single Candidate Update (Status, Catatan, Interview JSON)
    const { id, status_seleksi, catatan_admin, interview_json } = body;

    if (!id || !status_seleksi) {
      return new Response(
        JSON.stringify({ success: false, message: 'ID dan status seleksi wajib diisi' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    let candidate = null;

    if (env && env.DB) {
      // Ensure interview_json column exists for seamless migration on existing D1 databases
      if (interview_json !== undefined) {
        try {
          await env.DB.prepare(`ALTER TABLE registrations ADD COLUMN interview_json TEXT`).run();
        } catch (alterErr) {
          // Column already exists; safe to ignore
        }
      }

      if (interview_json !== undefined && catatan_admin !== undefined) {
        await env.DB.prepare(`
          UPDATE registrations
          SET status_seleksi = ?, catatan_admin = ?, interview_json = ?
          WHERE id = ?
        `).bind(
          status_seleksi,
          catatan_admin || '',
          typeof interview_json === 'string' ? interview_json : JSON.stringify(interview_json),
          id
        ).run();
      } else if (catatan_admin !== undefined) {
        await env.DB.prepare(`
          UPDATE registrations
          SET status_seleksi = ?, catatan_admin = ?
          WHERE id = ?
        `).bind(status_seleksi, catatan_admin || '', id).run();
      } else {
        await env.DB.prepare(`
          UPDATE registrations
          SET status_seleksi = ?
          WHERE id = ?
        `).bind(status_seleksi, id).run();
      }

      candidate = await env.DB.prepare(`SELECT * FROM registrations WHERE id = ?`).bind(id).first();
    }

    // Google Sheets Realtime Webhook Sync
    if (candidate && env && env.GOOGLE_SHEET_WEBHOOK) {
      try {
        const scores = calculateScores(candidate);
        const payload = {
          ...candidate,
          ...scores,
        };

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000);

        await fetch(env.GOOGLE_SHEET_WEBHOOK, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
          signal: controller.signal,
        });
        clearTimeout(timeoutId);
      } catch (webhookErr) {
        console.error('Google Sheets Sync failed:', webhookErr.message);
      }
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Status seleksi & wawancara berhasil diperbarui' }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ success: false, message: err.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

export async function onRequestDelete({ request, env }) {
  try {
    const { ids } = await request.json();

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return new Response(
        JSON.stringify({ success: false, message: 'Daftar ID wajib diisi' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (env && env.DB) {
      const placeholders = ids.map(() => '?').join(',');
      await env.DB.prepare(`DELETE FROM registrations WHERE id IN (${placeholders})`).bind(...ids).run();
    }

    return new Response(
      JSON.stringify({ success: true, message: `${ids.length} data pendaftar berhasil dihapus` }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ success: false, message: err.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

export async function onRequestPost({ env }) {
  try {
    if (!env || !env.DB) {
      return new Response(
        JSON.stringify({ success: false, message: 'Database D1 tidak ditemukan' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (!env.GOOGLE_SHEET_WEBHOOK) {
      return new Response(
        JSON.stringify({ success: false, message: 'Environment variable GOOGLE_SHEET_WEBHOOK belum dipasang' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const res = await env.DB.prepare(`SELECT * FROM registrations`).all();
    const registrations = res.results || [];

    const qualified = registrations.filter(isQualifiedBukty);

    const scored = qualified.map((r) => ({
      ...r,
      ...calculateScores(r),
    }));

    const sorted = scored.sort((a, b) => {
      if (b.score_total !== a.score_total) return b.score_total - a.score_total;
      if (b.score_yatim !== a.score_yatim) return b.score_yatim - a.score_yatim;
      if (b.raw_ratio !== a.raw_ratio) return b.raw_ratio - a.raw_ratio;
      if (b.raw_ukt !== a.raw_ukt) return b.raw_ukt - a.raw_ukt;
      if (b.raw_tanggungan !== a.raw_tanggungan) return b.raw_tanggungan - a.raw_tanggungan;
      return a.id - b.id;
    });

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 20000);

    const webhookRes = await fetch(env.GOOGLE_SHEET_WEBHOOK, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(sorted),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    const text = await webhookRes.text();
    if (text.startsWith('Error')) {
      throw new Error(text);
    }

    return new Response(
      JSON.stringify({ success: true, message: `Sync berhasil: ${scored.length} data pendaftar BUKTY terkirim ke Google Sheets` }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ success: false, message: err.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
