# @shopana/carrier-core

Carrier-agnostic HTTP core for Shopana carrier API clients. No runtime dependencies; works in Node 18+, browsers and edge runtimes.

## What's inside

- **Transport.** `HttpTransport` is a function `(HttpRequest) => Promise<HttpResponse>`. `createFetchTransport()` supports any method, query, headers, JSON/form/text/binary bodies, `json`/`text`/`binary` responses (PDF labels) and per-attempt timeouts. It resolves for every HTTP status and rejects only when no response arrived.
- **Pipeline.** `HttpClient` wraps the transport in middlewares, outermost first: `timeout → retry → rateLimit → custom → auth → logging → transport`. Custom middlewares run before auth, so signatures cover the headers and body they set. Rate limiting sits inside retry so retried attempts also wait for a token; the repeat after a 401 takes a token too. Only transport rejections become network errors (`NETWORK_ERROR`/`TIMEOUT`/`ABORTED`); anything else thrown in the pipeline becomes a non-retryable `UNEXPECTED_ERROR`. A thrown `CarrierError` is retried only when `retryable` (a failed login is not).
- **Retry.** 408/425/429/5xx and network errors, exponential backoff with full jitter, `Retry-After` (seconds or HTTP date). Non-idempotent requests (POST/PATCH) are not repeated after 5xx or network errors unless `idempotent: true`; 429 and failures that certainly happened before sending (`ECONNREFUSED`, `ENOTFOUND`, `EAI_AGAIN`) are always safe to repeat. `shouldRetryResponse` covers carriers that throttle inside a 200 body (Nova Poshta `20000401501`).
- **Rate limiter.** FIFO token bucket: `{ limit: 100, intervalMs: 60_000 }`. A request aborted while waiting leaves the queue without taking a token.
- **Auth strategies.** `noAuth`, `apiKey` (header/query/body), `bearer`, `queryParam`, `basic`, `bodyCredentials`, `composeAuth`, `when`, `tokenAuth`/`loginToken`, `oauth2ClientCredentials`, `oauth2Password`, `signature` (MD5/HMAC digests over the exact wire body, `bodyBytes` for binary payloads; hashing is injected, `hmacSha256`/`sha256` via WebCrypto are included). Tokens live in a `TokenStore` (in-memory by default, plug in Redis/KV; a shared store needs a `key` unique per account, OAuth2 defaults to token URL + client id) with single-flight renewal, refresh before expiry (at most half the token lifetime ahead), a `loginTimeoutMs` that aborts a hung login through `context.signal`, and one retry on 401 (refresh first, then full login).
- **Errors.** `CarrierError { carrier, code, category, retryable, httpStatus, field, raw }`. Categories extend the Nova Poshta `ErrorCategory` values.
- **Logging.** `logger` receives one event per attempt (a logger that throws is ignored and never fails the request); `redactRequest` masks credentials in headers, URL, query and bodies.
- **Services.** `createClient(ctx).use(new Service())` mounts services by `namespace`, same pattern as the Nova Poshta client.

## Example

```ts
import { composeAuth, bearer, createClient, createFetchTransport, createHttpClient, queryParam, when } from '@shopana/carrier-core';

const http = createHttpClient({
  carrier: 'ukrposhta',
  baseUrl: 'https://www.ukrposhta.ua/ecom/0.0.1',
  transport: createFetchTransport(),
  auth: composeAuth(
    bearer(process.env.UP_ECOM_BEARER!),
    when(r => r.meta?.counterpartyToken === true, queryParam('token', process.env.UP_COUNTERPARTY_TOKEN!)),
  ),
  retry: { maxRetries: 2 },
  timeoutMs: 30_000,
});

class ShipmentsService {
  readonly namespace = 'shipments' as const;
  private ctx!: { http: typeof http };
  attach(ctx: { http: typeof http }) {
    this.ctx = ctx;
  }
  get(uuid: string) {
    return this.ctx.http.request({ method: 'GET', path: '/shipments/{uuid}', pathParams: { uuid }, meta: { counterpartyToken: true } });
  }
}

const client = createClient({ http, config: {} }).use(new ShipmentsService());
```
