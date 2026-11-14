// Serves the built site the way GitHub Pages does, for end-to-end tests:
//   /route -> route.html, /route/ -> route/index.html, anything else -> 404.html with status 404.
// Usage: node scripts/serve-pages.mjs [distDir] [port]
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';

const [dir = 'dist/portfolio-static/browser', port = '4300'] = process.argv.slice(2);
const root = path.resolve(dir);

if (!fs.existsSync(path.join(root, '404.html'))) {
  console.error(`No Pages build in ${root}. Run "npm run build:pages" first.`);
  process.exit(1);
}

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.pdf': 'application/pdf',
  '.xml': 'application/xml',
  '.txt': 'text/plain',
  '.webmanifest': 'application/manifest+json',
};

const isFile = (f) => f.startsWith(root + path.sep) && fs.existsSync(f) && fs.statSync(f).isFile();

http
  .createServer((req, res) => {
    const urlPath = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    const candidates = urlPath.endsWith('/')
      ? [path.join(root, urlPath, 'index.html')]
      : [path.join(root, urlPath), path.join(root, `${urlPath}.html`)];
    const found = candidates.map((f) => path.resolve(f)).find(isFile);
    const file = found ?? path.join(root, '404.html');
    res.writeHead(found ? 200 : 404, {
      'Content-Type': TYPES[path.extname(file)] ?? 'application/octet-stream',
    });
    fs.createReadStream(file).pipe(res);
  })
  .listen(Number(port), () => console.log(`Serving ${root} on http://localhost:${port}`));
