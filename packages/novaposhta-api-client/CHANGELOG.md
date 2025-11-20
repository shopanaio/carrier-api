# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.0.1-alpha.4] - 2025-11-20

### Added
- TBD: Document changes for this release

## [0.0.1-alpha.0] - 2025-11-19

### Added

#### Core Features
- Plugin-based architecture with `.use()` method for service registration
- Type-safe Nova Poshta API client with full TypeScript support
- Transport-agnostic design - inject your own HTTP transport implementation
- Tree-shakeable - only bundle the services you use
- Namespaced API (`client.address.*`, `client.reference.*`, etc.)

#### Services
- **AddressService**: City, settlement, and street search and lookup
  - `getCities()` - Get cities with search and pagination
  - `getSettlements()` - Get settlements
  - `searchSettlements()` - Search settlements by query
  - `searchSettlementStreets()` - Search streets in settlements
  - `getStreet()` - Get streets in a city
  - `getSettlementCountryRegion()` - Get settlement regions

- **ReferenceService**: Reference data and dictionaries
  - `getCargoTypes()` - Get cargo type list
  - `getBackwardDeliveryCargoTypes()` - Get backward delivery cargo types
  - `getPalletsList()` - Get available pallets
  - `getPackList()` - Get packaging types
  - `getTiresWheelsList()` - Get tires and wheels types
  - `getCargoDescriptionList()` - Get cargo descriptions
  - `getMessageCodeText()` - Get error codes and descriptions
  - `getServiceTypes()` - Get delivery service types
  - `getOwnershipFormsList()` - Get ownership forms
  - `getTimeIntervals()` - Get delivery time intervals
  - `getTypesOfPayersForRedelivery()` - Get payer types for redelivery
  - `getPickupTimeIntervals()` - Get pickup time intervals

- **TrackingService**: Package tracking and monitoring
  - `trackDocument()` - Track single document by number
  - `trackDocuments()` - Track multiple documents
  - `getDocumentList()` - Get list of documents for date range
  - `getDocumentMovement()` - Get document movement history
  - `trackMultiple()` - Track multiple documents with statistics
  - `filterTrackingResults()` - Filter tracking results by status, city, date
  - `calculateStatistics()` - Calculate delivery statistics
  - `isDelivered()`, `isInTransit()`, `isAtWarehouse()` - Status helpers
  - `getStatusDescription()` - Get status description in UA/EN
  - `monitorDocuments()` - Monitor documents with callbacks

- **WaybillService**: Waybill creation and management
  - `create()` - Create standard waybill
  - `update()` - Update existing waybill
  - `delete()` - Delete waybill
  - `validateWaybill()` - Validate waybill data without creating
  - `createWithOptions()` - Create waybill with additional options
  - `createForPostomat()` - Create postomat waybill with restrictions
  - `getDeliveryDate()` - Calculate delivery date
  - `getPrice()` - Calculate delivery price
  - `createBatch()` - Create multiple waybills
  - `deleteBatch()` - Delete multiple waybills
  - `getEstimate()` - Get price and delivery date estimate
  - `canDeliverToPostomat()` - Check postomat delivery availability

#### Types & Enums
- Comprehensive TypeScript types for all API requests and responses
- Enums for all Nova Poshta constants:
  - `ServiceType`, `CargoType`, `PayerType`, `PaymentMethod`
  - `DeliveryStatus`, `PackagingType`, etc.
- Error types with detailed error handling
- Full type inference support

#### Testing
- 60 unit tests with mocked transport (100% pass rate)
- Complete test coverage for all services
- Mock transport utilities for testing

### Technical Details
- Zero runtime dependencies (peer dependency: `typescript >= 4.9.0`)
- ESM module support with proper `exports` field
- Source maps included for debugging
- Tree-shaking support via `sideEffects: false`

### Documentation
- Comprehensive README with examples
- TypeScript type documentation
- Usage examples for all services

[Unreleased]: https://github.com/shopanaio/carrier-api/compare/v0.0.1-alpha.4...HEAD
[0.0.1-alpha.4]: https://github.com/shopanaio/carrier-api/compare/v0.0.1-alpha.3...v0.0.1-alpha.4
[0.0.1-alpha.0]: https://github.com/shopanaio/carrier-api/releases/tag/v0.0.1-alpha.0
