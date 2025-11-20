import { loadConfig } from '../config.js';
import { NovaPoshtaMCPServer } from '../server.js';

async function runHttpServer() {
  const config = loadConfig();
  const server = new NovaPoshtaMCPServer(config);
  const port = Number.parseInt(process.env.MCP_PORT ?? '3000', 10);
  await server.startHttp(port);
}

runHttpServer().catch(error => {
  console.error('Nova Poshta MCP http server failed to start:', error);
  process.exit(1);
});
