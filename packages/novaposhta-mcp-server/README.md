# Nova Poshta MCP Server

<div align="center">

[![npm version](https://img.shields.io/npm/v/@shopana/novaposhta-mcp-server.svg?style=flat-square)](https://www.npmjs.com/package/@shopana/novaposhta-mcp-server)
[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg?style=flat-square)](https://www.apache.org/licenses/LICENSE-2.0)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg?style=flat-square)](https://www.typescriptlang.org/)
[![MCP](https://img.shields.io/badge/MCP-1.22+-green.svg?style=flat-square)](https://modelcontextprotocol.io)

**Model Context Protocol (MCP) server for Nova Poshta API integration with AI assistants**

[Features](#features) • [Installation](#installation) • [Quick Start](#quick-start) • [Documentation](#available-tools) • [Examples](#usage-examples)

</div>

---

## Overview

`@shopana/novaposhta-mcp-server` is a production-ready MCP server that exposes Nova Poshta postal services to AI assistants like Claude Desktop, Claude Code, and other MCP-compatible clients. Built on top of the type-safe [@shopana/novaposhta-api-client](../novaposhta-api-client), it provides seamless access to tracking, address search, waybill management, and reference data.

## Features

- **Comprehensive Tracking**: Track single/multiple shipments, view movement history, and list documents
- **Address Discovery**: Search cities, settlements, streets, and warehouses with advanced filtering
- **Waybill Operations**: Calculate costs, create, update, and delete waybills programmatically
- **Reference Data**: Access cargo types, service types, payment methods, and more
- **Dual Transport**: Supports both stdio (Claude Desktop/Code) and HTTP transports
- **Type-Safe**: Built with TypeScript for full type safety
- **Production-Ready**: Enterprise-grade error handling and logging
- **Zero Configuration**: Works out of the box with sensible defaults

## Installation

### For Claude Desktop / Claude Code (Recommended)

Add to your MCP configuration file:

**macOS/Linux**: `~/.mcp.json` or `~/Library/Application Support/Claude/claude_desktop_config.json`
**Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "novaposhta": {
      "command": "npx",
      "args": ["-y", "-p", "@shopana/novaposhta-mcp-server", "novaposhta-mcp"],
      "env": {
        "NOVA_POSHTA_API_KEY": "your_api_key_here",
        "NOVA_POSHTA_SYSTEM": "DevCentre",
        "LOG_LEVEL": "info"
      }
    }
  }
}
```

### For Local Development

```bash
# Install in the workspace
yarn install

# Build the server
yarn workspace @shopana/novaposhta-mcp-server build

# Add to your .mcp.json
{
  "mcpServers": {
    "novaposhta-stdio": {
      "type": "stdio",
      "command": "/absolute/path/to/carrier-api/packages/novaposhta-mcp-server/dist/cli.js",
      "env": {
        "NOVA_POSHTA_API_KEY": "your_api_key_here",
        "LOG_LEVEL": "info"
      }
    }
  }
}
```

### As NPM Package (Global)

```bash
npm install -g @shopana/novaposhta-mcp-server

# Then reference in your config
{
  "mcpServers": {
    "novaposhta": {
      "command": "novaposhta-mcp",
      "env": {
        "NOVA_POSHTA_API_KEY": "your_api_key_here"
      }
    }
  }
}
```

## Quick Start

### 1. Get Your API Key

1. Sign up at [Nova Poshta](https://my.novaposhta.ua/)
2. Navigate to Settings → API Keys
3. Generate a new API key

### 2. Configure the Server

Create or update your `.mcp.json`:

```json
{
  "mcpServers": {
    "novaposhta": {
      "command": "npx",
      "args": ["-y", "-p", "@shopana/novaposhta-mcp-server", "novaposhta-mcp"],
      "env": {
        "NOVA_POSHTA_API_KEY": "your_actual_api_key_here",
        "NOVA_POSHTA_SYSTEM": "DevCentre",
        "LOG_LEVEL": "info"
      }
    }
  }
}
```

### 3. Restart Your MCP Client

- **Claude Desktop**: Restart the application
- **Claude Code**: Reload the MCP server or restart Claude Code

### 4. Start Using

Ask Claude:
- "Track Nova Poshta package 20450123456789"
- "Find warehouses in Kyiv"
- "Calculate shipping cost from Kyiv to Lviv for 5kg package"
- "Search for streets in Kharkiv"

## Configuration

### Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `NOVA_POSHTA_API_KEY` | Yes | - | Your Nova Poshta API key |
| `NOVA_POSHTA_BASE_URL` | No | `https://api.novaposhta.ua/v2.0/json/` | API base URL |
| `NOVA_POSHTA_SYSTEM` | No | - | System identifier (e.g., `DevCentre` for development/testing) |
| `LOG_LEVEL` | No | `info` | Logging level: `debug`, `info`, `warn`, `error` |
| `MCP_PORT` | No | `3000` | HTTP server port (HTTP mode only) |

### Transport Modes

#### stdio (Default)
Best for local AI assistants like Claude Desktop and Claude Code:

```bash
novaposhta-mcp
# or
node dist/cli.js
```

#### HTTP
Best for cloud deployments and proxy scenarios:

```bash
novaposhta-mcp --http
# or
node dist/cli.js --http
```

The HTTP server exposes:
- `POST /mcp` - MCP streamable HTTP endpoint
- `GET /health` - Health check endpoint

## Available Tools

### Tracking Tools

#### `track_document`
Track a single shipment with detailed status information.

**Parameters:**
- `documentNumber` (string, required): 14-digit tracking number
- `phone` (string, optional): Recipient phone in format `380XXXXXXXXX`

**Example:**
```typescript
{
  "documentNumber": "20450123456789",
  "phone": "380501234567"
}
```

#### `track_multiple_documents`
Track multiple shipments at once with aggregated statistics.

**Parameters:**
- `documentNumbers` (array, required): List of tracking numbers

**Example:**
```typescript
{
  "documentNumbers": ["20450123456789", "20450987654321"]
}
```

#### `get_document_movement`
Get complete movement history for shipments.

**Parameters:**
- `documentNumbers` (array, required): List of tracking numbers (max 10)
- `showDeliveryDetails` (boolean, optional): Include extended delivery checkpoints

**Example:**
```typescript
{
  "documentNumbers": ["20450123456789"],
  "showDeliveryDetails": true
}
```

#### `get_document_list`
List documents created within a date range.

**Parameters:**
- `dateTimeFrom` (string, required): Start date in format `dd.mm.yyyy`
- `dateTimeTo` (string, required): End date in format `dd.mm.yyyy`
- `page` (number, optional): Page number (default: 1)
- `fullList` (boolean, optional): Request all results ignoring pagination

**Example:**
```typescript
{
  "dateTimeFrom": "01.01.2025",
  "dateTimeTo": "31.01.2025",
  "page": 1
}
```

---

### Address Tools

#### `address_search_cities`
Search for cities by name or postal code.

**Parameters:**
- `query` (string, required): Partial city name or postal code
- `page` (number, optional): Page number (default: 1)
- `limit` (number, optional): Items per page (max: 50, **recommended: 10**, default: 10)

**Example:**
```typescript
{
  "query": "Київ",
  "limit": 10
}
```

**Note:** Always specify `limit` to avoid large responses that may consume excessive tokens.

#### `address_search_settlements`
Search for settlements (cities, towns, villages).

**Parameters:**
- `cityName` (string, required): Settlement name or postal code
- `page` (number, optional): Page number (default: 1)
- `limit` (number, optional): Items per page (1-500, **recommended: 10**, default: 10)

**Example:**
```typescript
{
  "cityName": "Львів",
  "limit": 10
}
```

**Note:** Always specify `limit` to avoid large responses that may consume excessive tokens.

#### `address_search_streets`
Search for streets within a settlement.

**Parameters:**
- `settlementRef` (string, required): Settlement reference ID
- `streetName` (string, required): Street name or fragment
- `limit` (number, optional): Maximum items to return (**recommended: 10**, default: 10)

**Example:**
```typescript
{
  "settlementRef": "8d5a980d-391c-11dd-90d9-001a92567626",
  "streetName": "Хрещатик",
  "limit": 10
}
```

**Note:** Always specify `limit` to avoid large responses that may consume excessive tokens.

#### `address_get_warehouses`
Find warehouses (branches, postomats, pickup points) with advanced filtering.

**Parameters:**
- `ref` (string, optional): Specific warehouse reference
- `cityName` (string, optional): City name filter
- `cityRef` (string, optional): City reference ID
- `settlementRef` (string, optional): Settlement reference ID
- `warehouseId` (string, optional): Warehouse number (e.g., "1" for Branch #1)
- `findByString` (string, optional): Search by name, address, or street
- `typeOfWarehouseRef` (string, optional): Warehouse type filter
- `bicycleParking` (string, optional): Filter by bicycle parking (`1`/`0`)
- `postFinance` (string, optional): Filter by NovaPay cash desk (`1`/`0`)
- `posTerminal` (string, optional): Filter by POS terminal (`1`/`0`)
- `page` (number, optional): Page number (default: 1)
- `limit` (number, optional): Items per page (max: 50, **recommended: 10-20**, default: 10)
- `language` (string, optional): Language code (`UA`, `RU`, `EN`)

**Example:**
```typescript
{
  "cityName": "Київ",
  "typeOfWarehouseRef": "9a68df70-0267-42a8-bb5c-37f427e36ee4", // Branch
  "posTerminal": "1",
  "limit": 10
}
```

**Note:** Always specify `limit` to avoid large responses that may consume excessive tokens.

---

### Waybill Tools

#### `waybill_calculate_cost`
Calculate delivery cost and estimated delivery date.

**Parameters:**
- `citySender` (string): Sender city reference
- `cityRecipient` (string): Recipient city reference
- `serviceType` (string): Service type (e.g., `WarehouseWarehouse`)
- `weight` (number): Weight in kg
- `cost` (number): Declared value in UAH
- `cargoType` (string): Cargo type (e.g., `Parcel`)
- `seatsAmount` (number): Number of seats

Or use `request` object for raw API payload.

**Example:**
```typescript
{
  "citySender": "8d5a980d-391c-11dd-90d9-001a92567626",
  "cityRecipient": "db5c88f0-391c-11dd-90d9-001a92567626",
  "serviceType": "WarehouseWarehouse",
  "weight": 5,
  "cost": 1000,
  "cargoType": "Parcel",
  "seatsAmount": 1
}
```

#### `waybill_create`
Create a new waybill (Internet document).

**Parameters:**
- `request` (object, required): Complete waybill creation payload

Refer to [Nova Poshta API Documentation](https://developers.novaposhta.ua/) for the full request schema.

#### `waybill_update`
Update an existing waybill.

**Parameters:**
- `request` (object, required): Update payload including `DocumentRef`

#### `waybill_delete`
Delete one or multiple waybills.

**Parameters:**
- `documentRefs` (array, required): Array of document references to delete

**Example:**
```typescript
{
  "documentRefs": ["20450123456789-1234"]
}
```

#### `waybill_get_delivery_date`
Get estimated delivery date for a route.

**Parameters:**
- `citySender` (string): Sender city reference
- `cityRecipient` (string): Recipient city reference
- `serviceType` (string): Service type
- `dateTime` (string, optional): Shipment date in format `dd.mm.yyyy`

Or use `request` object for raw API payload.

---

### Reference Tools

#### `reference_get_cargo_types`
List all available cargo types.

**Example response:** `Parcel`, `Documents`, `TiresWheels`, `Pallet`, etc.

#### `reference_get_service_types`
List all delivery service types.

**Example response:** `WarehouseWarehouse`, `WarehouseDoors`, `DoorsWarehouse`, `DoorsDoors`

#### `reference_get_payment_methods`
List available payment methods.

**Example response:** `Cash`, `NonCash`, etc.

#### `reference_get_pallet_types`
Get pallet types with dimensions and weight specifications.

#### `reference_get_time_intervals`
Get available delivery time intervals for a recipient city.

**Parameters:**
- `recipientCityRef` (string, required): Recipient city reference
- `dateTime` (string, optional): Specific date in format `dd.mm.yyyy`

**Example:**
```typescript
{
  "recipientCityRef": "8d5a980d-391c-11dd-90d9-001a92567626",
  "dateTime": "20.01.2025"
}
```

#### `reference_get_ownership_forms`
List corporate ownership forms (required for counterparty creation).

#### `reference_decode_message`
Decode Nova Poshta API message codes into human-readable text.

**Parameters:**
- `code` (string, required): Message code (e.g., `20000200039`)

**Example:**
```typescript
{
  "code": "20000200039"
}
```

## Usage Examples

### Tracking a Shipment

**Prompt to Claude:**
```
Track Nova Poshta package 20450123456789
```

**What happens:**
Claude will use `track_document` tool and return detailed status including current location, estimated delivery, and recipient information.

---

### Finding Warehouses

**Prompt to Claude:**
```
Find all Nova Poshta branches in Lviv that have POS terminals
```

**What happens:**
Claude will:
1. Use `address_search_cities` to find Lviv city reference (with `limit: 10`)
2. Use `address_get_warehouses` with filters:
   - `cityName`: "Львів"
   - `typeOfWarehouseRef`: Branch type
   - `posTerminal`: "1"
   - `limit`: 10 (to avoid large responses)

---

### Calculating Delivery Cost

**Prompt to Claude:**
```
Calculate shipping cost for 10kg parcel from Kyiv to Odesa, warehouse to warehouse, declared value 2000 UAH
```

**What happens:**
Claude will:
1. Find city references for Kyiv and Odesa
2. Use `waybill_calculate_cost` with parameters
3. Return cost breakdown and estimated delivery date

---

### Multi-Document Tracking

**Prompt to Claude:**
```
Track these packages: 20450123456789, 20450987654321, 20451234567890 and give me a summary
```

**What happens:**
Claude uses `track_multiple_documents` and provides aggregated statistics: delivered, in transit, pending pickup, etc.

## Integration Examples

### Claude Desktop

```json
{
  "mcpServers": {
    "novaposhta": {
      "command": "npx",
      "args": ["-y", "-p", "@shopana/novaposhta-mcp-server", "novaposhta-mcp"],
      "env": {
        "NOVA_POSHTA_API_KEY": "your_api_key",
        "NOVA_POSHTA_SYSTEM": "DevCentre",
        "LOG_LEVEL": "info"
      }
    }
  }
}
```

### Claude Code

Create `.mcp.json` in your project root or home directory:

```json
{
  "mcpServers": {
    "novaposhta-stdio": {
      "type": "stdio",
      "command": "/path/to/dist/cli.js",
      "env": {
        "NOVA_POSHTA_API_KEY": "your_api_key",
        "NOVA_POSHTA_SYSTEM": "DevCentre",
        "LOG_LEVEL": "debug"
      }
    }
  }
}
```

### HTTP Mode (Cloud Deployment)

```json
{
  "mcpServers": {
    "novaposhta-http": {
      "type": "http",
      "url": "https://your-domain.com/mcp",
      "env": {
        "NOVA_POSHTA_API_KEY": "your_api_key",
        "NOVA_POSHTA_SYSTEM": "DevCentre",
        "LOG_LEVEL": "info"
      }
    }
  }
}
```

Deploy with Docker:

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY . .
RUN yarn install && yarn build
ENV NOVA_POSHTA_API_KEY=your_key
ENV NOVA_POSHTA_SYSTEM=DevCentre
ENV MCP_PORT=3000
EXPOSE 3000
CMD ["node", "dist/cli.js", "--http"]
```

## Development

### Setup

```bash
# Install dependencies
yarn install

# Build all packages
yarn build

# Build MCP server only
yarn build:mcp
```

### Running in Development

```bash
# stdio mode (default)
NOVA_POSHTA_API_KEY=your_key yarn dev:mcp:stdio

# HTTP mode
NOVA_POSHTA_API_KEY=your_key yarn dev:mcp:http
```

### Testing

```bash
# Run tests
yarn test:mcp

# Run tests in watch mode
yarn test:mcp --watch

# Test with real API (requires .env file)
cd packages/novaposhta-mcp-server
cp .env.example .env
# Edit .env and add your API key
./test-mcp.sh
```

### Project Structure

```
packages/novaposhta-mcp-server/
├── src/
│   ├── cli/           # CLI entry points
│   ├── tools/         # MCP tool implementations
│   │   ├── address.ts
│   │   ├── tracking.ts
│   │   ├── waybill.ts
│   │   └── reference.ts
│   ├── types/         # TypeScript type definitions
│   ├── utils/         # Utilities (logging, validation, etc.)
│   ├── config.ts      # Configuration management
│   └── server.ts      # MCP server implementation
├── dist/              # Compiled output
├── examples/          # Usage examples
├── tests/             # Test suites
└── package.json
```

## Debugging

Enable debug logging:

```json
{
  "env": {
    "LOG_LEVEL": "debug"
  }
}
```

Check logs:
- **stdio mode**: Logs are written to stderr
- **HTTP mode**: Logs are written to console and available in server logs

Common issues:
1. **API Key errors**: Verify your API key is correct and not expired
2. **Connection issues**: Check your internet connection and firewall settings
3. **Tool not found**: Ensure you're using the latest version of the server

## API Rate Limits

Nova Poshta API has the following limits:
- **Free accounts**: 500 requests per day
- **Paid accounts**: Higher limits based on plan

The MCP server automatically handles rate limiting and provides meaningful error messages.

## Contributing

We welcome contributions! Please see [CONTRIBUTING.md](../../CONTRIBUTING.md) for guidelines.

### Development Workflow

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Make your changes
4. Add tests for new functionality
5. Run tests: `yarn test:mcp`
6. Commit with conventional commits: `git commit -m "feat: add new tool"`
7. Push and create a Pull Request

## License

Apache License 2.0 - see [LICENSE](./LICENSE) for details.

## Links

- [Nova Poshta API Documentation](https://developers.novaposhta.ua/)
- [Model Context Protocol](https://modelcontextprotocol.io)
- [MCP SDK](https://github.com/modelcontextprotocol/sdk)
- [Claude Desktop](https://claude.ai/download)
- [Claude Code](https://docs.claude.com/claude-code)

## Support

- **Issues**: [GitHub Issues](https://github.com/shopanaio/carrier-api/issues)
- **Discussions**: [GitHub Discussions](https://github.com/shopanaio/carrier-api/discussions)
- **Email**: support@shopana.io

---

<div align="center">

Made with ❤️ by [Shopana IO](https://shopana.io)

[⬆ Back to Top](#nova-poshta-mcp-server)

</div>
