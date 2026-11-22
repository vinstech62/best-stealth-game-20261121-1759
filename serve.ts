// Shadow Gallery — tiny static file server for local play-testing.
// Serves this repo's game/ folder on port 8080 (or PORT):
//   node serve.ts   then open http://localhost:8080
import { createServer } from 'node:http';
import { readFileSync, existsSync } from 'node:fs';
import { join, extname } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = fileURLToPath(new URL('.', import.meta.url));
const gameDir = join(here, 'game');
const port = Number(process.env.PORT ?? 8080);

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
};

const server = createServer((req, res) => {
  const path = req.url === '/' || !req.url ? '/index.html' : req.url.split('?')[0];
  const filePath = join(gameDir, path);
  if (!filePath.startsWith(gameDir) || !existsSync(filePath)) {
    res.writeHead(404, { 'content-type': 'text/plain' });
    res.end('not found\n');
    return;
  }
  res.writeHead(200, {
    'content-type': MIME_TYPES[extname(filePath)] ?? 'application/octet-stream',
  });
  res.end(readFileSync(filePath));
});

server.listen(port, () => {
  console.log(`Shadow Gallery serving game/ at http://localhost:${port}`);
});
