# @shopana/carrier-core

## 0.1.0

### Minor Changes

- a6ef49e: Add the carrier platform packages. `@shopana/carrier-core` provides a generic HTTP transport on fetch, a middleware pipeline with timeout, retry on 429/5xx with Retry-After, a token-bucket rate limiter, auth strategies (API key, bearer, basic, body credentials, request signatures, login token and OAuth2 with a single-flight token cache) and `CarrierError`. `@shopana/carrier-contracts` adds the shared shipping domain model, capability interfaces and status mapping. `@shopana/carrier-testing` adds a contract-driven carrier API simulator with request and response validation, fault injection and adapter conformance checks.
