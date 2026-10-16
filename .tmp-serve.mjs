import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { join, extname, normalize } from "node:path";

const ROOT = "D:/Exam-Arena-Frontend/out";
const PORT = 3008;
const TYPES = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".json": "application/json", ".svg": "image/svg+xml", ".png": "image/png", ".jpg": "image/jpeg", ".ico": "image/x-icon", ".woff2": "font/woff2", ".txt": "text/plain", ".webp": "image/webp", ".map": "application/json" };

async function tryFile(p) {
  try { const s = await stat(p); if (s.isFile()) return p; } catch {}
  return null;
}

createServer(async (req, res) => {
  let url = decodeURIComponent((req.url || "/").split("?")[0]);
  const candidates = [];
  const clean = normalize(url).replace(/\\/g, "/");
  candidates.push(join(ROOT, clean));
  if (clean.endsWith("/")) candidates.push(join(ROOT, clean + "index.html"));
  candidates.push(join(ROOT, clean + ".html"));
  candidates.push(join(ROOT, clean, "index.html"));
  candidates.push(join(ROOT, clean + ".txt"));
  for (const c of candidates) {
    const f = await tryFile(c);
    if (f) {
      const body = await readFile(f);
      res.writeHead(200, { "content-type": TYPES[extname(f)] || "application/octet-stream", "cache-control": "no-store" });
      res.end(body);
      return;
    }
  }
  res.writeHead(404, { "content-type": "text/plain" });
  res.end("404 " + url);
}).listen(PORT, () => console.log("serving out/ on http://localhost:" + PORT));
