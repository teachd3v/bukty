// Cloudflare Pages Function: GET /api/files/:name (Download/Stream files from R2)
export async function onRequestGet({ params, env }) {
  try {
    const fileName = params.name;

    if (!env || !env.FILES) {
      return new Response('R2 Storage belum terhubung', { status: 404 });
    }

    const object = await env.FILES.get(fileName);

    if (!object) {
      return new Response('File tidak ditemukan di Cloudflare R2', { status: 404 });
    }

    const headers = new Headers();
    object.writeHttpMetadata(headers);
    headers.set('etag', object.httpEtag);
    headers.set('Cache-Control', 'public, max-age=31536000');

    return new Response(object.body, { headers });
  } catch (err) {
    return new Response(err.message, { status: 500 });
  }
}
