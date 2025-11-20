import { loadConfig } from '../src/config.js';
import { NovaPoshtaMCPServer } from '../src/server.js';

async function runServer() {
  const config = loadConfig({
    apiKey: process.env.NOVA_POSHTA_API_KEY ?? 'demo-key',
  });

  const server = new NovaPoshtaMCPServer(config);
  await server.start();
}

runServer().catch(error => {
  console.error('Failed to run sample server', error);
  process.exit(1);
});
