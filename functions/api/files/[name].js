// Cloudflare Pages Function: GET /api/files/:name (Download/Stream files from R2)
function inferContentType(fileName, existingType) {
  const lower = (fileName || '').toLowerCase();
  if (lower.endsWith('.pdf')) return 'application/pdf';
  if (lower.endsWith('.jpg') || lower.endsWith('.jpeg')) return 'image/jpeg';
  if (lower.endsWith('.png')) return 'image/png';
  if (lower.endsWith('.webp')) return 'image/webp';
  if (lower.endsWith('.gif')) return 'image/gif';
  if (lower.endsWith('.heic')) return 'image/heic';
  if (lower.endsWith('.docx')) return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
  if (lower.endsWith('.doc')) return 'application/msword';
  if (lower.endsWith('.mp4')) return 'video/mp4';
  if (existingType && existingType !== 'application/octet-stream') return existingType;
  return 'application/octet-stream';
}

export async function onRequestGet({ params, env }) {
  try {
    const rawName = params.name;

    if (!env || !env.FILES) {
      return new Response('R2 Storage belum terhubung', { status: 404 });
    }

    let object = await env.FILES.get(rawName);
    let resolvedName = rawName;

    if (!object) {
      try {
        const decoded = decodeURIComponent(rawName);
        if (decoded !== rawName) {
          object = await env.FILES.get(decoded);
          resolvedName = decoded;
        }
      } catch (e) {}
    }

    if (!object) {
      return new Response('File tidak ditemukan di Cloudflare R2', { status: 404 });
    }

    const headers = new Headers();
    object.writeHttpMetadata(headers);

    const contentType = inferContentType(resolvedName, headers.get('content-type'));
    headers.set('content-type', contentType);

    if (
      contentType === 'application/pdf' ||
      contentType.startsWith('image/') ||
      contentType.startsWith('video/')
    ) {
      headers.set('content-disposition', 'inline');
    }

    headers.set('etag', object.httpEtag);
    headers.set('Cache-Control', 'public, max-age=31536000');

    return new Response(object.body, { headers });
  } catch (err) {
    return new Response(err.message, { status: 500 });
  }
}
