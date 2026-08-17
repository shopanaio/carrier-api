<div align="center">

# @shopana/carrier-api

**Modern type-safe API clients for shipping carriers**

[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg?style=flat-square)](https://www.apache.org/licenses/LICENSE-2.0)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg?style=flat-square)](https://www.typescriptlang.org/)
[![Monorepo](https://img.shields.io/badge/Monorepo-Yarn%20Workspaces-2C8EBB.svg?style=flat-square)](https://yarnpkg.com/features/workspaces)

[Features](#-features) • [Packages](#-packages) • [Quick Start](#-quick-start) • [Documentation](#-documentation) • [Contributing](#-contributing)

</div>

---

## 🚀 Overview

A production-ready monorepo containing **enterprise-grade TypeScript API clients** for shipping carriers. Built with modern architecture patterns, each client features plugin-based design, full type safety, and transport-agnostic implementation.

### 🎯 Why Carrier API?

- ✨ **Type-Safe**: Complete TypeScript coverage with strict typing
- 🔌 **Plugin Architecture**: Use only what you need, tree-shake the rest
- 🌐 **Universal**: Works in Node.js, browsers, and edge runtimes
- 🎨 **Transport-Agnostic**: Bring your own HTTP client
- 🤖 **AI-Ready**: MCP server for Claude and other AI assistants
- 📦 **Zero Config**: Sensible defaults, works out of the box

---

## 📦 Packages

### Carrier API Clients

#### [@shopana/novaposhta-api-client](./packages/novaposhta-api-client)

[![npm version](https://img.shields.io/npm/v/@shopana/novaposhta-api-client.svg?style=flat-square)](https://www.npmjs.com/package/@shopana/novaposhta-api-client)
[![Bundle Size](https://img.shields.io/bundlephobia/minzip/@shopana/novaposhta-api-client?style=flat-square)](https://bundlephobia.com/package/@shopana/novaposhta-api-client)

**Nova Poshta API client** with plugin architecture and complete type safety.

**Features:**
- 🔧 Plugin-based services (Address, Reference, Tracking, Waybill, Counterparty, ContactPerson)
- 📛 Namespaced API: `client.address.*`, `client.reference.*`, `client.tracking.*`, `client.waybill.*`
- 🎯 Full TypeScript support with strict typing
- 🔄 Transport-agnostic design
- 🌳 Tree-shakeable - only bundle what you use
- 📖 Comprehensive documentation with examples

```bash
npm i @shopana/novaposhta-api-client @shopana/novaposhta-transport-fetch
```

[📚 Documentation](./packages/novaposhta-api-client/README.md)

---

### AI Integration

#### [@shopana/novaposhta-mcp-server](./packages/novaposhta-mcp-server)

[![npm version](https://img.shields.io/npm/v/@shopana/novaposhta-mcp-server.svg?style=flat-square)](https://www.npmjs.com/package/@shopana/novaposhta-mcp-server)
[![MCP](https://img.shields.io/badge/MCP-1.22+-green.svg?style=flat-square)](https://modelcontextprotocol.io)
[![MCP Badge](https://lobehub.com/badge/mcp/shopanaio-carrier-api)](https://lobehub.com/mcp/shopanaio-carrier-api)

**Model Context Protocol (MCP) server** for integrating Nova Poshta with AI assistants like Claude.

**Features:**
- 🤖 Full MCP 1.22+ support
- 📍 Comprehensive tracking and address search
- 📝 Waybill creation and management
- 📚 Reference data access
- 🔄 Dual transport (stdio + HTTP)
- 🏢 Production-ready with enterprise-grade error handling

```bash
npx @shopana/novaposhta-mcp-server
```

[📚 Documentation](./packages/novaposhta-mcp-server/README.md)

---

### Transport Implementations

#### [@shopana/novaposhta-transport-fetch](./packages/novaposhta-transport-fetch)

[![npm version](https://img.shields.io/npm/v/@shopana/novaposhta-transport-fetch.svg?style=flat-square)](https://www.npmjs.com/package/@shopana/novaposhta-transport-fetch)

**Fetch-based HTTP transport** for Nova Poshta API client.

**Features:**
- 🌐 Cross-platform (Node.js, browsers, edge runtimes)
- ⚙️ Configurable headers and fetch implementation
- 🚫 AbortSignal support for request cancellation
- 📦 Minimal dependencies
- ⚡ Lightweight and fast

```bash
npm i @shopana/novaposhta-transport-fetch
```

[📚 Documentation](./packages/novaposhta-transport-fetch/README.md)

---

## 🚀 Quick Start

### Nova Poshta API Client

```typescript
import { createClient, AddressService, ReferenceService, TrackingService } from '@shopana/novaposhta-api-client';
import { createFetchHttpTransport } from '@shopana/novaposhta-transport-fetch';

// Create client with plugins
const client = createClient({
  transport: createFetchHttpTransport(),
  baseUrl: 'https://api.novaposhta.ua/v2.0/json/',
  apiKey: process.env.NOVA_POSHTA_API_KEY,
})
  .use(new AddressService())
  .use(new ReferenceService())
  .use(new TrackingService());

// Use the namespaced API
const cities = await client.address.searchCities({ FindByString: 'Київ', Limit: 10 });
const cargoTypes = await client.reference.getCargoTypes();
const tracking = await client.tracking.trackDocument({ Documents: ['20450123456789'] });

console.log('Found cities:', cities.data.length);
console.log('Package status:', tracking.data[0].Status);
```

### MCP Server for AI Assistants

Add to your `.mcp.json` or Claude Desktop config:

```json
{
  "mcpServers": {
    "novaposhta": {
      "command": "npx",
      "args": ["-y", "-p", "@shopana/novaposhta-mcp-server", "novaposhta-mcp"],
      "env": {
        "NOVA_POSHTA_API_KEY": "your_api_key_here"
      }
    }
  }
}
```

Then ask Claude:
- "Track Nova Poshta package 20450123456789"
- "Find warehouses in Kyiv with POS terminals"
- "Calculate shipping cost from Kyiv to Lviv for 5kg parcel"

---

## 🏗️ Architecture

All carrier clients in this monorepo follow a **consistent, battle-tested design pattern**:

```
┌─────────────────────────────────────────┐
│           Your Application              │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│      Plugin-based API Client            │
│  ┌──────────┐ ┌──────────┐ ┌─────────┐ │
│  │ Address  │ │Reference │ │Tracking │ │
│  │ Service  │ │ Service  │ │ Service │ │
│  └──────────┘ └──────────┘ └─────────┘ │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│      Transport Layer (Injectable)       │
│         fetch / axios / custom          │
└─────────────────────────────────────────┘
```

### Key Principles

- 🔌 **Plugin-based**: Connect only the services you need
- 🎯 **Type-safe**: Complete TypeScript coverage with inference
- 🎨 **Transport-agnostic**: Use fetch, axios, or custom HTTP client
- 🌳 **Tree-shakeable**: Optimal bundle size - only what you use
- 📛 **Namespaced API**: Clean, organized method calls
- 🧪 **Testable**: Mock transport layer for unit tests

---

## 📚 Documentation

### Package Documentation

- [Nova Poshta API Client](./packages/novaposhta-api-client/README.md)
- [Nova Poshta MCP Server](./packages/novaposhta-mcp-server/README.md)
- [Nova Poshta Transport (Fetch)](./packages/novaposhta-transport-fetch/README.md)

### Additional Resources

- [Nova Poshta API Official Docs](https://developers.novaposhta.ua/)
- [Model Context Protocol](https://modelcontextprotocol.io)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)

---

## 🛠️ Development

### Prerequisites

- Node.js 18+ or 20+
- Yarn 3+ (Yarn Workspaces)

### Setup

```bash
# Clone the repository
git clone https://github.com/shopanaio/carrier-api.git
cd carrier-api

# Install dependencies
yarn install

# Build all packages
yarn build
```

### Available Scripts

```bash
# Development
yarn dev                  # Watch mode for API client
yarn dev:mcp:stdio        # Run MCP server in stdio mode
yarn dev:mcp:http         # Run MCP server in HTTP mode

# Building
yarn build                # Build API client
yarn build:mcp            # Build MCP server

# Testing
yarn test                 # Run all tests
yarn test:watch           # Run tests in watch mode
yarn test:coverage        # Generate coverage report
yarn test:mcp             # Run MCP server tests

# Code Quality
yarn lint                 # Lint TypeScript files
yarn lint:fix             # Fix linting issues
yarn format               # Format code with Prettier
yarn format:check         # Check code formatting
yarn type-check           # Run TypeScript type checking
```

### Project Structure

```
carrier-api/
├── packages/
│   ├── novaposhta-api-client/       # Core API client
│   │   ├── src/
│   │   │   ├── core/                # Client core logic
│   │   │   ├── services/            # Service plugins
│   │   │   ├── types/               # TypeScript types
│   │   │   └── index.ts
│   │   └── package.json
│   │
│   ├── novaposhta-mcp-server/       # MCP server for AI
│   │   ├── src/
│   │   │   ├── cli/                 # CLI entry points
│   │   │   ├── tools/               # MCP tools
│   │   │   ├── server.ts            # Server implementation
│   │   │   └── config.ts
│   │   └── package.json
│   │
│   └── novaposhta-transport-fetch/  # Fetch transport
│       ├── src/
│       └── package.json
│
├── e2e/                             # End-to-end tests
├── postman/                         # Postman collections
├── .mcp.json                        # MCP server config
└── package.json                     # Root package.json
```

---

## 🤝 Contributing

We welcome contributions from the community! Whether it's bug fixes, new features, documentation improvements, or examples - all contributions are appreciated.

### How to Contribute

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Make your changes**: Follow our coding standards
4. **Add tests**: Ensure your changes are tested
5. **Run tests**: `yarn test` - make sure everything passes
6. **Commit your changes**: `git commit -m 'feat: add amazing feature'`
7. **Push to your fork**: `git push origin feature/amazing-feature`
8. **Open a Pull Request**

### Development Guidelines

- Write clean, readable TypeScript code
- Follow the existing code style
- Add tests for new functionality
- Update documentation as needed
- Use conventional commits (feat, fix, docs, chore, etc.)

### Changesets and releases

Package releases are automated with GitHub Actions and Changesets. Changes to
package source files, package scripts, or package manifests must include a
user-facing Changeset generated with:

```sh
yarn changeset
```

Select every affected public package and use `patch` for backwards-compatible
fixes or `minor` for backwards-compatible features. Major Changesets and
placeholder release notes are rejected automatically. Documentation-only,
test-only, and repository maintenance changes do not need a Changeset.

The `Changeset Required` workflow checks pull requests before release automation
can run.

Stable releases use the `main` branch:

1. Merge a source change and its `.changeset/*.md` file into `main`.
2. The `Release` workflow opens a `chore: version packages` pull request.
3. Review and merge that version pull request.
4. The same workflow builds and publishes changed packages to npm with the
   `latest` tag and creates GitHub releases.

Beta prereleases use the `beta` branch:

1. Create or update `beta` from `main`.
2. Merge beta-bound source changes and their Changesets into `beta`.
3. The `Release` workflow opens a `chore: version packages (beta)` pull request.
4. Review and merge that version pull request.
5. The same workflow builds and publishes changed packages to npm with the
   `beta` tag.

The beta workflow enters Changesets prerelease mode automatically. Keep
`.changeset/pre.json` out of `main`.

Manual release packaging checks are:

```sh
yarn build
yarn pack:dry-run
```

npm publishing uses Trusted Publishing/OIDC. Configure every public npm package
to trust the `shopanaio/carrier-api` repository and
`.github/workflows/release.yml`. Packages that do not exist on npm yet require a
repository `NPM_TOKEN` secret for their first publication; it can be removed
after Trusted Publishing is configured. A `CHANGESETS_TOKEN` secret is optional
and is only needed when the default `GITHUB_TOKEN` cannot manage release pull
requests.

### Reporting Issues

Found a bug or have a feature request? Please [open an issue](https://github.com/shopanaio/carrier-api/issues) with:

- Clear description of the issue
- Steps to reproduce (for bugs)
- Expected vs actual behavior
- Environment details (Node.js version, OS, etc.)

---

## 🗺️ Roadmap

### Planned Features

- [ ] Additional carrier integrations
- [ ] GraphQL API layer
- [ ] React hooks package
- [ ] CLI tool for common operations
- [ ] Webhook handling utilities
- [ ] Rate limiting and retry strategies
- [ ] Caching layer with configurable adapters

### Future Carriers

**Eastern Europe:**
- Ukrposhta
- Meest
- Justin
- Delivery

**International:**
- DHL
- FedEx
- UPS
- DPD

Want to help implement these? [Contributions welcome!](#-contributing)

---

## 📊 Status

| Package | Version | Build | Coverage | Downloads |
|---------|---------|-------|----------|-----------|
| [@shopana/novaposhta-api-client](https://www.npmjs.com/package/@shopana/novaposhta-api-client) | [![npm](https://img.shields.io/npm/v/@shopana/novaposhta-api-client.svg?style=flat-square)](https://www.npmjs.com/package/@shopana/novaposhta-api-client) | ![Build](https://img.shields.io/badge/build-passing-brightgreen?style=flat-square) | ![Coverage](https://img.shields.io/badge/coverage-85%25-green?style=flat-square) | ![Downloads](https://img.shields.io/npm/dm/@shopana/novaposhta-api-client?style=flat-square) |
| [@shopana/novaposhta-mcp-server](https://www.npmjs.com/package/@shopana/novaposhta-mcp-server) | [![npm](https://img.shields.io/npm/v/@shopana/novaposhta-mcp-server.svg?style=flat-square)](https://www.npmjs.com/package/@shopana/novaposhta-mcp-server) | ![Build](https://img.shields.io/badge/build-passing-brightgreen?style=flat-square) | ![Coverage](https://img.shields.io/badge/coverage-80%25-green?style=flat-square) | ![Downloads](https://img.shields.io/npm/dm/@shopana/novaposhta-mcp-server?style=flat-square) |
| [@shopana/novaposhta-transport-fetch](https://www.npmjs.com/package/@shopana/novaposhta-transport-fetch) | [![npm](https://img.shields.io/npm/v/@shopana/novaposhta-transport-fetch.svg?style=flat-square)](https://www.npmjs.com/package/@shopana/novaposhta-transport-fetch) | ![Build](https://img.shields.io/badge/build-passing-brightgreen?style=flat-square) | ![Coverage](https://img.shields.io/badge/coverage-90%25-green?style=flat-square) | ![Downloads](https://img.shields.io/npm/dm/@shopana/novaposhta-transport-fetch?style=flat-square) |

---

## 📄 License

Apache License 2.0 - see [LICENSE](./LICENSE) for details.

This project is licensed under the Apache License 2.0, which means:
- ✅ Commercial use allowed
- ✅ Modification allowed
- ✅ Distribution allowed
- ✅ Patent use allowed
- ✅ Private use allowed

---

## 💬 Support & Community

- **Issues**: [GitHub Issues](https://github.com/shopanaio/carrier-api/issues)
- **Discussions**: [GitHub Discussions](https://github.com/shopanaio/carrier-api/discussions)
- **Email**: [support@shopana.io](mailto:support@shopana.io)
- **Website**: [shopana.io](https://shopana.io)

---

## 🙏 Acknowledgments

- [Nova Poshta](https://novaposhta.ua) for their comprehensive API
- [Model Context Protocol](https://modelcontextprotocol.io) team at Anthropic
- All contributors who help improve this project

---

<div align="center">

**Made with ❤️ by [Shopana.io](https://shopana.io)**

[![GitHub stars](https://img.shields.io/github/stars/shopanaio/carrier-api?style=social)](https://github.com/shopanaio/carrier-api)
[![GitHub forks](https://img.shields.io/github/forks/shopanaio/carrier-api?style=social)](https://github.com/shopanaio/carrier-api/fork)
[![GitHub watchers](https://img.shields.io/github/watchers/shopanaio/carrier-api?style=social)](https://github.com/shopanaio/carrier-api)

[⬆ Back to Top](#shopanacarrier-api)

</div>
