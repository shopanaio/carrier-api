---
'@shopana/novaposhta-transport-fetch': major
---

Release the deprecated fetch transport together with the 2.0 carrier platform. The package is unchanged and only kept for the legacy `createClient({ transport, ... })` construction; new code uses the carrier-core fetch transport that ships with `@shopana/novaposhta-api-client`.
