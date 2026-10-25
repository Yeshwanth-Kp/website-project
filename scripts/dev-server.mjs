/**
 * Small zero-dependency static server for local development.
 *
 * Run with: npm run dev
 * Then open: http://localhost:3000
 *
 * GitHub Pages serves the same files. This server only adds convenience:
 * directory index handling, correct MIME types, and no-cache headers.
 */

import { createServer } from "node:http";
import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import { dirname, extname, join, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const port = Number(process.env.PORT) || 3000;
const host = process.env.HOST || "0.0.0.0";

const MIME_TYPES = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".ico": "image/x-icon",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".txt": "text/plain; charset=utf-8",
  ".webmanifest": "application/manifest+json",
  ".webp": "image/webp",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
};

const server = createServer(async (request, response) => {
  if (request.method !== "GET" && request.method !== "HEAD") {
    response.writeHead(405, { Allow: "GET, HEAD" });
    response.end("Method not allowed");
    return;
  }

  try {
    const requestUrl = new URL(request.url ?? "/", "http://localhost");
    let pathname;

    try {
      pathname = decodeURIComponent(requestUrl.pathname);
    } catch {
      sendNotFound(response);
      return;
    }

    if (pathname.includes("\0")) {
      sendNotFound(response);
      return;
    }

    const segments = pathname
      .replaceAll("\\", "/")
      .split("/")
      .filter(Boolean);
    if (segments.some((segment) => segment.startsWith("."))) {
      sendNotFound(response);
      return;
    }

    const relativePath = segments.join("/");
    let filePath = resolve(join(root, relativePath));

    if (filePath !== root && !filePath.startsWith(root + sep)) {
      sendNotFound(response);
      return;
    }

    let fileStats;

    try {
      fileStats = await stat(filePath);
    } catch {
      sendNotFound(response);
      return;
    }

    if (fileStats.isDirectory()) {
      if (!requestUrl.pathname.endsWith("/")) {
        response.writeHead(308, {
          Location: `${requestUrl.pathname}/${requestUrl.search}`,
        });
        response.end();
        return;
      }

      filePath = join(filePath, "index.html");

      try {
        fileStats = await stat(filePath);
      } catch {
        sendNotFound(response);
        return;
      }
    }

    if (!fileStats.isFile()) {
      sendNotFound(response);
      return;
    }

    const extension = extname(filePath).toLowerCase();
    const contentType =
      MIME_TYPES[extension] || "application/octet-stream";

    response.writeHead(200, {
      "Content-Type": contentType,
      "Content-Length": fileStats.size,
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
    });

    if (request.method === "HEAD") {
      response.end();
      return;
    }

    createReadStream(filePath).pipe(response);
  } catch (error) {
    console.error("[dev-server]", error);
    response.writeHead(500, { "Content-Type": "text/plain; charset=utf-8" });
    response.end("Internal server error");
  }
});

server.on("error", (error) => {
  if (error.code === "EADDRINUSE") {
    console.error(
      `\nPort ${port} is already in use. Try: PORT=3001 npm run dev\n`,
    );
  } else {
    console.error(error);
  }
  process.exitCode = 1;
});

server.listen(port, host, () => {
  console.log(`\nKumarakom guest feedback is running at http://localhost:${port}`);
  console.log(`Staff portal: http://localhost:${port}/admin/\n`);
});

function sendNotFound(response) {
  response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
  response.end("Not found");
}
