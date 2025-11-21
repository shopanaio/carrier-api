# Transport Removal from Meest API Client

## Summary

The `createFetchHttpTransport` function has been **completely removed** from `@shopana/meest-api-client`. The package now relies on `@shopana/carrier-transport` as a **required peer dependency**.

## What Changed

### ✅ Kept (Types Only)

The following types remain in `packages/meest-api-client/src/http/transport.ts`:
- `HttpTransport` interface
- `HttpRequest` interface
- `HttpResponse` interface
- `HttpMethod` type

These types define the contract but do not provide implementation.

### ❌ Removed (Implementation)

The following have been **completely removed**:
- `createFetchHttpTransport()` function
- `FetchLike` type
- `FetchTransportOptions` interface
- All transport implementation code

### 📦 Added (Dependencies)

Added to `package.json`:
```json
{
  "peerDependencies": {
    "@shopana/carrier-transport": "^0.1.0",
    "typescript": ">=4.9.0"
  },
  "peerDependenciesMeta": {
    "@shopana/carrier-transport": {
      "optional": false
    }
  }
}
```

## Migration Required

### Old Code (Will NOT Work)

```typescript
import { createClient, createFetchHttpTransport } from '@shopana/meest-api-client';

// ❌ ERROR: createFetchHttpTransport is not exported
const client = createClient({
  transport: createFetchHttpTransport(),
  token: process.env.MEEST_TOKEN,
});
```

### New Code (Required)

```typescript
import { createClient } from '@shopana/meest-api-client';
import { createFetchTransport } from '@shopana/carrier-transport';

// ✅ Correct: Use universal transport
const client = createClient({
  transport: createFetchTransport({
    baseUrl: 'https://api.meest.com/v3.0/openAPI',
  }),
  token: process.env.MEEST_TOKEN,
});
```

## Installation

Users **must** install both packages:

```bash
npm install @shopana/meest-api-client @shopana/carrier-transport
```

Without `@shopana/carrier-transport`, the package will not work.

## Benefits

This change brings:

1. **Consistency**: Same transport for all carrier clients (Nova Poshta, Meest)
2. **Features**: Retry, interceptors, timeout, mock transport built-in
3. **Flexibility**: Easy to swap implementations (fetch, axios, custom)
4. **Smaller Core**: Client package focuses on business logic, not HTTP
5. **Better Testing**: Built-in mock transport in carrier-transport

## Type Compatibility

The `HttpTransport` interface is **100% compatible** between packages:

```typescript
// These are equivalent
import type { HttpTransport } from '@shopana/meest-api-client';
import type { HttpTransport } from '@shopana/carrier-transport';
```

The only difference is that carrier-transport provides **implementations**, while meest-api-client only provides **types**.

## Documentation Updates

All documentation has been updated:
- ✅ README.md - Updated installation and usage
- ✅ QUICK_START.md - Updated to use carrier-transport
- ✅ MIGRATION.md - Clear migration path
- ✅ Package.json - Added peer dependency

## Breaking Change Notice

This is a **breaking change** for all users of `@shopana/meest-api-client`.

**Version:** 0.0.1-alpha.0+

**Action Required:** All users must:
1. Install `@shopana/carrier-transport`
2. Update imports from `createFetchHttpTransport` → `createFetchTransport`
3. Update transport initialization to include `baseUrl`

## Example: Complete Migration

**Before:**
```typescript
// Old imports
import {
  createClient,
  AuthService,
  SearchService,
  createFetchHttpTransport  // ❌ No longer exists
} from '@shopana/meest-api-client';

// Old transport creation
const transport = createFetchHttpTransport();

// Old client creation
const client = createClient({ transport, token: 'xxx' })
  .use(new AuthService())
  .use(new SearchService());
```

**After:**
```typescript
// New imports
import {
  createClient,
  AuthService,
  SearchService
} from '@shopana/meest-api-client';
import { createFetchTransport } from '@shopana/carrier-transport';

// New transport creation with baseUrl
const transport = createFetchTransport({
  baseUrl: 'https://api.meest.com/v3.0/openAPI',
  retry: { maxRetries: 3, retryDelay: 1000 },  // Optional: new features
});

// Client creation (same API)
const client = createClient({ transport, token: 'xxx' })
  .use(new AuthService())
  .use(new SearchService());
```

## Architecture Benefits

### Before (Duplicated Transport)
```
novaposhta-api-client → novaposhta-transport-fetch
meest-api-client → built-in createFetchHttpTransport
```
**Problem:** Each client has its own transport, duplicated features.

### After (Unified Transport)
```
novaposhta-api-client ──┐
                        ├──→ @shopana/carrier-transport
meest-api-client ───────┘
```
**Solution:** One transport for all, shared features, consistent API.

## Questions?

See:
- [MIGRATION.md](./MIGRATION.md) - Detailed migration guide
- [carrier-transport README](../carrier-transport/README.md) - Transport documentation
- [EXAMPLES.md](../carrier-transport/EXAMPLES.md) - Usage examples

## Summary

✅ **Removed:** `createFetchHttpTransport` from meest-api-client
✅ **Added:** Peer dependency on `@shopana/carrier-transport`
✅ **Updated:** All documentation and examples
✅ **Result:** Clean separation of concerns, unified transport layer
