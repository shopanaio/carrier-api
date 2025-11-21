<div align="center">

# Nova Poshta MCP Server

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

`@shopana/novaposhta-mcp-server` is a production-ready Nova Poshta MCP server that lets you work with Ukrainian shipping and logistics data directly from AI assistants like [Cursor](https://cursor.com/), [Claude Code](https://code.claude.com/), [OpenAI](https://platform.openai.com/), [Gemini](https://gemini.google.com/) and any other MCP-compatible client.
Built on top of the type-safe [`@shopana/novaposhta-api-client`](../novaposhta-api-client), it turns Nova Poshta’s tracking, address and branch search, waybill management, and reference data into clean, AI-friendly tools — so you can automate routine delivery tasks, speed up developer workflows, and integrate Nova Poshta into your apps with minimal effort.

<img src="docs/demo.gif" />

## Features

- **Comprehensive Tracking**: Track single/multiple shipments, view movement history, and list documents
- **Address Discovery**: Search cities, settlements, streets, and warehouses with advanced filtering
- **Waybill Operations**: Calculate costs, create, update, and delete waybills programmatically
- **Reference Data**: Access cargo types, service types, payment methods, and more
- **Type-Safe**: Built with TypeScript for full type safety
- **Production-Ready**: Enterprise-grade error handling and logging
- **Zero Configuration**: Works out of the box with sensible defaults

## Quick Start

### 1. Get Your API Key (Optional for most operations)

**Note:** API key is only required for waybill operations (create, update, delete). Tracking, address search, and reference data work without authentication.

1. Sign up at [Nova Poshta](https://my.novaposhta.ua/)
2. Navigate to Settings → API Keys
3. Generate a new API key

### 2. Configure the Server

Create or update your `.mcp.json`:

```json
{
  "mcpServers": {
    "novaposhta": {
      "type": "stdio",
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

After updating your MCP configuration, you need to restart or reload your client

### 4. Start Using

Ask Claude:

- "Track Nova Poshta package 20450123456789"
- "Find warehouses in Kyiv"
- "Calculate shipping cost from Kyiv to Lviv for 5kg package"
- "Search for streets in Kharkiv"

## Configuration

### Environment Variables

| Variable              | Required  | Default | Description                                                                                                                        |
| --------------------- | --------- | ------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| `NOVA_POSHTA_API_KEY` | Partial\* | -       | Your Nova Poshta API key (\*only required for waybill operations)                                                                  |
| `NOVA_POSHTA_SYSTEM`  | No        | -       | System identifier parameter. `DevCentre` is the value used by Nova Poshta API Sandbox UI (optional, does not affect functionality) |
| `LOG_LEVEL`           | No        | `info`  | Logging level: `debug`, `info`, `warn`, `error`                                                                                    |

**Operations that work without API key:**

- Tracking (track_document, track_multiple_documents, track_multiple, get_document_movement, get_document_list)
- Address search (address_get_settlements, address_get_settlement_country_region, address_search_cities, address_search_settlements, address_search_streets, address_get_warehouses)
- Reference data (all reference\_\* tools)

**Operations that require API key:**

- Waybill management (waybill_calculate_cost, waybill_get_estimate, waybill_create, waybill_create_with_options, waybill_create_for_postomat, waybill_create_batch, waybill_update, waybill_delete, waybill_delete_batch, waybill_get_delivery_date)
- Address management (address_save, address_update, address_delete)
- Counterparty operations (counterparty_get_counterparties, counterparty_get_addresses, counterparty_get_contact_persons, counterparty_save, counterparty_update, counterparty_delete, counterparty_get_options)
- Contact person management (contact_person_save, contact_person_update, contact_person_delete)

### Transport Modes

#### stdio

Best for local AI assistants like Claude Desktop and Claude Code:

```bash
novaposhta-mcp
# or
node dist/cli.js
```

## Available Tools

### Tracking Tools

#### `track_document`

Track a single Nova Poshta document by number and optional phone to receive live status, location, and ETA.

#### `track_multiple_documents`

Track multiple Nova Poshta documents at once and receive aggregated statistics.

#### `track_multiple`

Track multiple Nova Poshta documents with organized results and statistics. Returns successful/failed tracking attempts with delivery statistics (delivered, in-transit, at-warehouse counts). More convenient than `track_multiple_documents` for batch operations.

#### `get_document_movement`

Get movement history for up to 10 documents including statuses and timestamps.

#### `get_document_list`

List documents created in the given date range with pagination support.

---

### Address Tools

#### `address_get_settlements`

Get settlement areas (областей) in Ukraine. Returns list of administrative regions/areas. Cache this public directory for 12 hours.

#### `address_get_settlement_country_region`

Get settlement country regions (регіонів) for a specific area. Returns list of regions within an administrative area. Cache for 12 hours.

#### `address_search_cities`

Find Nova Poshta cities by name or postal index. Always use `limit` parameter (recommended: 10) to avoid large responses.

#### `address_search_settlements`

Search for settlements (city, town, village) with pagination. Always use `limit` parameter (recommended: 10) to avoid large responses.

#### `address_search_streets`

Search for streets inside a settlement. Used for door pickup/delivery flows. Always use `limit` parameter (recommended: 10) to avoid large responses.

#### `address_get_warehouses`

List Nova Poshta warehouses (branches, postomats, pickup points) with advanced filtering. Always use `limit` parameter (recommended: 10-20) to avoid large responses.

#### `address_save`

Create new address for a counterparty. Requires API key. Response returns the Ref and Description needed for door-to-door delivery.

#### `address_update`

Update existing counterparty address. Can only edit an address before a waybill is created with it.

#### `address_delete`

Delete counterparty address by reference. Allowed only before the address participates in an Internet document.

---

### Waybill Tools

#### `waybill_calculate_cost`

Calculate delivery cost and optional delivery date estimation for a shipment. Can use typed fields or raw API payload.

#### `waybill_get_estimate`

Get complete shipment estimate (price + delivery date) in one call. Combines cost calculation and delivery date estimation for convenience.

#### `waybill_create`

Create a standard Nova Poshta waybill (Internet document). This is the basic waybill creation method.

#### `waybill_create_with_options`

Create a Nova Poshta waybill with additional options and services. Supports backward delivery, additional services, third-party payer, and RedBox barcodes. Use this when you need COD, insurance, or return shipments.

#### `waybill_create_for_postomat`

Create a waybill for postomat delivery. Postomats have size/weight restrictions (max 30kg, max dimensions). Requires proper warehouse selection (postomat type) and seat options configuration.

#### `waybill_create_batch`

Batch create multiple waybills sequentially. Processes each waybill one by one to avoid rate limiting. Returns array of results including any errors.

#### `waybill_update`

Update an existing waybill. Pass the raw payload (must include DocumentRef).

#### `waybill_delete`

Delete one or multiple waybills by their DocumentRef. Waybills can only be deleted before they enter processing.

#### `waybill_delete_batch`

Batch delete multiple waybills by their DocumentRef in a single API call. Waybills can only be deleted before they enter processing.

#### `waybill_get_delivery_date`

Get estimated delivery date for a city pair and service type.

---

### Reference Tools

#### `reference_get_cargo_types`

List available cargo types supported by Nova Poshta. Cache this directory monthly. Values: `Parcel`, `Cargo`, `Documents`, `TiresWheels`, `Pallet`.

#### `reference_get_pack_list`

List available packaging types with standard package dimensions and descriptions. Useful for calculating delivery costs. Cache monthly.

#### `reference_get_tires_wheels_list`

List available tires and wheels types. Returns types and descriptions for shipping tires and wheels as cargo. Cache monthly.

#### `reference_get_cargo_description_list`

List cargo descriptions with optional search. Returns predefined descriptions for common cargo types. Cache monthly.

#### `reference_get_pickup_time_intervals`

Get available pickup time intervals. Returns time windows when Nova Poshta can pick up packages from sender. Cache hourly.

#### `reference_get_backward_cargo_types`

List backward delivery cargo types. Returns types of cargo that can be sent back (documents, money, etc.). Used for return shipments and COD. Cache monthly.

#### `reference_get_redelivery_payers`

List payer types for redelivery. Returns who can pay for backward delivery (Sender/Recipient). Used with return shipments. Cache monthly.

#### `reference_get_service_types`

List delivery service types. Four core technologies: `WarehouseWarehouse`, `WarehouseDoors`, `DoorsWarehouse`, `DoorsDoors`. Cache monthly.

#### `reference_get_payment_methods`

List supported payment methods for shipments. Returns `Cash`/`NonCash`. Non-cash payments are only available to customers with a Nova Poshta contract.

#### `reference_get_pallet_types`

List pallet types with dimensions and weight specifications. Cache monthly, especially when offering reverse delivery of pallets.

#### `reference_get_time_intervals`

Get available delivery time intervals for recipient city. Returns Number/Start/End entries. Cache monthly.

#### `reference_get_ownership_forms`

List corporate ownership forms required for counterparty creation. Returns refs such as ТОВ, ПрАТ, ФГ with both short and full names. Cache monthly.

#### `reference_decode_message`

Decode Nova Poshta API message code into human readable text. Maps numeric codes to Ukrainian/Russian descriptions.

#### `reference_get_types_of_payers`

Get list of payer types for waybill creation. Returns `Sender`/`Recipient`/`ThirdPerson`. ThirdPerson payer is accessible only after signing a service contract. Cache monthly.

#### `reference_get_payment_forms`

Get list of payment forms for waybill creation. Returns `Cash`/`NonCash`. Non-cash payments are available only to contracted clients. Cache monthly.

#### `reference_get_types_of_counterparties`

Get list of counterparty types. Returns `PrivatePerson`/`Organization`. Refresh monthly to stay aligned with sender/recipient onboarding rules.

---

### Counterparty Tools

#### `counterparty_get_counterparties`

Get counterparties list filtered by property (Sender/Recipient/ThirdPerson). Requires API key. Cache daily. Each page tops out at 500 rows.

#### `counterparty_get_addresses`

Get addresses for a specific counterparty. Requires API key. Cache daily. Each page is capped at 500 entries.

#### `counterparty_get_contact_persons`

Get contact persons for a counterparty. API key is mandatory. Cache daily. Use paging to stay under the 500-record response cap.

#### `counterparty_save`

Create new counterparty (private person or organization). Private persons require first/last name. Organizations must also send OwnershipForm and EDRPOU. Requires API key.

#### `counterparty_update`

Update existing counterparty details. Can only edit a counterparty before creating a waybill with it.

#### `counterparty_delete`

Delete counterparty by reference. **IMPORTANT:** Only Recipient counterparties can be deleted through the API; Sender cleanup must go through your account manager.

#### `counterparty_get_options`

Get counterparty options and permissions. Returns booleans such as CanPayTheThirdPerson, CanSameDayDelivery, HideDeliveryCost, etc.

---

### Contact Person Tools

#### `contact_person_save`

Create new contact person for a counterparty. Requires API key. All fields must be entered in Ukrainian.

#### `contact_person_update`

Update existing contact person details. Only legal entities may edit full profiles. Private persons can change phone only. Edits are allowed solely before a waybill is issued for that counterparty.

#### `contact_person_delete`

Delete contact person by reference. Allowed via API only for legal entities and only until the contact was used on an Internet document.

## Usage Examples

### Tracking a Shipment

**Prompt to Claude:**

```
Track Nova Poshta package 20450123456789
```

Claude will use `track_document` tool and return detailed status including current location, estimated delivery, and recipient information.

---

### Finding Warehouses

**Prompt to Claude:**

```
Find all Nova Poshta branches in Lviv that have POS terminals
```

Claude will search for Lviv city and then list warehouses with POS terminals using appropriate filters.

---

### Calculating Delivery Cost

**Prompt to Claude:**

```
Calculate shipping cost for 10kg parcel from Kyiv to Odesa, warehouse to warehouse, declared value 2000 UAH
```

Claude will find city references and calculate the delivery cost with estimated delivery date.

---

### Multi-Document Tracking

**Prompt to Claude:**

```
Track these packages: 20450123456789, 20450987654321, 20451234567890 and give me a summary
```

Claude will use batch tracking tools and provide aggregated statistics: delivered, in transit, pending pickup, etc.

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

## FAQ

### General Questions

**Q: Why should I use this MCP server instead of calling Nova Poshta API directly?**
A: This MCP server provides several key advantages:

- **Comprehensive Documentation**: All tools are well-documented with clear descriptions, making it easy for AI assistants to understand and use them correctly
- **Real Data Operations**: Execute real API calls with actual Nova Poshta data - tracking shipments, calculating costs, creating waybills, and more
- **AI-Native Integration**: Designed specifically for AI assistants like Claude, enabling natural language interactions with Nova

**Q: Do I need a Nova Poshta account to use this?**
A: Yes, you need to register at [my.novaposhta.ua](https://my.novaposhta.ua/) and generate an API key.

**Q: Is this an official Nova Poshta package?**
A: No, this is a community-maintained package. For official API docs, visit [developers.novaposhta.ua](https://developers.novaposhta.ua/).

**Q: Can I use this in production?**
A: Yes! The package is production-ready with enterprise-grade error handling.

**Q: Does this support all Nova Poshta API features?**
A: The package covers the most commonly used features. If you need additional functionality, please [open an issue](https://github.com/shopanaio/carrier-api/issues).

---

## Changelog

See [CHANGELOG.md](https://github.com/shopanaio/carrier-api/blob/main/CHANGELOG.md) for a detailed history of changes.

---

## License

Apache License 2.0 - see [LICENSE](https://github.com/shopanaio/carrier-api/blob/main/LICENSE) for details.

## Links

- [MCP Registry](https://registry.modelcontextprotocol.io/v0.1/servers?search=io.github.shopanaio/novaposhta) - Find this server in the official registry
- [Nova Poshta API Documentation](https://developers.novaposhta.ua/)
- [Model Context Protocol](https://modelcontextprotocol.io)
- [MCP SDK](https://github.com/modelcontextprotocol/sdk)

## Support

- **Issues**: [GitHub Issues](https://github.com/shopanaio/carrier-api/issues)
- **Discussions**: [GitHub Discussions](https://github.com/shopanaio/carrier-api/discussions)
- **Email**: hello@shopana.io

---

<div align="center">

Made with ❤️ by [Shopana.io](https://shopana.io)

[⬆ Back to Top](#nova-poshta-mcp-server)

</div>
