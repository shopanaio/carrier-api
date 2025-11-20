import { loadConfig } from '../config.js';
import { NovaPoshtaMCPServer } from '../server.js';

async function main() {
  const args = process.argv.slice(2);
  const isHttpMode = args.includes('--http') || args.includes('-http');

  const config = loadConfig();
  const server = new NovaPoshtaMCPServer(config);

  if (isHttpMode) {
    const port = Number.parseInt(process.env.MCP_PORT ?? '3000', 10);
    console.error(`Starting Nova Poshta MCP HTTP server on port ${port}...`);
    await server.startHttp(port);
  } else {
    console.error('Starting Nova Poshta MCP stdio server...');
    await server.startStdio();
  }
}

main().catch(error => {
  console.error('Nova Poshta MCP server failed to start:', error);
  process.exit(1);
});
