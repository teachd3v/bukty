// Cloudflare Pages Function: GET / POST / DELETE /api/admin/announcement
async function ensureAnnouncementSchema(db) {
  await db.prepare(`
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
      timeline_json TEXT,
      registration_deadline TEXT,
      show_announcement_menus INTEGER DEFAULT 0,
      updated_at TEXT
    )
  `).run();

  const alterStatements = [
    `ALTER TABLE announcements ADD COLUMN wa_group_admin_url TEXT`,
    `ALTER TABLE announcements ADD COLUMN pantukhir_publish_time TEXT`,
    `ALTER TABLE announcements ADD COLUMN pantukhir_file_name TEXT`,
    `ALTER TABLE announcements ADD COLUMN pantukhir_file_url TEXT`,
    `ALTER TABLE announcements ADD COLUMN wa_group_pantukhir_url TEXT`,
    `ALTER TABLE announcements ADD COLUMN timeline_json TEXT`,
    `ALTER TABLE announcements ADD COLUMN registration_deadline TEXT`,
    `ALTER TABLE announcements ADD COLUMN show_announcement_menus INTEGER DEFAULT 0`,
  ];
  for (const stmt of alterStatements) {
    try {
      await db.prepare(stmt).run();
    } catch (e) {}
  }
}

export async function onRequestGet({ env }) {
  try {
    if (!env || !env.DB) {
      return new Response(
        JSON.stringify({ success: false, message: 'Database D1 tidak ditemukan' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    await ensureAnnouncementSchema(env.DB);

    let config = await env.DB.prepare(`SELECT * FROM announcements WHERE id = 1`).first();

    if (!config) {
      await env.DB.prepare(`
        INSERT INTO announcements (
          id, publish_time, file1_name, file1_url, file2_name, file2_url, file3_name, file3_url,
          wa_group_admin_url, pantukhir_publish_time, pantukhir_file_name, pantukhir_file_url,
          wa_group_pantukhir_url, timeline_json, registration_deadline, show_announcement_menus, updated_at
        ) VALUES (1, '', '', '', '', '', '', '', '', '', '', '', '', '', '', 0, '')
      `).run();
      config = {
        id: 1,
        publish_time: '',
        file1_name: '',
        file1_url: '',
        file2_name: '',
        file2_url: '',
        file3_name: '',
        file3_url: '',
        wa_group_admin_url: '',
        pantukhir_publish_time: '',
        pantukhir_file_name: '',
        pantukhir_file_url: '',
        wa_group_pantukhir_url: '',
        timeline_json: '',
        registration_deadline: '',
        show_announcement_menus: 0,
        updated_at: '',
      };
    }

    return new Response(
      JSON.stringify({ success: true, data: config }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ success: false, message: err.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

export async function onRequestPost({ request, env }) {
  try {
    if (!env || !env.DB) {
      return new Response(
        JSON.stringify({ success: false, message: 'Database D1 tidak ditemukan' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    await ensureAnnouncementSchema(env.DB);

    const body = await request.json();
    const {
      publish_time,
      file1_name,
      file1_url,
      file2_name,
      file2_url,
      file3_name,
      file3_url,
      wa_group_admin_url,
      pantukhir_publish_time,
      pantukhir_file_name,
      pantukhir_file_url,
      wa_group_pantukhir_url,
      timeline_json,
      registration_deadline,
      show_announcement_menus,
    } = body;

    const serializedTimeline =
      typeof timeline_json === 'string'
        ? timeline_json
        : Array.isArray(timeline_json)
        ? JSON.stringify(timeline_json)
        : '';

    await env.DB.prepare(`
      INSERT OR REPLACE INTO announcements (
        id, publish_time, file1_name, file1_url, file2_name, file2_url, file3_name, file3_url,
        wa_group_admin_url, pantukhir_publish_time, pantukhir_file_name, pantukhir_file_url,
        wa_group_pantukhir_url, timeline_json, registration_deadline, show_announcement_menus, updated_at
      )
      VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      publish_time || '',
      file1_name || '',
      file1_url || '',
      file2_name || '',
      file2_url || '',
      file3_name || '',
      file3_url || '',
      wa_group_admin_url || '',
      pantukhir_publish_time || '',
      pantukhir_file_name || '',
      pantukhir_file_url || '',
      wa_group_pantukhir_url || '',
      serializedTimeline,
      registration_deadline || '',
      show_announcement_menus ? 1 : 0,
      new Date().toISOString()
    ).run();

    return new Response(
      JSON.stringify({ success: true, message: 'Pengaturan jadwal & pengumuman BUKTY berhasil diperbarui' }),
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
    if (!env || !env.DB) {
      return new Response(
        JSON.stringify({ success: false, message: 'Database D1 tidak ditemukan' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const body = await request.json();
    const { fileKey, fileUrl } = body || {};

    const columnMap = {
      file1: ['file1_name', 'file1_url'],
      file2: ['file2_name', 'file2_url'],
      file3: ['file3_name', 'file3_url'],
      pantukhir: ['pantukhir_file_name', 'pantukhir_file_url'],
    };

    const cols = columnMap[fileKey];
    if (!cols) {
      return new Response(
        JSON.stringify({ success: false, message: 'Kunci dokumen tidak valid' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const [nameCol, urlCol] = cols;
    const existing = await env.DB.prepare(`SELECT ${urlCol} AS url FROM announcements WHERE id = 1`).first();
    const urlsToDelete = new Set(
      [existing?.url, fileUrl].filter((u) => typeof u === 'string' && u.startsWith('/api/files/'))
    );

    if (env.FILES) {
      for (const u of urlsToDelete) {
        const objectKey = decodeURIComponent(u.replace('/api/files/', ''));
        if (objectKey) {
          try {
            await env.FILES.delete(objectKey);
          } catch (e) {}
        }
      }
    }

    await env.DB.prepare(
      `UPDATE announcements SET ${nameCol} = '', ${urlCol} = '', updated_at = ? WHERE id = 1`
    )
      .bind(new Date().toISOString())
      .run();

    return new Response(
      JSON.stringify({ success: true, message: 'Dokumen pengumuman berhasil dihapus' }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ success: false, message: err.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
