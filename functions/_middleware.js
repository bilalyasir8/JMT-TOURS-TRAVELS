
export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const path = url.pathname;

  // Paths that must continue to be handled by Express.
  const shouldProxy =
    path === "/api" ||
    path.startsWith("/api/") ||
    path === "/health" ||
    path === "/ready" ||
    path === "/admin" ||
    path.startsWith("/admin/") ||
    path === "/sitemap.xml" ||
    path === "/robots.txt" ||
    path.startsWith("/tourism/") ||
    path.startsWith("/visa/");

  // Everything else is served from Cloudflare Pages.
  if (!shouldProxy) {
    return context.next();
  }

  if (!env.RENDER_ORIGIN) {
    return new Response("Backend origin is not configured", {
      status: 500
    });
  }

  // Forward the original path, query parameters, method,
  // headers, and request body to Render.
  const upstreamUrl = new URL(
    url.pathname + url.search,
    env.RENDER_ORIGIN
  );

  const upstreamRequest = new Request(upstreamUrl, request);

  return fetch(upstreamRequest);
}
