# Ukrposhta contracts

Machine-readable API contracts of the carrier.

Put raw carrier specs here (Swagger/OpenAPI snapshots, Postman exports, notes from PDFs). The simulator contract lives in `src/simulator/contract.ts`: hand-written with `defineContract`, or built from a snapshot with `contractFromOpenApi`.

Update a contract in its own commit so the diff shows what changed in the carrier API.
