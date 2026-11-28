// Cloudflare Pages Function: POST /api/upload (Upload files to R2 Bucket)
function inferMimeType(fileName, providedType) {
  if (providedType && providedType !== 'application/octet-stream') return providedType;
  const lower = (fileName || '').toLowerCase();
  if (lower.endsWith('.pdf')) return 'application/pdf';
  if (lower.endsWith('.jpg') || lower.endsWith('.jpeg')) return 'image/jpeg';
  if (lower.endsWith('.png')) return 'image/png';
  if (lower.endsWith('.webp')) return 'image/webp';
  if (lower.endsWith('.gif')) return 'image/gif';
  if (lower.endsWith('.heic')) return 'image/heic';
  if (lower.endsWith('.docx')) return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
  if (lower.endsWith('.doc')) return 'application/msword';
  return 'application/octet-stream';
}

export async function onRequestPost({ request, env }) {
  try {
    const contentType = request.headers.get('content-type') || '';

    let fileName = 'file_' + Date.now() + '.pdf';
    let fileData = null;
    let fileType = 'application/pdf';

    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      const file = formData.get('file');
      if (!file) {
        return new Response(
          JSON.stringify({ success: false, message: 'File tidak ditemukan' }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
      }
      fileName = Date.now() + '_' + file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
      fileData = await file.arrayBuffer();
      fileType = inferMimeType(file.name, file.type);
    } else {
      const json = await request.json();
      const origName = json.name || 'document.pdf';
      fileName = Date.now() + '_' + origName.replace(/[^a-zA-Z0-9._-]/g, '_');
      fileType = inferMimeType(origName, json.type);
      if (json.base64) {
        const base64Data = json.base64.replace(/^data:.+;base64,/, '');
        const binaryString = atob(base64Data);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        fileData = bytes.buffer;
      }
    }

    if (env && env.FILES && fileData) {
      await env.FILES.put(fileName, fileData, {
        httpMetadata: { contentType: fileType },
      });
      const fileUrl = `/api/files/${fileName}`;
      return new Response(
        JSON.stringify({ success: true, fileName, fileUrl, message: 'File berhasil diunggah ke Cloudflare R2' }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ success: true, fileName, fileUrl: '#', message: 'File terdata di sistem (mode lokal)' }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ success: false, message: err.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
