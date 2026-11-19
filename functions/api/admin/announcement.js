// Cloudflare Pages Function: GET / POST /api/admin/announcement
export async function onRequestGet({ env }) {
  try {
    if (!env || !env.DB) {
      return new Response(
        JSON.stringify({ success: false, message: 'Database D1 tidak ditemukan' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    await env.DB.prepare(`
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
      )
    `).run();

    // Patch existing tables safely if migrated from older schema
    const alterStatements = [
      `ALTER TABLE announcements ADD COLUMN wa_group_admin_url TEXT`,
      `ALTER TABLE announcements ADD COLUMN pantukhir_publish_time TEXT`,
      `ALTER TABLE announcements ADD COLUMN pantukhir_file_name TEXT`,
      `ALTER TABLE announcements ADD COLUMN pantukhir_file_url TEXT`,
      `ALTER TABLE announcements ADD COLUMN wa_group_pantukhir_url TEXT`,
    ];
    for (const stmt of alterStatements) {
      try {
        await env.DB.prepare(stmt).run();
      } catch (e) {}
    }

    let config = await env.DB.prepare(`SELECT * FROM announcements WHERE id = 1`).first();

    if (!config) {
      await env.DB.prepare(`
        INSERT INTO announcements (
          id, publish_time, file1_name, file1_url, file2_name, file2_url, file3_name, file3_url,
          wa_group_admin_url, pantukhir_publish_time, pantukhir_file_name, pantukhir_file_url,
          wa_group_pantukhir_url, updated_at
        ) VALUES (1, '', '', '', '', '', '', '', '', '', '', '', '', '')
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
    } = body;

    await env.DB.prepare(`
      INSERT OR REPLACE INTO announcements (
        id, publish_time, file1_name, file1_url, file2_name, file2_url, file3_name, file3_url,
        wa_group_admin_url, pantukhir_publish_time, pantukhir_file_name, pantukhir_file_url,
        wa_group_pantukhir_url, updated_at
      )
      VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
      new Date().toISOString()
    ).run();

    return new Response(
      JSON.stringify({ success: true, message: 'Pengaturan pengumuman BUKTY berhasil diperbarui' }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ success: false, message: err.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
