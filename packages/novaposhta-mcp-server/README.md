# Nova Poshta MCP Server

<div align="center">

[![npm version](https://img.shields.io/npm/v/@shopana/novaposhta-mcp-server.svg?style=flat-square)](https://www.npmjs.com/package/@shopana/novaposhta-mcp-server)
[![MCP Registry](https://img.shields.io/badge/MCP_Registry-Published-green.svg?style=flat-square)](https://registry.modelcontextprotocol.io/v0.1/servers?search=io.github.shopanaio/novaposhta)
[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg?style=flat-square)](https://www.apache.org/licenses/LICENSE-2.0)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg?style=flat-square)](https://www.typescriptlang.org/)
[![MCP](https://img.shields.io/badge/MCP-1.22+-green.svg?style=flat-square)](https://modelcontextprotocol.io)

**Model Context Protocol (MCP) server for Nova Poshta API integration with AI assistants**

**✨ Now available in the [MCP Registry](https://registry.modelcontextprotocol.io/v0.1/servers?search=io.github.shopanaio/novaposhta)!**

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

### From MCP Registry (Easiest)

This server is published in the [MCP Registry](https://registry.modelcontextprotocol.io/v0.1/servers?search=io.github.shopanaio/novaposhta) as `io.github.shopanaio/novaposhta`.

MCP-compatible clients can discover and install it automatically. For manual installation, see options below.

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
- `DocumentNumber` (string, required): 14-digit tracking number
- `phone` (string, optional): Recipient phone in format `380XXXXXXXXX`

**Example:**
```typescript
{
  "DocumentNumber": "20450123456789",
  "phone": "380501234567"
}
```

#### `track_multiple_documents`
Track multiple shipments at once with aggregated statistics.

**Parameters:**
- `DocumentNumbers` (array, required): List of tracking numbers

**Example:**
```typescript
{
  "DocumentNumbers": ["20450123456789", "20450987654321"]
}
```

#### `get_document_movement`
Get complete movement history for shipments.

**Parameters:**
- `DocumentNumbers` (array, required): List of tracking numbers (max 10)
- `ShowDeliveryDetails` (boolean, optional): Include extended delivery checkpoints

**Example:**
```typescript
{
  "DocumentNumbers": ["20450123456789"],
  "ShowDeliveryDetails": true
}
```

#### `get_document_list`
List documents created within a date range.

**Parameters:**
- `DateTimeFrom` (string, required): Start date in format `dd.mm.yyyy`
- `DateTimeTo` (string, required): End date in format `dd.mm.yyyy`
- `Page` (number, optional): Page number (default: 1)
- `GetFullList` (string, optional): Use `"1"` to request all results ignoring pagination

**Example:**
```typescript
{
  "DateTimeFrom": "01.01.2025",
  "DateTimeTo": "31.01.2025",
  "Page": 1
}
```

---

### Address Tools

#### `address_search_cities`
Search for cities by name or postal code.

**Parameters:**
- `FindByString` (string, required): Partial city name or postal code
- `Page` (number, optional): Page number (default: 1)
- `Limit` (number, optional): Items per page (max: 50, **recommended: 10**, default: 10)

**Example:**
```typescript
{
  "FindByString": "Київ",
  "Limit": 10
}
```

**Note:** Always specify `Limit` to avoid large responses that may consume excessive tokens.

#### `address_search_settlements`
Search for settlements (cities, towns, villages).

**Parameters:**
- `CityName` (string, required): Settlement name or postal code
- `Page` (number, optional): Page number (default: 1)
- `Limit` (number, optional): Items per page (1-500, **recommended: 10**, default: 10)

**Example:**
```typescript
{
  "CityName": "Львів",
  "Limit": 10
}
```

**Note:** Always specify `Limit` to avoid large responses that may consume excessive tokens.

#### `address_search_streets`
Search for streets within a settlement.

**Parameters:**
- `SettlementRef` (string, required): Settlement reference ID
- `StreetName` (string, required): Street name or fragment
- `Limit` (number, optional): Maximum items to return (**recommended: 10**, default: 10)

**Example:**
```typescript
{
  "SettlementRef": "8d5a980d-391c-11dd-90d9-001a92567626",
  "StreetName": "Хрещатик",
  "Limit": 10
}
```

**Note:** Always specify `Limit` to avoid large responses that may consume excessive tokens.

#### `address_get_warehouses`
Find warehouses (branches, postomats, pickup points) with advanced filtering.

**Parameters:**
- `Ref` (string, optional): Specific warehouse reference
- `CityName` (string, optional): City name filter
- `CityRef` (string, optional): City reference ID
- `SettlementRef` (string, optional): Settlement reference ID
- `WarehouseId` (string, optional): Warehouse number (e.g., "1" for Branch #1)
- `FindByString` (string, optional): Search by name, address, or street
- `TypeOfWarehouseRef` (string, optional): Warehouse type filter
- `BicycleParking` (string, optional): Filter by bicycle parking (`1`/`0`)
- `PostFinance` (string, optional): Filter by NovaPay cash desk (`1`/`0`)
- `POSTerminal` (string, optional): Filter by POS terminal (`1`/`0`)
- `Page` (number, optional): Page number (default: 1)
- `Limit` (number, optional): Items per page (max: 50, **recommended: 10-20**, default: 10)
- `Language` (string, optional): Language code (`UA`, `RU`, `EN`)

**Example:**
```typescript
{
  "CityName": "Київ",
  "TypeOfWarehouseRef": "9a68df70-0267-42a8-bb5c-37f427e36ee4", // Branch
  "POSTerminal": "1",
  "Limit": 10
}
```

**Note:** Always specify `Limit` to avoid large responses that may consume excessive tokens.

---

### Waybill Tools

#### `waybill_calculate_cost`
Calculate delivery cost and estimated delivery date.

**Parameters:**
- `CitySender` (string): Sender city reference
- `CityRecipient` (string): Recipient city reference
- `ServiceType` (string): Service type (e.g., `WarehouseWarehouse`)
- `Weight` (number): Weight in kg
- `Cost` (number): Declared value in UAH
- `CargoType` (string): Cargo type (e.g., `Parcel`)
- `SeatsAmount` (number): Number of seats

Or use `request` object for raw API payload.

**Example:**
```typescript
{
  "CitySender": "8d5a980d-391c-11dd-90d9-001a92567626",
  "CityRecipient": "db5c88f0-391c-11dd-90d9-001a92567626",
  "ServiceType": "WarehouseWarehouse",
  "Weight": 5,
  "Cost": 1000,
  "CargoType": "Parcel",
  "SeatsAmount": 1
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
- `DocumentRefs` (array, required): Array of document references to delete

**Example:**
```typescript
{
  "documentRefs": ["20450123456789-1234"]
}
```

#### `waybill_get_delivery_date`
Get estimated delivery date for a route.

**Parameters:**
- `CitySender` (string): Sender city reference
- `CityRecipient` (string): Recipient city reference
- `ServiceType` (string): Service type
- `DateTime` (string, optional): Shipment date in format `dd.mm.yyyy`

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
- `RecipientCityRef` (string, required): Recipient city reference
- `DateTime` (string, optional): Specific date in format `dd.mm.yyyy`

**Example:**
```typescript
{
  "RecipientCityRef": "8d5a980d-391c-11dd-90d9-001a92567626",
  "DateTime": "20.01.2025"
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
1. Use `address_search_cities` to find Lviv city reference (with `Limit: 10`)
2. Use `address_get_warehouses` with filters:
   - `CityName`: "Львів"
   - `TypeOfWarehouseRef`: Branch type
   - `POSTerminal`: "1"
   - `Limit`: 10 (to avoid large responses)

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

## Troubleshooting

### Common Issues

#### Server Not Starting

**Problem**: Server doesn't start or crashes immediately

**Solutions**:
1. Verify API key is set correctly:
   ```bash
   echo $NOVA_POSHTA_API_KEY
   ```
2. Check if port is available (HTTP mode):
   ```bash
   lsof -i :3000
   ```
3. Enable debug logging:
   ```json
   {
     "env": {
       "LOG_LEVEL": "debug"
     }
   }
   ```

#### Tools Not Available in Claude

**Problem**: Claude says it doesn't have access to Nova Poshta tools

**Solutions**:
1. Restart Claude Desktop/Code
2. Verify `.mcp.json` syntax (use a JSON validator)
3. Check server logs for errors
4. Try running the server manually:
   ```bash
   NOVA_POSHTA_API_KEY=your_key node dist/cli.js
   ```

#### Rate Limiting Errors

**Problem**: Getting "rate limit exceeded" errors

**Solutions**:
1. Check your Nova Poshta account limits
2. Implement request throttling in your application
3. Consider upgrading to a paid Nova Poshta plan
4. Use caching for reference data (it changes infrequently)

#### Large Response Warnings

**Problem**: Token consumption warnings or truncated responses

**Solutions**:
1. Always use `Limit` parameter for search operations:
   ```typescript
   client.address.searchCities({ query: 'Kyiv', Limit: 10 })
   ```
2. Use pagination for large datasets
3. Filter results with specific criteria

---

## FAQ

### General Questions

**Q: Do I need a Nova Poshta account to use this?**
A: Yes, you need to register at [my.novaposhta.ua](https://my.novaposhta.ua/) and generate an API key.

**Q: Is this an official Nova Poshta package?**
A: No, this is a community-maintained package. For official API docs, visit [developers.novaposhta.ua](https://developers.novaposhta.ua/).

**Q: What's the difference between stdio and HTTP modes?**
A: Stdio is for local AI assistants (Claude Desktop/Code), while HTTP is for cloud deployments and proxy scenarios.

**Q: Can I use this in production?**
A: Yes! The package is production-ready with enterprise-grade error handling. Many companies use it in production.

**Q: Does this support all Nova Poshta API features?**
A: The package covers the most commonly used features. If you need additional functionality, please [open an issue](https://github.com/shopanaio/carrier-api/issues).

### Technical Questions

**Q: How do I cache reference data?**
A: Reference data (cargo types, service types, etc.) changes infrequently. Implement your own caching layer:
```typescript
const cache = new Map();

async function getCachedCargoTypes() {
  if (cache.has('cargoTypes')) {
    return cache.get('cargoTypes');
  }

  const result = await client.reference.getCargoTypes();
  cache.set('cargoTypes', result);

  // Cache for 24 hours
  setTimeout(() => cache.delete('cargoTypes'), 24 * 60 * 60 * 1000);

  return result;
}
```

**Q: Can I run multiple MCP servers?**
A: Yes! Just use different server names in your `.mcp.json`:
```json
{
  "mcpServers": {
    "novaposhta-prod": { ... },
    "novaposhta-test": { ... }
  }
}
```

**Q: How do I handle errors in my application?**
A: The API returns a structured response with `success`, `data`, `errors`, `warnings`, and `info` fields:
```typescript
const result = await tool.execute();

if (!result.success) {
  console.error('API Errors:', result.errors);
  console.warn('Warnings:', result.warnings);
}
```

**Q: Is rate limiting handled automatically?**
A: The MCP server provides error messages when rate limits are hit, but doesn't implement automatic retry logic. Implement this in your application if needed.

---

## Performance Tips

### Optimize API Calls

1. **Use pagination and limits**: Always specify `Limit` parameter to avoid large responses
   ```typescript
   { query: 'Kyiv', Limit: 10 }
   ```

2. **Cache reference data**: Cargo types, service types, etc. rarely change

3. **Batch operations**: Use bulk tracking methods for multiple packages
   ```typescript
   track_multiple_documents({ DocumentNumbers: ['123', '456', '789'] })
   ```

4. **Filter early**: Use specific filters to reduce result sets
   ```typescript
   {
     CityName: 'Київ',
     typeOfWarehouseRef: 'branch-type-ref',
     posTerminal: '1',
     Limit: 5
   }
   ```

### Memory Management

- The MCP server is stateless and doesn't cache responses
- Each request is independent
- For high-volume applications, consider implementing your own caching layer

---

## Security Best Practices

### API Key Management

1. **Never commit API keys**: Use environment variables
2. **Rotate keys regularly**: Generate new keys periodically
3. **Use different keys per environment**: Separate keys for dev/staging/prod
4. **Monitor API usage**: Check Nova Poshta dashboard for unusual activity

### Production Deployment

1. **Use HTTPS**: Always use HTTPS in production (HTTP mode)
2. **Implement rate limiting**: Protect your server from abuse
3. **Add authentication**: Don't expose MCP server publicly without auth
4. **Monitor logs**: Set up log aggregation and alerting
5. **Use secrets management**: Store API keys in a secure vault (AWS Secrets Manager, etc.)

Example with secrets:
```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY . .
RUN yarn install && yarn build

# Never hardcode keys - use runtime secrets
CMD ["sh", "-c", "NOVA_POSHTA_API_KEY=$(cat /run/secrets/np_api_key) node dist/cli.js --http"]
```

---

## Contributing

We welcome contributions from the community! Whether it's bug fixes, new features, documentation improvements, or examples - all contributions are appreciated.

### Development Workflow

1. **Fork the repository**
2. **Clone your fork**:
   ```bash
   git clone https://github.com/your-username/carrier-api.git
   cd carrier-api
   ```
3. **Install dependencies**:
   ```bash
   yarn install
   ```
4. **Create a feature branch**:
   ```bash
   git checkout -b feature/my-amazing-feature
   ```
5. **Make your changes**
6. **Add tests** for new functionality
7. **Run tests**:
   ```bash
   yarn test:mcp
   ```
8. **Build the package**:
   ```bash
   yarn build:mcp
   ```
9. **Commit with conventional commits**:
   ```bash
   git commit -m "feat: add new tracking tool"
   ```
10. **Push and create a Pull Request**

### Coding Standards

- Write clean, readable TypeScript code
- Follow the existing code style
- Add JSDoc comments for public APIs
- Include unit tests for new features
- Update documentation as needed
- Use conventional commits (feat, fix, docs, chore, etc.)

### Adding New Tools

To add a new MCP tool:

1. Create a new file in `src/tools/`
2. Define the tool schema and handler
3. Register the tool in `src/server.ts`
4. Add tests in `tests/`
5. Update documentation

Example:
```typescript
// src/tools/my-new-tool.ts
export const myNewTool = {
  name: 'my_new_tool',
  description: 'Does something awesome',
  inputSchema: {
    type: 'object',
    properties: {
      param: { type: 'string', description: 'A parameter' }
    },
    required: ['param']
  }
};

export async function handleMyNewTool(client, params) {
  // Implementation
  return result;
}
```

---

## Changelog

See [CHANGELOG.md](../../CHANGELOG.md) for a detailed history of changes.

---

## License

Apache License 2.0 - see [LICENSE](./LICENSE) for details.

**What this means:**
- ✅ Commercial use allowed
- ✅ Modification allowed
- ✅ Distribution allowed
- ✅ Patent use allowed
- ✅ Private use allowed
- ⚠️ Liability and warranty limitations apply

## Links

- [MCP Registry](https://registry.modelcontextprotocol.io/v0.1/servers?search=io.github.shopanaio/novaposhta) - Find this server in the official registry
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

Made with ❤️ by [Shopana.io](https://shopana.io)

[⬆ Back to Top](#nova-poshta-mcp-server)

</div>
