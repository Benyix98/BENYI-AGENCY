// Servidor estático para ver la demo en local. Uso: node demo-rediseno/serve.mjs  →  http://localhost:5520/demo-rediseno/
// Sirve la raíz del repositorio (la demo usa ../images, ../videos y las páginas de casos y guía),
// solo en 127.0.0.1 y sin exponer backend, panel de administración, documentación ni archivos ocultos.
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PORT = Number(process.env.PORT) || 5520;
const MIME = {
    '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
    '.mjs': 'text/javascript; charset=utf-8', '.json': 'application/json; charset=utf-8', '.svg': 'image/svg+xml',
    '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.ico': 'image/x-icon',
    '.mp4': 'video/mp4', '.woff2': 'font/woff2',
};
const BLOCKED = /^\/(backend|functions|contact-worker|docs|admin|node_modules)(\/|$)|\/\.|^\/(Dockerfile|server\.ps1|skills-lock\.json)$/i;

http.createServer((req, res) => {
    let pathname;
    try { pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname); }
    catch { res.writeHead(400).end('Bad request'); return; }
    if (BLOCKED.test(pathname)) { res.writeHead(404).end('Not found'); return; }

    let file = path.join(ROOT, pathname);
    if (file !== ROOT && !file.startsWith(ROOT + path.sep)) { res.writeHead(403).end('Forbidden'); return; }
    if (fs.existsSync(file) && fs.statSync(file).isDirectory()) {
        if (!pathname.endsWith('/')) { res.writeHead(301, { Location: pathname + '/' }).end(); return; }
        file = path.join(file, 'index.html');
    }
    if (!fs.existsSync(file) || !MIME[path.extname(file).toLowerCase()]) { res.writeHead(404).end('Not found'); return; }

    const { size } = fs.statSync(file);
    const headers = { 'Content-Type': MIME[path.extname(file).toLowerCase()], 'Accept-Ranges': 'bytes', 'Cache-Control': 'no-cache' };
    const range = /^bytes=(\d*)-(\d*)$/.exec(req.headers.range || '');
    if (range && (range[1] || range[2])) {
        const start = range[1] ? Number(range[1]) : Math.max(0, size - Number(range[2]));
        const end = range[1] && range[2] ? Math.min(Number(range[2]), size - 1) : size - 1;
        if (start > end || start >= size) { res.writeHead(416, { 'Content-Range': `bytes */${size}` }).end(); return; }
        res.writeHead(206, { ...headers, 'Content-Range': `bytes ${start}-${end}/${size}`, 'Content-Length': end - start + 1 });
        fs.createReadStream(file, { start, end }).pipe(res);
        return;
    }
    res.writeHead(200, { ...headers, 'Content-Length': size });
    fs.createReadStream(file).pipe(res);
}).listen(PORT, '127.0.0.1', () => console.log(`Demo: http://localhost:${PORT}/demo-rediseno/`));
