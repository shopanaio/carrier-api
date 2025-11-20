import { loadConfig } from '../config.js';
import { NovaPoshtaMCPServer } from '../server.js';

async function runStdioServer() {
  const config = loadConfig();
  const server = new NovaPoshtaMCPServer(config);
  await server.startStdio();
}

runStdioServer().catch(error => {
  console.error('Nova Poshta MCP stdio server failed to start:', error);
  process.exit(1);
});
