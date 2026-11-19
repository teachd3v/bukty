// Cloudflare Pages Function: POST /api/upload (Upload files to R2 Bucket)
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
      fileType = file.type || 'application/octet-stream';
    } else {
      const json = await request.json();
      fileName = Date.now() + '_' + (json.name || 'document.pdf').replace(/[^a-zA-Z0-9._-]/g, '_');
      fileType = json.type || 'application/pdf';
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
