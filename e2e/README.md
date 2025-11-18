# Integration Tests for Nova Poshta API Client

This directory contains integration tests that verify the Nova Poshta API client works correctly with the real Nova Poshta API.

## Running Tests

### Without API Key

Most tests will run without an API key, but tests that require creating waybills or accessing authenticated endpoints will be automatically skipped:

```bash
yarn test
```

### With API Key

To run all tests including those that require authentication:

```bash
# Set your Nova Poshta API key
export NP_API_KEY=your_api_key_here

# Run tests
yarn test
```

## Test Categories

### ✅ Tests that run without API key:
- Reference data queries (cargo types, service types, etc.)
- Public address searches
- Validation operations
- Read-only operations

### 🔑 Tests that require API key:
- Creating waybills
- Updating waybills
- Calculating delivery prices
- Getting delivery date estimates
- Time interval queries

## Environment Variables

- `NP_API_KEY` - Your Nova Poshta API key (required for authenticated operations)

## Test Structure

Tests are organized by service:
- `address/` - Address and location related tests
- `reference/` - Reference data tests
- `tracking/` - Package tracking tests
- `waybill/` - Waybill creation and management tests

## Notes

- These are integration tests that make real HTTP requests to Nova Poshta API
- Some test data (UUIDs for cities, warehouses) may become outdated
- Tests requiring API key are automatically skipped when `NP_API_KEY` is not set
- For unit tests with mocks, see `packages/novaposhta-api-client/__tests__/`
