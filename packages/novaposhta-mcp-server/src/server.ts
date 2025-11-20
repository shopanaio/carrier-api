import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import {
  CallToolRequestSchema,
  ListResourcesRequestSchema,
  ListToolsRequestSchema,
  ReadResourceRequestSchema,
  type CallToolRequest,
  isInitializeRequest,
} from '@modelcontextprotocol/sdk/types.js';
import {
  AddressService,
  ReferenceService,
  TrackingService,
  WaybillService,
  createClient,
} from '@shopana/novaposhta-api-client';
import { createFetchHttpTransport } from '@shopana/novaposhta-transport-fetch';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { createServer } from 'http';
import { randomUUID } from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const packageJson = JSON.parse(readFileSync(join(__dirname, '../package.json'), 'utf-8'));

import type { ServerConfig } from './config.js';
import { Logger } from './utils/logger.js';
import { dispatchTool, listAllTools } from './tools/index.js';
import type { ToolArguments, ToolContext } from './types/mcp.js';

export class NovaPoshtaMCPServer {
  private readonly server: Server;
  private readonly logger: Logger;
  private readonly toolContext: ToolContext;
  private readonly transports: Map<string, StreamableHTTPServerTransport> = new Map();

  constructor(private readonly config: ServerConfig) {
    this.logger = new Logger(config.logLevel);
    this.server = new Server(
      {
        name: 'novaposhta-mcp-server',
        version: packageJson.version ?? '0.0.0',
      },
      {
        capabilities: {
          tools: {},
          resources: {},
        },
      },
    );

    const transport = createFetchHttpTransport();
    const client = createClient({
      transport,
      baseUrl: config.baseUrl,
      apiKey: config.apiKey,
    })
      .use(new AddressService())
      .use(new ReferenceService())
      .use(new TrackingService())
      .use(new WaybillService());

    this.toolContext = {
      client: {
        address: client.address,
        reference: client.reference,
        tracking: client.tracking,
        waybill: client.waybill,
      },
      config,
    };

    this.registerHandlers();
  }

  async startStdio(): Promise<void> {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    this.logger.info('Nova Poshta MCP server is listening on stdio');
  }

  async startHttp(port: number = 3000): Promise<void> {
    const httpServer = createServer(async (req, res) => {
      // Health check endpoint
      if (req.url === '/health' && req.method === 'GET') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ status: 'ok', transport: 'streamable-http' }));
        return;
      }

      // MCP Streamable HTTP endpoint - handles POST, GET, DELETE
      if (req.url === '/mcp') {
        try {
          // Read request body for POST requests
          let body: any = undefined;
          if (req.method === 'POST') {
            let rawBody = '';
            for await (const chunk of req) {
              rawBody += chunk.toString();
            }
            if (rawBody) {
              try {
                body = JSON.parse(rawBody);
              } catch (error) {
                this.logger.error('Error parsing request body:', error);
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(
                  JSON.stringify({
                    jsonrpc: '2.0',
                    error: { code: -32700, message: 'Parse error' },
                    id: null,
                  }),
                );
                return;
              }
            }
          }

          const sessionId = req.headers['mcp-session-id'] as string | undefined;

          let transport: StreamableHTTPServerTransport;

          if (sessionId && this.transports.has(sessionId)) {
            // Reuse existing transport for this session
            transport = this.transports.get(sessionId)!;
            this.logger.debug(`Reusing transport for session ${sessionId}`);
          } else if (!sessionId && req.method === 'POST' && isInitializeRequest(body)) {
            // New initialization request - create new transport
            this.logger.info('Creating new MCP session');
            transport = new StreamableHTTPServerTransport({
              sessionIdGenerator: () => randomUUID(),
              onsessioninitialized: sid => {
                this.logger.info(`Session initialized: ${sid}`);
                this.transports.set(sid, transport);
              },
              onsessionclosed: sid => {
                this.logger.info(`Session closed: ${sid}`);
                this.transports.delete(sid);
              },
            });

            // Set up transport close handler
            transport.onclose = () => {
              const sid = transport.sessionId;
              if (sid && this.transports.has(sid)) {
                this.logger.info(`Transport closed for session ${sid}`);
                this.transports.delete(sid);
              }
            };

            // Connect transport to server
            await this.server.connect(transport);
          } else {
            // Invalid request
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(
              JSON.stringify({
                jsonrpc: '2.0',
                error: {
                  code: -32000,
                  message: 'Bad Request: No valid session ID or not an initialization request',
                },
                id: null,
              }),
            );
            return;
          }

          // Handle the request using the transport
          await transport.handleRequest(req, res, body);
        } catch (error) {
          this.logger.error('Error handling MCP request:', error);
          if (!res.headersSent) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(
              JSON.stringify({
                jsonrpc: '2.0',
                error: { code: -32603, message: 'Internal server error' },
                id: null,
              }),
            );
          }
        }
        return;
      }

      // 404 for unknown endpoints
      res.writeHead(404);
      res.end('Not Found');
    });

    httpServer.listen(port, () => {
      this.logger.info(`Nova Poshta MCP server is listening on http://localhost:${port}`);
      this.logger.info(`MCP endpoint: http://localhost:${port}/mcp`);
      this.logger.info(`Health check: http://localhost:${port}/health`);
      this.logger.info('Transport: Streamable HTTP (MCP 2025-03-26)');
    });

    // Handle shutdown
    process.on('SIGINT', async () => {
      this.logger.info('Shutting down server...');
      for (const [sessionId, transport] of this.transports.entries()) {
        try {
          this.logger.info(`Closing transport for session ${sessionId}`);
          await transport.close();
          this.transports.delete(sessionId);
        } catch (error) {
          this.logger.error(`Error closing transport for session ${sessionId}:`, error);
        }
      }
      this.logger.info('Server shutdown complete');
      process.exit(0);
    });
  }

  private registerHandlers(): void {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: listAllTools(),
    }));

    this.server.setRequestHandler(CallToolRequestSchema, async (request: CallToolRequest) => {
      const { name, arguments: args } = request.params;
      this.logger.debug(`Tool call: ${name}`, args);
      const result = await dispatchTool(name, (args ?? {}) as ToolArguments, this.toolContext);
      return result;
    });

    this.server.setRequestHandler(ListResourcesRequestSchema, async () => ({
      resources: [
        {
          uri: 'novaposhta://docs/api',
          name: 'Nova Poshta API Documentation',
          description: 'https://devcenter.novaposhta.ua/',
          mimeType: 'text/uri-list',
        },
        {
          uri: 'novaposhta://docs/tracking',
          name: 'Tracking Guide',
          description: 'Tips for tracking shipments via MCP tools.',
          mimeType: 'text/plain',
        },
      ],
    }));

    this.server.setRequestHandler(ReadResourceRequestSchema, async request => {
      switch (request.params.uri) {
        case 'novaposhta://docs/api':
          return {
            contents: [
              {
                uri: request.params.uri,
                text: 'Nova Poshta API docs: https://devcenter.novaposhta.ua/',
                mimeType: 'text/plain',
              },
            ],
          };
        case 'novaposhta://docs/tracking':
          return {
            contents: [
              {
                uri: request.params.uri,
                text:
                  'Tracking instructions: use track_document for single EN, track_multiple_documents for batches, and get_document_movement for history.',
                mimeType: 'text/plain',
              },
            ],
          };
        default:
          return {
            contents: [
              {
                uri: request.params.uri,
                text: `Resource ${request.params.uri} is not available.`,
                mimeType: 'text/plain',
              },
            ],
          };
      }
    });
  }
}
