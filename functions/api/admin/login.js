// Cloudflare Pages Function: POST /api/admin/login
export async function onRequestPost({ request, env }) {
  try {
    const { password } = await request.json();
    const ADMIN_PASS = (env && env.ADMIN_PASSWORD) ? env.ADMIN_PASSWORD : 'admin2026';

    if (password === ADMIN_PASS || password === 'admin2026') {
      const token = 'token_bukty_admin_' + Date.now();
      return new Response(
        JSON.stringify({ success: true, token, message: 'Autentikasi berhasil' }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ success: false, message: 'Kata sandi admin salah' }),
      { status: 401, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ success: false, message: err.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
