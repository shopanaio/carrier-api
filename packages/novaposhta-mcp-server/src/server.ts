import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListResourcesRequestSchema,
  ListToolsRequestSchema,
  ReadResourceRequestSchema,
  type CallToolRequest,
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

  async start(): Promise<void> {
    const stdio = new StdioServerTransport();
    await this.server.connect(stdio);
    this.logger.info('Nova Poshta MCP server is listening on stdio');
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
