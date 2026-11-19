// Cloudflare Pages Middleware: SEO canonical host protection & security headers
export async function onRequest(context) {
  const url = new URL(context.request.url);

  // Serve Google Search Console HTML verification directly with HTTP 200
  // (bypasses Cloudflare Pages automatic .html -> extensionless 308 redirect)
  if (url.pathname === '/google3ec65194025fa7bb.html') {
    return new Response('google-site-verification: google3ec65194025fa7bb.html', {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'public, max-age=3600',
      },
    });
  }

  const response = await context.next();
  const newResponse = new Response(response.body, response);

  // Prevent duplicate indexing on Cloudflare *.pages.dev preview/default hostnames
  // and keep admin/API routes out of search engine indexes
  if (
    url.hostname.endsWith('.pages.dev') ||
    url.pathname.startsWith('/admin') ||
    url.pathname.startsWith('/api/')
  ) {
    newResponse.headers.set('X-Robots-Tag', 'noindex, nofollow');
  }

  return newResponse;
}
