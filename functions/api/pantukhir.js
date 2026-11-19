// Cloudflare Pages Function: GET /api/pantukhir
export async function onRequestGet({ env }) {
  try {
    if (!env || !env.DB) {
      return new Response(
        JSON.stringify({ success: false, message: 'Database D1 tidak ditemukan' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const { results } = await env.DB.prepare(`
      SELECT reg_id, nama, perguruan_tinggi, provinsi, status_seleksi
      FROM registrations
      WHERE status_seleksi = 'Diterima'
      ORDER BY nama COLLATE NOCASE ASC
    `).all();

    return new Response(
      JSON.stringify({ success: true, data: results }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ success: false, message: err.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
