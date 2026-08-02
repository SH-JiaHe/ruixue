import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";

const workerPath = join(process.cwd(), "dist", "server", "index.js");

const workerSource = `const TEXT_TYPES = new Map([
  [".html", "text/html; charset=utf-8"],
  [".js", "text/javascript; charset=utf-8"],
  [".css", "text/css; charset=utf-8"],
  [".svg", "image/svg+xml; charset=utf-8"],
  [".json", "application/json; charset=utf-8"],
  [".txt", "text/plain; charset=utf-8"],
]);

function assetRequest(request, pathname) {
  const url = new URL(request.url);
  url.pathname = pathname;
  return new Request(url, request);
}

function contentTypeFor(pathname) {
  const extension = pathname.match(/\\.[^.\\/]+$/)?.[0];
  return extension ? TEXT_TYPES.get(extension) : undefined;
}

function withContentType(response, pathname) {
  const contentType = contentTypeFor(pathname);
  if (!contentType || response.headers.has("content-type")) return response;
  const headers = new Headers(response.headers);
  headers.set("content-type", contentType);
  return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
}

export default {
  async fetch(request, env) {
    if (request.method !== "GET" && request.method !== "HEAD") {
      return new Response("Method Not Allowed", { status: 405 });
    }

    const url = new URL(request.url);
    const pathname = url.pathname === "/" ? "/index.html" : url.pathname;
    const assetResponse = await env.ASSETS.fetch(assetRequest(request, pathname));

    if (assetResponse.status !== 404) {
      return withContentType(assetResponse, pathname);
    }

    if (!pathname.includes(".")) {
      return withContentType(await env.ASSETS.fetch(assetRequest(request, "/index.html")), "/index.html");
    }

    return assetResponse;
  },
};
`;

await mkdir(dirname(workerPath), { recursive: true });
await writeFile(workerPath, workerSource);
