import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';

const files = new Map([
  ['/', ['index.html', 'text/html; charset=utf-8']],
  ['/index.html', ['index.html', 'text/html; charset=utf-8']],
  ['/style.css', ['style.css', 'text/css; charset=utf-8']],
  ['/app.js', ['app.js', 'text/javascript; charset=utf-8']],
  ['/quiz.js', ['quiz.js', 'text/javascript; charset=utf-8']],
  ['/questions.js', ['questions.js', 'text/javascript; charset=utf-8']],
  ['/favicon.svg', ['favicon.svg', 'image/svg+xml']],
  ['/physics-lab.jpg', ['physics-lab.jpg', 'image/jpeg']],
]);

const port = Number(process.env.PORT || 4173);
createServer(async (request, response) => {
  const match = files.get(request.url?.split('?')[0]);
  if (!match) {
    response.writeHead(404).end('Not found');
    return;
  }

  try {
    const [file, mime] = match;
    const body = await readFile(new URL(file, import.meta.url));
    response.writeHead(200, { 'Content-Type': mime, 'Cache-Control': 'no-cache' });
    response.end(request.method === 'HEAD' ? undefined : body);
  } catch {
    response.writeHead(500).end('Unable to read the requested file.');
  }
}).listen(port, '127.0.0.1', () => console.log(`http://127.0.0.1:${port}`));
