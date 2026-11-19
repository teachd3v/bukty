// Cloudflare Pages Function: GET /api/announcement
export async function onRequestGet({ env }) {
  try {
    if (!env || !env.DB) {
      return new Response(
        JSON.stringify({ success: false, message: 'Database D1 tidak ditemukan' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    let config = null;
    try {
      config = await env.DB.prepare(`SELECT * FROM announcements WHERE id = 1`).first();
    } catch (e) {
      // Table doesn't exist yet
    }

    if (!config) {
      config = {
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
