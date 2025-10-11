import { request as httpRequest } from 'http';
import { request as httpsRequest } from 'https';

// Minimal custom transport: HTTP POST JSON with Node's http/https modules
export function createNodeHttpTransport() {
  return async ({ url, body, signal }: { url: string; body: unknown; signal?: AbortSignal }) => {
    return new Promise<{ status: number; data: any }>((resolve, reject) => {
      try {
        const u = new URL(url);
        const isHttps = u.protocol === 'https:';
        const reqFn = isHttps ? httpsRequest : httpRequest;
        const payload = JSON.stringify(body);

        const req = reqFn(
          {
            method: 'POST',
            hostname: u.hostname,
            port: u.port ? Number(u.port) : isHttps ? 443 : 80,
            path: `${u.pathname}${u.search}`,
            headers: {
              'Content-Type': 'application/json',
              Accept: 'application/json',
              'Content-Length': Buffer.byteLength(payload).toString(),
            },
          },
          res => {
            let raw = '';
            res.setEncoding('utf8');
            res.on('data', chunk => (raw += chunk));
            res.on('end', () => {
              try {
                const data = raw ? JSON.parse(raw) : {};
                resolve({ status: res.statusCode || 0, data });
              } catch (e) {
                reject(e);
              }
            });
          },
        );

        req.on('error', reject);

        if (signal) {
          const onAbort = () => req.destroy(new Error('Aborted'));
          if (signal.aborted) onAbort();
          else {
            signal.addEventListener('abort', onAbort, { once: true });
            req.on('close', () => signal.removeEventListener('abort', onAbort));
          }
        }

        req.write(payload);
        req.end();
      } catch (err) {
        reject(err);
      }
    });
  };
}
