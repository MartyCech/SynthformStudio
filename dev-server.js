const http = require('http');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const PORT = Number(process.env.PORT) || 3003;

// Serve the build artifact, not the repo root, so local output matches production (ADR-0004).
const ROOT = path.join(__dirname, 'dist');

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.mjs': 'application/javascript',
  '.json': 'application/json',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain',
  '.xml': 'application/xml',
  '.glb': 'model/gltf-binary',
  '.gltf': 'model/gltf+json',
  '.hdr': 'image/vnd.radiance',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
};

const server = http.createServer((req, res) => {
  let urlPath = decodeURIComponent(req.url.split('?')[0]);

  if (urlPath !== '/' && urlPath.endsWith('/')) {
    urlPath = urlPath.slice(0, -1);
  }

  // Block traversal outside dist/.
  let filePath = path.normalize(path.join(ROOT, urlPath));
  if (!filePath.startsWith(ROOT)) {
    res.writeHead(403);
    res.end('403 Forbidden');
    return;
  }

  let statusCode = 200;

  if (urlPath === '/') filePath = path.join(ROOT, 'index.html');

  // Clean URLs: /about resolves to /about/index.html or /about.html.
  if (!path.extname(filePath)) {
    const indexPath = path.join(filePath, 'index.html');
    const htmlPath = `${filePath}.html`;

    if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory() && fs.existsSync(indexPath)) {
      filePath = indexPath;
    } else if (fs.existsSync(htmlPath)) {
      filePath = htmlPath;
    } else {
      filePath = path.join(ROOT, '404.html');
      statusCode = 404;
    }
  }

  if (!fs.existsSync(filePath)) {
    filePath = path.join(ROOT, '404.html');
    statusCode = 404;
    if (!fs.existsSync(filePath)) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('404 Not Found');
      return;
    }
  }

  const ext = path.extname(filePath).toLowerCase();

  res.writeHead(statusCode, {
    'Content-Type': MIME[ext] || 'application/octet-stream',
    'Cache-Control': 'no-store',
  });
  fs.createReadStream(filePath).pipe(res);
});

server.listen(PORT, () => {
  const url = `http://localhost:${PORT}`;
  console.log(`\n  Local dist server running at ${url}\n`);

  const openCommand = { darwin: 'open', win32: 'start ""', linux: 'xdg-open' }[process.platform];
  if (openCommand) {
    exec(`${openCommand} ${url}`, (err) => {
      if (err) console.warn(`  Nepodařilo se automaticky otevřít prohlížeč: ${err.message}`);
    });
  }
});
