import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";

const workerPath = join(process.cwd(), "dist", "server", "index.js");
const clientDir = join(process.cwd(), "dist", "client");
let indexHtml = await readFile(join(clientDir, "index.html"), "utf8");

indexHtml = await inlineBuiltAssets(indexHtml);

async function inlineBuiltAssets(html) {
  let output = html;
  const basePath = process.env.VITE_BASE_PATH ?? "/";

  function assetPath(url) {
    let clean = url.replace(/^\//, "");
    const cleanBase = basePath.replace(/^\/|\/$/g, "");
    if (cleanBase && clean.startsWith(`${cleanBase}/`)) {
      clean = clean.slice(cleanBase.length + 1);
    }
    return clean;
  }

  const stylesheetMatches = [...output.matchAll(/<link rel="stylesheet" crossorigin href="([^"]+)">/g)];
  for (const match of stylesheetMatches) {
    const href = match[1];
    const css = await readFile(join(clientDir, assetPath(href)), "utf8");
    output = output.replace(match[0], `<style>${css}</style>`);
  }

  const scriptMatches = [...output.matchAll(/<script type="module" crossorigin src="([^"]+)"><\/script>/g)];
  for (const match of scriptMatches) {
    const src = match[1];
    const js = await readFile(join(clientDir, assetPath(src)), "utf8");
    output = output.replace(match[0], `<script type="module">${js}</script>`);
  }

  return output;
}

const workerSource = `const INDEX_HTML = ${JSON.stringify(indexHtml)};

const TEXT_TYPES = new Map([
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

async function fetchAsset(request, env, pathname) {
  const candidates = [pathname];
  if (!pathname.startsWith("/dist/")) candidates.push(\`/dist\${pathname}\`);
  if (!pathname.startsWith("/client/")) candidates.push(\`/client\${pathname}\`);
  if (!pathname.startsWith("/dist/client/")) candidates.push(\`/dist/client\${pathname}\`);

  for (const candidate of candidates) {
    const response = await env.ASSETS.fetch(assetRequest(request, candidate));
    if (response.status !== 404) return withContentType(response, candidate);
  }

  return null;
}

export default {
  async fetch(request, env) {
    if (request.method !== "GET" && request.method !== "HEAD") {
      return new Response("Method Not Allowed", { status: 405 });
    }

    const url = new URL(request.url);
    const pathname = url.pathname === "/" ? "/index.html" : url.pathname;
    const assetResponse = await fetchAsset(request, env, pathname);
    if (assetResponse) return assetResponse;

    if (!pathname.includes(".")) {
      const fallback = await fetchAsset(request, env, "/index.html");
      if (fallback) return fallback;
    }

    if (pathname === "/index.html" || !pathname.includes(".")) {
      return new Response(INDEX_HTML, {
        headers: { "content-type": "text/html; charset=utf-8" },
      });
    }

    return new Response("Not found", { status: 404 });
  },
};
`;

await mkdir(dirname(workerPath), { recursive: true });
await writeFile(workerPath, workerSource);
