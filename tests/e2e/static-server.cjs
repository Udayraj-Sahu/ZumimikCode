/*
 * Test-only static server for the Capacitor-style export.
 *
 * The build writes RELATIVE asset refs (./_next/...) for the APK's file://
 * context. A plain static server resolves those against the requested route's
 * directory, so nested pages like /settings/profile request /settings/_next/...
 * and 404. This server rewrites nested /<dir>/_next/* request paths back to
 * /_next/* and /<dir>/sw.js to /sw.js so the exported app hydrates correctly
 * at any depth. Serves everything from the out/ dir.
 */

/* eslint-disable @typescript-eslint/no-var-requires */
const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = Number(process.env.PORT || 3210);
const ROOT = path.resolve(__dirname, "..", "..", "out");

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript",
  ".mjs": "text/javascript",
  ".css": "text/css",
  ".json": "application/json",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".ico": "image/x-icon",
  ".txt": "text/plain; charset=utf-8",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".xml": "application/xml",
  ".webmanifest": "application/manifest+json",
};

function write404(res) {
  const fallback = path.join(ROOT, "404.html");
  if (fs.existsSync(fallback)) {
    serveFile(res, fallback, 404);
  } else {
    res.writeHead(404, { "Content-Type": "text/plain" });
    res.end("not found");
  }
}

function serveFile(res, abs, status) {
  fs.readFile(abs, (err, data) => {
    if (err) {
      write404(res);
      return;
    }
    const ext = path.extname(abs).toLowerCase();
    res.writeHead(status || 200, {
      "Content-Type": MIME[ext] || "application/octet-stream",
      "Cache-Control": "no-store",
    });
    res.end(data);
  });
}

const server = http.createServer((req, res) => {
  let p;
  try {
    p = decodeURIComponent(new URL(req.url, `http://${req.headers.host || "localhost"}`).pathname);
  } catch {
    write404(res);
    return;
  }

  // Nested relative assets: /settings/_next/static/... -> /_next/static/...
  const marker = p.indexOf("/_next/");
  if (p.startsWith("/") && marker > 0) {
    p = p.slice(marker);
  }
  // Nested service worker reference.
  if (/\/(sw\.js)$/.test(p)) {
    p = "/sw.js";
  }

  let abs;
  try {
    abs = path.normalize(path.join(ROOT, p));
  } catch {
    write404(res);
    return;
  }
  if (!abs.startsWith(ROOT)) {
    write404(res);
    return;
  }

  if (fs.existsSync(abs) && fs.statSync(abs).isDirectory()) {
    const idx = path.join(abs, "index.html");
    if (fs.existsSync(idx)) {
      serveFile(res, idx);
      return;
    }
  }

  if (fs.existsSync(abs) && fs.statSync(abs).isFile()) {
    serveFile(res, abs);
    return;
  }

  if (!path.extname(p)) {
    const asHtml = path.join(ROOT, p + ".html");
    if (fs.existsSync(asHtml) && fs.statSync(asHtml).isFile()) {
      serveFile(res, asHtml);
      return;
    }
  }

  write404(res);
});

server.listen(PORT, () => {
  console.log(`static-server (out/) listening on :${PORT}`);
});