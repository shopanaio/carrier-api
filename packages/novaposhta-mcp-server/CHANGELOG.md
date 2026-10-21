# Changelog

## 0.0.2

### Patch Changes

- 32451da: Port the client onto `@shopana/carrier-core`. Services, request and response types and enums are unchanged. Construction changes: `createClient(createNovaPoshtaContext(config))` or the new `createNovaPoshtaClient(config)` replaces `createClient({ transport, baseUrl, apiKey, rateLimitRetry })`; HTTP goes through the carrier-core pipeline (fetch transport by default, retry, rate limiting, timeout, logging). `rateLimitRetry` becomes `retry` (`delayMs` becomes `baseDelayMs`), a custom `transport` is now a carrier-core `HttpTransport`, and non-2xx responses are thrown as `CarrierError`. The package is now built with Rollup as ESM and CJS.

  The previous construction stays supported and deprecated: `createClient({ transport, baseUrl, apiKey, system, rateLimitRetry })` with a function-style transport (for example `createFetchHttpTransport()` from `@shopana/novaposhta-transport-fetch`) keeps its behavior: only API-level rate limiting is retried and the body of a non-2xx response is returned instead of thrown.

  The MCP server builds its client with the new `createNovaPoshtaContext()` and the carrier-core fetch transport.

- Updated dependencies [32451da]
  - @shopana/novaposhta-api-client@0.1.0

## 0.0.1

### Patch Changes

- b1c78f9: Add automated package publishing and correct Nova Poshta postomat service handling.
- Updated dependencies [b1c78f9]
  - @shopana/novaposhta-api-client@0.0.1

All notable changes to the Nova Poshta MCP Server will be documented in this file.

## [0.0.1-alpha.2] - 2025-11-20

### Added

#### Counterparty Management Tools

- `counterparty_get_counterparties` - Get counterparties list with filtering (Sender/Recipient/ThirdPerson)
- `counterparty_get_addresses` - Get addresses for specific counterparty
- `counterparty_get_contact_persons` - Get contact persons list for counterparty
- `counterparty_save` - Create new counterparty (PrivatePerson or Organization)
  - Supports discriminated unions with type-safe validation
  - PrivatePerson requires: firstName, lastName
  - Organization requires: ownershipForm, edrpou
- `counterparty_update` - Update existing counterparty details
- `counterparty_delete` - Delete counterparty (recipients only)
- `counterparty_get_options` - Get counterparty options and permissions

#### Contact Person Management Tools

- `contact_person_save` - Create contact person for counterparty
- `contact_person_update` - Update contact person details
- `contact_person_delete` - Delete contact person

#### Address CRUD Tools

- `address_save` - Create new counterparty address
- `address_update` - Update existing address
- `address_delete` - Delete address by reference

#### Reference Data Tools

- `reference_get_types_of_payers` - Get payer types (Sender/Recipient/ThirdPerson)
- `reference_get_payment_forms` - Get payment forms (Cash/NonCash)
- `reference_get_types_of_counterparties` - Get counterparty types (PrivatePerson/Organization)

### Changed

- Updated `@shopana/novaposhta-api-client` to version 0.0.1-alpha.3
- Extended MCP server capabilities to match full API client features
- Total MCP tools increased from ~20 to ~33

### Technical

- Added comprehensive type safety for counterparty operations
- Implemented proper validation for discriminated union types
- Enhanced error handling for CRUD operations
- Added support for all new API client services

## [0.0.1-alpha.1] - 2025-11-20

### Fixed

- Fixed excessive token consumption in address tools by removing full API response from structuredContent
- Address search tools now return only preview data (first 5 items) instead of complete dataset
- Reduced token usage from ~2.4M to ~200-500 tokens per address search request

## [0.0.1-alpha.0] - 2025-11-20

### Added

- Initial alpha release of Nova Poshta MCP Server
- Document tracking functionality (single and multiple documents)
- Document movement history retrieval
- Document list retrieval by date range
- Address search capabilities (cities, settlements, streets, warehouses)
- Waybill operations (create, update, delete, calculate cost)
- Delivery date estimation
- Reference data access (cargo types, service types, payment methods, pallets, time intervals, ownership forms)
- Message decoding functionality
- HTTP and STDIO transport support
- Comprehensive error handling and validation
