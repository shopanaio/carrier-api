---
'@shopana/novaposhta-api-client': minor
---

Port the client onto `@shopana/carrier-core`. Services, request and response types and enums are unchanged. Construction changes: `createClient(createNovaPoshtaContext(config))` or the new `createNovaPoshtaClient(config)` replaces `createClient({ transport, baseUrl, apiKey, rateLimitRetry })`; HTTP goes through the carrier-core pipeline (fetch transport by default, retry, rate limiting, timeout, logging). `rateLimitRetry` becomes `retry` (`delayMs` becomes `baseDelayMs`), a custom `transport` is now a carrier-core `HttpTransport`, and non-2xx responses are thrown as `CarrierError`. The package is now built with Rollup as ESM and CJS.
