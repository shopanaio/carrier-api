# Changelog

## 0.0.1

### Patch Changes

- b1c78f9: Add automated package publishing and correct Nova Poshta postomat service handling.

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.0.1-alpha.0] - 2025-11-19

### Added

#### Core Features

- Fetch-based HTTP transport implementation for Nova Poshta API client
- Cross-platform support (Node.js and browsers) via `cross-fetch`
- Type-safe transport with TypeScript generics
- Configurable fetch implementation
- Custom headers support
- AbortSignal support for request cancellation

#### API

- `createFetchHttpTransport()` - Factory function to create transport instance
  - Optional `fetchImpl` parameter for custom fetch implementation
  - Optional `baseHeaders` parameter for additional headers

#### Features

- Automatic JSON serialization/deserialization
- Proper Content-Type and Accept headers
- HTTP POST method for all requests
- Status code and response data handling

### Technical Details

- Single dependency: `cross-fetch@^4.0.0`
- ESM module (`"type": "module"`)
- TypeScript support with full type definitions
- Source maps included
- Tree-shaking support via `sideEffects: false`
- Peer dependency: `typescript >= 4.9.0`

### Package Info

- Minimal bundle size: 2.3 kB (packed), 5.6 kB (unpacked)
- 6 files in package
- Clean exports with proper TypeScript support

### Documentation

- README with usage examples
- TypeScript type documentation

[Unreleased]: https://github.com/shopanaio/carrier-api/compare/v0.0.1-alpha.0...HEAD
[0.0.1-alpha.0]: https://github.com/shopanaio/carrier-api/releases/tag/v0.0.1-alpha.0
