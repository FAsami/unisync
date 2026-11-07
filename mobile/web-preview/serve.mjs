// Serves the web preview build and forwards /api to the .NET API, so the
// browser sees one origin (the API needs no CORS for the preview).
//   node web-preview/serve.mjs [port] [apiOrigin]
import http from 'node:http'
import fs from 'node:fs'
import path from 'node:path'

const port = Number(process.argv[2] ?? 8090)
const api = new URL(process.argv[3] ?? 'http://127.0.0.1:9202')
const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..', 'dist-web-preview')
const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml', '.ttf': 'font/ttf', '.ico': 'image/x-icon' }

http.createServer((req, res) => {
  if (req.url.startsWith('/api/')) {
    const upstream = http.request({ hostname: api.hostname, port: api.port, path: req.url, method: req.method, headers: { ...req.headers, host: api.host } }, (r) => {
      res.writeHead(r.statusCode, r.headers)
      r.pipe(res)
    })
    upstream.on('error', () => { res.writeHead(502); res.end('API unreachable') })
    req.pipe(upstream)
    return
  }
  const clean = decodeURIComponent(req.url.split('?')[0])
  const candidates = [clean, `${clean}.html`, path.join(clean, 'index.html'), '/index.html']
  const file = candidates.map((c) => path.join(root, c)).find((f) => f.startsWith(root) && fs.existsSync(f) && fs.statSync(f).isFile())
  res.writeHead(200, { 'Content-Type': types[path.extname(file)] ?? 'application/octet-stream' })
  fs.createReadStream(file).pipe(res)
}).listen(port, () => console.log(`preview on http://127.0.0.1:${port} -> API ${api.origin}`))
