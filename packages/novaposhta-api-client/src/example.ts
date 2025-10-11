// code and comments in English
// Example: flat API client with custom Node.js HTTP(S) transport and all services installed

import { request as httpRequest } from 'http';
import { request as httpsRequest } from 'https';

import { createClient } from './core/client';
import { AddressService } from './services/addressService';
import { ReferenceService } from './services/referenceService';
import { TrackingService } from './services/trackingService';
import { WaybillService } from './services/waybillService';

// Minimal custom transport: HTTP POST JSON with Node's http/https modules
function createNodeHttpTransport() {
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

async function main() {
  const client = createClient({
    transport: createNodeHttpTransport(),
    baseUrl: 'https://api.novaposhta.ua/v2.0/json/',
    apiKey: process.env.NP_API_KEY || 'your-api-key',
  })
    .use(new AddressService())
    .use(new ReferenceService())
    .use(new TrackingService())
    .use(new WaybillService());

  // Address API
  const cities = await client.getCities({});
  console.log('Cities success:', cities.success, 'items:', Array.isArray(cities.data) ? cities.data.length : 0);

  // Reference API
  const cargoTypes = await client.getCargoTypes();
  console.log(
    'CargoTypes success:',
    cargoTypes.success,
    'items:',
    Array.isArray(cargoTypes.data) ? cargoTypes.data.length : 0,
  );

  // Tracking API (example number)
  const tracked = await client.trackDocument('20400048799000');
  console.log('Track first item:', tracked);
}

// Run if executed directly
if (require.main === module) {
  main().catch(err => {
    console.error(err);
    process.exit(1);
  });
}
