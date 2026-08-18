# Implementation Plan for the Ukrainian Settlement and Carrier Mapping Dataset

## 1. Purpose

Create a static dataset maintained in GitHub that maps settlements from the official KATOTTG codifier to Nova Poshta and Meest settlement identifiers.

No runtime mapping or source adapter is created for Ukrposhta: checkout passes the selected KATOTTG code directly to the Address Classifier when requesting post offices. The dataset generator does not call the Ukrposhta API and does not require Ukrposhta credentials.

The dataset does not contain branches, parcel lockers, schedules, or statuses. Checkout retrieves them from the carrier's current API.

Target flow for Nova Poshta and Meest:

```text
user selects a settlement
            ↓
     KATOTTG code selected
            ↓
       user selects carrier
            ↓
KATOTTG → carrier settlement identifier
            ↓
live carrier API → branches/parcel lockers
```

Target flow for Ukrposhta:

```text
KATOTTG with the UA prefix
            ↓ remove the UA prefix
city_katottg
            ↓
Ukrposhta Address Classifier → post offices
```

## 2. Fixed Decisions

1. The dataset remains in the current monorepo.
2. Only JSON files are committed to Git. Gzip and NDJSON are not generated in the MVP.
3. Checkout obtains the dataset at deploy time, stores it with the application, and does not access GitHub Raw during a user request.
4. Deploy pins a commit SHA, so `settlements.json`, `carrier-mappings.json`, and `manifest.json` are always loaded atomically from the same revision.
5. Dataset pull requests are created with a fine-grained `DATASET_SYNC_TOKEN` that has access only to this repository and the `contents: write` and `pull-requests: write` permissions.
6. The Nova Poshta reference API is used without an API key.
7. When a mapping is missing, checkout hides the carrier for the selected settlement and emits a `mapping_missing` event.
8. The canonical dataset includes every official settlement, including settlements without branches and cities with special status.
9. GitHub Releases are not used in the MVP. Files in `main` are the source of truth.
10. A KATOTTG code has at most one runtime mapping per carrier.
11. Automatic fuzzy matching is prohibited.
12. KOATUU values from Nova Poshta and Meest are used for diagnostics and consistency validation, but do not establish a relationship with KATOTTG because the generator has no authoritative `KOATUU → KATOTTG` crosswalk.

## 3. Out of Scope

- storing branches, parcel lockers, and pickup points;
- synchronizing branch statuses and schedules;
- streets, buildings, and apartment addresses;
- delivery cost or time calculation;
- finding the nearest branch;
- Google Places and commercial geocoders;
- AI matching in the production pipeline;
- a runtime database;
- automatically accepting fuzzy matches;
- publishing the dataset as an npm package;
- creating a GitHub Release.

## 4. Repository Structure

```text
carrier-api/
├── .github/
│   └── workflows/
│       └── sync-ua-carrier-settlements.yml
├── datasets/
│   └── ua-carrier-settlements/
│       ├── settlements.json
│       ├── carrier-mappings.json
│       ├── manifest.json
│       └── reports/
│           ├── summary.json
│           ├── ambiguous.json
│           ├── unresolved.json
│           └── removed.json
└── tools/
    └── ua-carrier-settlements/
        ├── package.json
        ├── tsconfig.json
        ├── fixtures/
        ├── overrides/
        │   ├── mappings.json
        │   ├── exclusions.json
        │   └── aliases.json
        ├── src/
        │   ├── cli.ts
        │   ├── config.ts
        │   ├── domain.ts
        │   ├── download.ts
        │   ├── normalize.ts
        │   ├── match.ts
        │   ├── generate.ts
        │   ├── validate.ts
        │   └── sources/
        │       ├── katottg.ts
        │       ├── nova-poshta.ts
        │       └── meest.ts
        └── tests/
```

`tools/ua-carrier-settlements` is a private Yarn workspace. The root `package.json` adds the `tools/ua-carrier-settlements` workspace and these commands:

```json
{
  "dataset:sync": "yarn workspace @shopana/ua-carrier-settlement-tools sync",
  "dataset:validate": "yarn workspace @shopana/ua-carrier-settlement-tools validate",
  "dataset:test": "yarn workspace @shopana/ua-carrier-settlement-tools test"
}
```

The workspace declares direct dependencies for the TypeScript runner, runtime schemas, XLSX parsing, and ZIP parsing. It does not depend on hoisted development dependencies from other packages and is not published.

## 5. Data Sources

### 5.1. KATOTTG

Official page:

```text
https://mindev.gov.ua/diialnist/rozvytok-mistsevoho-samovriaduvannia/
kodyfikator-administratyvno-terytorialnykh-odynyts-ta-terytorii-terytorialnykh-hromad
```

Current version when this plan was finalized:

```text
version: 2026-07-07
url: https://mindev.gov.ua/storage/app/sites/1/uploaded-files/kodifikator-07-07.xlsx
sha256: 5c5317759b2b90208e9b00338bc3db3c5e694272a166acf73f1543b3e18ecbea
```

The importer:

1. Downloads the official HTML page.
2. Finds every `Кодифікатор DD.MM.YYYY` section.
3. Selects the greatest valid calendar date that does not exceed the run date.
4. Uses only the XLSX link from that same HTML section.
5. Allows the final download host only when it is `mindev.gov.ua`, `mininfra.gov.ua`, or `mtu.gov.ua`.
6. Validates the redirect chain, Content-Type, magic bytes, size, and SHA-256 of the downloaded file.
7. Validates the `Кодифікатор` sheet and the `Перший рівень`, `Другий рівень`, `Третій рівень`, `Четвертий рівень`, `Додатковий рівень`, `Категорія об’єкта`, and `Назва об’єкта` columns.
8. Stores the section date, URL, file SHA-256, and normalized SHA-256 in the manifest.

Imported categories:

| Category | Meaning | Runtime type | Level |
|---|---|---|---|
| `M` | місто | `city` | fourth |
| `C` | село | `village` | fourth |
| `X` | селище | `settlement` | fourth |
| `K` | місто зі спеціальним статусом | `city` | first |

Category `B` represents a district within a city and is not imported.

For `M`, `C`, and `X`:

```text
region    = first level
district  = second level
community = third level
katottg   = fourth level
```

For `K`:

```text
katottg   = first level
region    = the same code and name
district  = null
community = null
```

Control values for version 2026-07-07:

```text
C = 27,261
X =  1,979
M =    461
K =      2
total = 29,703
```

The sanity range is `28_000..32_000`. Kyiv `UA80000000000093317` and Sevastopol `UA85000000000065278` are mandatory records.

### 5.2. Nova Poshta

Source:

```text
POST https://api.novaposhta.ua/v2.0/json/
modelName: AddressGeneral
calledMethod: getSettlements
methodProperties:
  Page: 1..
  Limit: 500
```

No API key is sent.

Used fields:

- `Ref` — runtime `settlementRef`;
- `Description`;
- `DescriptionRu`;
- `SettlementType`;
- `SettlementTypeDescription`;
- `Area` and `AreaDescription`;
- `Region` and `RegionsDescription`;
- `IndexCOATSU1` — KOATUU;
- `Warehouse`;
- `AddressDeliveryAllowed`.

`AddressGeneral/getWarehouses` accepts `SettlementRef`, so `CityRef` and `DeliveryCityRef` are not stored in the dataset.

Verified source size when this plan was finalized:

```text
records: 26,791
unique Ref: 26,791
records with KOATUU: 26,783
```

The loader performs sequential pagination. Parallel page loading is prohibited because the source changes without a snapshot version and parallelism increases the risk of skipped records when pages shift.

A pass is valid when:

- the final page is empty;
- all `Ref` values are unique;
- the record count equals `info.totalCount` from the final non-empty page;
- `info.totalCount` is identical on every page in the pass.

The loader performs two complete sequential passes. The dataset is accepted only when their normalized SHA-256 values are identical. If they differ, a third pass is performed and the last two identical results are accepted. If all three results differ, synchronization fails.

Requests returning `429` or `5xx` are retried with exponential backoff and jitter. Each request has a 30-second timeout and at most five attempts.

Type normalization:

```text
місто                   → city
село                    → village
селище                  → settlement
селище міського типу    → settlement
```

### 5.3. Meest

Source:

```text
https://meest-group.com/media/location/locations.rar
```

Despite the `.rar` extension and `application/x-rar-compressed` Content-Type, the current file is a ZIP archive. The format is determined only from magic bytes. ZIP is the supported importer format; any other magic type fails synchronization.

Files in the archive use CP1251 encoding and `;` as the delimiter:

```text
Области.txt
Районы.txt
Города.txt
СтруктураФайлів.xlsx
```

Other files are not read.

The importer does not rely only on filenames. `СтруктураФайлів.xlsx` defines the expected schemas, after which tables are identified by their column counts and UUID referential integrity: regions have 3 columns, districts have 4, and cities have 10. Multiple files matching one schema or broken UUID references fail synchronization.

`Города.txt` contains exactly 10 columns:

```text
UIDГорода
Наименование
НаименованиеRU
Вид
UIDРайон
UIDОбласть
UIDПодразделения
KодKОАТУУ
ЗонаДоставки
ОтсутствуетАО
```

The archive contains only the Ukrainian directory and has no `CountryUUID`. No additional country filtering is performed.

Used fields:

- `UIDГорода` — runtime `cityUuid`;
- Ukrainian and Russian names;
- `Вид` as a diagnostic hint;
- `UIDРайон`, joined to `Районы.txt`;
- `UIDОбласть`, joined to `Области.txt`;
- `KодKОАТУУ`;
- `ЗонаДоставки` and `ОтсутствуетАО` only for reports.

The Meest type is not grounds for rejecting a candidate because the source classifies some settlements as `село` or `місто`.

Verified source size when this plan was finalized:

```text
records: 25,396
unique city UUID: 25,396
records with KOATUU: 24,936
unique KOATUU: 24,736
```

The loader validates ETag, Last-Modified, size, magic bytes, safe archive paths, encoding, delimiter, and column counts. The source hash is calculated from the sorted normalized city list. Changes to streets, postal codes, and subdivisions do not change the dataset.

### 5.4. Ukrposhta

Ukrposhta is not a generator source. Its directory is not downloaded, credentials are not passed, and its schema and counts are not included in the manifest.

Checkout uses the selected canonical KATOTTG directly:

```text
GET /address-classifier-ws/get_postoffices_by_postcode_cityid_cityvpzid
    ?city_katottg=<KATOTTG without UA>
```

Authentication for this runtime request belongs to the checkout integration and is outside the dataset workflow.

The current official KATOTTG does not contain a KOATUU field, and the generator has no available source containing a complete authoritative `KOATUU → KATOTTG` crosswalk. Therefore, KOATUU values from Nova Poshta and Meest are not used as an independent mapping rule.

## 6. Internal Model

```ts
type SettlementType = 'city' | 'village' | 'settlement';
type CarrierCode = 'nova_poshta' | 'meest';

interface CanonicalSettlement {
  katottg: string;
  nameUa: string;
  type: SettlementType;
  region: {
    katottg: string;
    nameUa: string;
  };
  district: {
    katottg: string;
    nameUa: string;
  } | null;
  community: {
    katottg: string;
    nameUa: string;
  } | null;
}

interface SourceSettlement {
  source: CarrierCode;
  externalId: string;
  nameUa: string;
  nameRu?: string;
  type?: SettlementType;
  typeReliable: boolean;
  regionNameUa?: string;
  districtNameUa?: string;
  koatuu?: string;
  legacyNames?: string[];
  rawSourceKey: string;
}

type MatchMethod =
  | 'manual_override'
  | 'exact_full_hierarchy'
  | 'exact_region_unique'
  | 'exact_global_unique';

interface SettlementMapping {
  katottg: string;
  carrier: CarrierCode;
  externalId: string;
  method: MatchMethod;
}
```

## 7. Normalization

Common transformations:

- Unicode NFC;
- `toLocaleLowerCase('uk-UA')`;
- trim and collapse repeated whitespace;
- normalize the `’`, `'`, and `` ` `` apostrophes;
- normalize Unicode hyphens to `-` without removing the hyphen;
- separate known type abbreviations such as `м.`, `с.`, `смт`, and `с-ще`;
- remove a period only after a known abbreviation;
- remove the `область`, `обл.`, `район`, and `р-н` suffixes only from administrative fields;
- store Ukrainian and Russian names separately;
- store KATOTTG only as `UA` followed by 17 digits;
- store KOATUU as a string to preserve leading zeroes.

Prohibited transformations:

- treating `і`, `и`, `ї`, `е`, and `є` as equivalent;
- accepting a match based on automatic transliteration;
- removing meaningful hyphens;
- accepting a fuzzy result;
- guessing a new name from an old name without a source legacy name or alias;
- using the unreliable Meest type as a required condition.

## 8. Matching Algorithm

### 8.1. Manual Mapping

A valid manual override is applied first. Its target must exist in the canonical dataset and its source external ID must exist in the current source snapshot.

### 8.2. Exact Full Hierarchy Match

The only candidate is accepted when these values match:

- Ukrainian name;
- region;
- district;
- reliable type when `typeReliable = true`.

### 8.3. Exact Region Match

This rule is used only when the source has no district. The only candidate with the same name, region, and reliable type is accepted.

### 8.4. Globally Unique Name

This rule is used only when:

- the name is unique across the canonical dataset;
- the source has no administrative data or that data does not contradict the candidate;
- the reliable type matches.

### 8.5. KOATUU Validation

KOATUU does not select a canonical candidate because the generator has no authoritative `KOATUU → KATOTTG` relationship.

After mappings have been accepted through manual or exact rules, KOATUU is used as a consistency invariant:

- two records from the same carrier with the same non-empty KOATUU cannot automatically point to different KATOTTG codes;
- Nova Poshta and Meest records with the same unique KOATUU and matching name and region must point to the same KATOTTG code;
- a conflict moves all affected records to `ambiguous.json` and removes their automatic mappings;
- a matching KOATUU does not create a mapping for a record that did not independently pass a manual or exact rule.

### 8.6. Aliases and Legacy Names

Source legacy names and `overrides/aliases.json` are used only to find candidates. The final candidate must pass the same administrative checks.

### 8.7. Fuzzy Suggestions

Levenshtein and trigram similarity are used only to rank candidates in `ambiguous.json`. A fuzzy result never creates a runtime mapping.

### 8.8. Exclusions

`overrides/exclusions.json` contains technical, foreign, duplicate, and service records. Each record is keyed as `${source}:${externalId}` and contains a `reason`.

## 9. Generated Data

### 9.1. `settlements.json`

```json
{
  "schemaVersion": 1,
  "settlements": [
    {
      "katottg": "UA80000000000093317",
      "nameUa": "Київ",
      "type": "city",
      "region": {
        "katottg": "UA80000000000093317",
        "nameUa": "Київ"
      },
      "district": null,
      "community": null
    }
  ]
}
```

Records are sorted by the UTF-8 code-unit value of `katottg` without a locale-dependent comparator.

### 9.2. `carrier-mappings.json`

```json
{
  "schemaVersion": 1,
  "mappings": {
    "UA80000000000093317": {
      "nova_poshta": {
        "settlementRef": "external-ref"
      },
      "meest": {
        "cityUuid": "external-uuid"
      }
    }
  }
}
```

Ukrposhta is intentionally absent. The serializer fixes the order of KATOTTG codes, carriers, and fields.

### 9.3. `manifest.json`

```json
{
  "schemaVersion": 1,
  "datasetVersion": "sha256-prefix",
  "sources": {
    "katottg": {
      "version": "2026-07-07",
      "url": "https://mindev.gov.ua/storage/app/sites/1/uploaded-files/kodifikator-07-07.xlsx",
      "fileSha256": "...",
      "normalizedSha256": "...",
      "records": 29703
    },
    "nova_poshta": {
      "url": "https://api.novaposhta.ua/v2.0/json/",
      "normalizedSha256": "...",
      "records": 26791
    },
    "meest": {
      "url": "https://meest-group.com/media/location/locations.rar",
      "normalizedSha256": "...",
      "records": 25396
    }
  },
  "runtimeFiles": {
    "settlements.json": {
      "sha256": "...",
      "bytes": 0
    },
    "carrier-mappings.json": {
      "sha256": "...",
      "bytes": 0
    }
  },
  "counts": {
    "settlements": 29703,
    "novaPoshtaMappings": 0,
    "meestMappings": 0,
    "ambiguous": 0,
    "unresolved": 0
  }
}
```

`datasetVersion` is the first 16 hexadecimal characters of the SHA-256 of the canonical byte sequence containing `settlements.json`, `carrier-mappings.json`, and their schema versions. Generation time is not committed.

## 10. Overrides

### 10.1. `mappings.json`

```json
{
  "nova_poshta:external-ref": {
    "katottg": "UA...",
    "reason": "Verified manual mapping"
  }
}
```

### 10.2. `aliases.json`

```json
{
  "meest:external-uuid": {
    "nameUa": "Current official name",
    "reason": "The source uses the former name"
  }
}
```

### 10.3. Rules

- the key always contains the source and external ID;
- `reason` is required;
- the target must exist in the canonical dataset;
- one external ID cannot point to multiple KATOTTG codes;
- one `katottg + carrier` pair cannot receive multiple external IDs;
- an override for an absent source record remains in Git as an orphan, appears in the report, and is not generated into runtime mappings;
- when the source record returns, the override becomes active again after full validation.

## 11. Validation and Quality Gates

The pipeline fails when any condition is true:

1. The canonical count is outside `28_000..32_000`.
2. Kyiv or Sevastopol is missing as a category `K` record.
3. A KATOTTG code is duplicated or malformed.
4. A carrier external ID is duplicated.
5. One `katottg + carrier` pair receives more than one external ID.
6. A mapping points to a missing KATOTTG code.
7. A KOATUU invariant contradicts accepted mappings.
8. A complete source hierarchy contradicts the canonical hierarchy.
9. A required XLSX, ZIP, or API response format changes.
10. Two Nova Poshta passes do not produce a stable normalized hash.
11. More than 1% of mappings for any carrier disappear.
12. The source record count for any carrier drops by more than 5%.
13. An existing external ID is unexpectedly remapped to another KATOTTG code.
14. Generated files fail their runtime schemas.
15. Repeated offline generation produces a diff.
16. Generated output contains a token, Authorization header, or raw request metadata.

Thresholds are applied separately for each carrier. On the first run, regression gates compare against fixed fixture expectations. After the first merge, they compare against the committed manifest and mappings from `main`.

## 12. Reports

### `summary.json`

Contains, per source:

- source records;
- records with KOATUU;
- KOATUU conflicts;
- manual mappings;
- exact hierarchy mappings;
- mapped records;
- ambiguous records;
- unresolved records;
- excluded records;
- orphan overrides.

### `ambiguous.json`

Contains the source ID, original name and administrative fields, KOATUU, canonical candidates, rejection reasons, and a fuzzy score used only as a suggestion.

### `unresolved.json`

Contains records without an accepted candidate and exactly one reason:

```text
name_mismatch
hierarchy_mismatch
multiple_candidates
service_object
blocked_source_record
```

### `removed.json`

Contains missing external IDs, removed KATOTTG codes, orphan overrides, and remaps. Any remap fails the quality gate and prevents a dataset PR until an explicit reviewed override is added or the importer is corrected.

## 13. CLI

```text
yarn dataset:sync
yarn dataset:validate
yarn dataset:test
```

Workspace commands:

```text
sync       download all sources, match, validate, and generate
fetch      download and normalize sources
match      match saved snapshots
validate   validate the committed dataset and overrides
report     rebuild reports
```

Options:

```text
--work-dir <path>
--output-dir <path>
--carrier <nova_poshta|meest>
--offline
--fixtures
--verbose
```

`--offline` blocks network calls at the HTTP client factory. `--fixtures` automatically enables `--offline`.

## 14. GitHub Actions

```yaml
on:
  workflow_dispatch:
  schedule:
    - cron: '17 3 * * *'

permissions:
  contents: read

concurrency:
  group: sync-ua-carrier-settlements
  cancel-in-progress: false
```

Write operations use `DATASET_SYNC_TOKEN`, not the job's `GITHUB_TOKEN`.

Workflow:

1. Check out `main` with full history.
2. Set up Node.js 24 and Yarn 1.22.22.
3. Run `yarn install --frozen-lockfile`.
4. Create a temporary work directory.
5. Verify that `DATASET_SYNC_TOKEN` exists without printing its value.
6. Run `yarn dataset:sync`.
7. Run `yarn dataset:validate`.
8. Repeat offline generation and require an empty diff.
9. Upload diagnostic reports as an artifact with `if: always()`.
10. Verify that changes are limited to `datasets/ua-carrier-settlements/**`.
11. Exit successfully without a PR when the diff is empty.
12. When the diff is non-empty, update the single `dataset/ua-carrier-settlements` bot branch from current `main`.
13. Create a new draft PR or update the existing PR from that branch.

No PR is created after a quality-gate failure or partial source failure. A repeated workflow updates the existing PR instead of creating another one. After merge, the next run recreates the bot branch from the new `main`.

The PR body contains source versions and hashes, counts before and after, additions and removals, ambiguous and unresolved counts, orphan overrides, a workflow-run link, and a review checklist.

Every third-party Action is pinned to a full commit SHA.

## 15. Security

- `DATASET_SYNC_TOKEN` is stored only in GitHub Secrets.
- Secrets are passed through environment variables, not CLI arguments.
- Authorization headers and request bodies are not logged.
- Download URLs and every redirect are checked against an allowlist.
- Maximum sizes are 10 MiB for KATOTTG XLSX, 50 MiB for the Meest archive, and 10 MiB for an API response page.
- ZIP entries are checked for absolute paths, `..`, symlinks, and duplicate normalized paths.
- Archives are extracted only into a temporary directory.
- Files from archives are never executed.
- Content-Type supplements but does not replace magic-byte validation.
- Generated pull requests are not merged automatically.

## 16. Tests

### Unit Tests

- KATOTTG categories `M/C/X/K/B` and the special hierarchy for Kyiv and Sevastopol;
- Unicode, apostrophes, hyphens, types, and administrative suffixes;
- Nova Poshta pagination stabilization;
- Nova Poshta type normalization;
- Meest ZIP content with a `.rar` extension, CP1251, and 10 columns;
- archive path-traversal fixtures;
- KOATUU consistency between accepted Nova Poshta and Meest mappings;
- unique and duplicate carrier KOATUU values;
- every match method;
- unreliable Meest types;
- overrides, exclusions, and orphan overrides;
- rejection of duplicate `katottg + carrier` pairs;
- deterministic serialization and SHA-256.

### Contract Fixtures

Fixtures contain minimal real, sanitized structures from every generator source. The regular PR test suite runs only offline. Live synchronization runs only in the scheduled or manually dispatched workflow.

### Golden Tests

Mandatory cases:

- Kyiv as category `K`;
- Sevastopol as category `K`;
- identical names within one region;
- a renamed settlement;
- Nova Poshta `селище міського типу`;
- Meest `село` for a canonical `settlement`;
- duplicate KOATUU;
- a source record without KOATUU;
- a technical source record;
- an orphan override.

Expected files are compared byte for byte.

### Full Validation

- JSON and schemas are valid;
- manifest counts equal actual counts;
- runtime file hashes match;
- every KATOTTG code and external ID is unique;
- one `katottg + carrier` pair has at most one mapping;
- every mapping points to a canonical settlement;
- sorting is stable;
- offline regeneration produces an empty diff.

## 17. Implementation Stages

### Stage 1. Workspace, Domain, and CLI

- private tools workspace;
- direct dependencies;
- runtime schemas;
- temporary work directory;
- stable serializer;
- CLI and offline HTTP guard.

Estimate: 1–2 working days.

### Stage 2. KATOTTG

- current HTML-section discovery;
- XLSX importer;
- `M/C/X/K` hierarchy;
- canonical validation;
- `settlements.json` and fixtures.

Estimate: 1–2 working days.

### Stage 3. Source Adapters

- Nova Poshta `getSettlements` with double-pass stabilization;
- Meest ZIP/CP1251 importer;
- source schemas and normalized hashes.

Estimate: 3–5 working days.

### Stage 4. Matcher

- exact rules;
- KOATUU consistency validation;
- aliases, overrides, and exclusions;
- ambiguous and unresolved reports.

Estimate: 2–4 working days.

### Stage 5. Outputs and Quality Gates

- runtime mappings;
- manifest and file hashes;
- summary and removed reports;
- regression comparison;
- deterministic regeneration check.

Estimate: 1–2 working days.

### Stage 6. GitHub Actions

- scheduled and manual triggers;
- secrets;
- artifacts and step summary;
- idempotent bot branch and draft PR;
- failure behavior.

Estimate: 1–2 working days.

### Stage 7. Initial Manual Processing

- review ambiguous and unresolved records;
- mappings, aliases, and exclusions;
- repeated generation;
- coverage review.

Estimate: 1–5 working days, depending on the number of remaining records.

### Stage 8. Checkout Integration

- deploy-time loading by commit SHA;
- SHA-256 validation against the manifest;
- Nova Poshta and Meest lookup;
- direct Ukrposhta runtime request by KATOTTG without involving the dataset generator;
- carrier hiding and telemetry for missing mappings.

Estimate: 1–3 working days outside the generator.

## 18. Runtime Budget

| Step | Budget |
|---|---:|
| KATOTTG | up to 1 minute |
| Nova Poshta, two stable passes | 2–10 minutes |
| Meest | up to 2 minutes |
| Matching, reports, and generation | up to 2 minutes |
| Full workflow | 5–15 minutes |

The workflow timeout is 30 minutes. Each HTTP request has a 30-second timeout.

## 19. Checkout API

```ts
interface CarrierSettlementLookup {
  getNovaPoshta(katottg: string): {
    settlementRef: string;
  } | null;

  getMeest(katottg: string): {
    cityUuid: string;
  } | null;

  getUkrposhtaCityKatottg(katottg: string): string | null;
}
```

`getUkrposhtaCityKatottg` returns the 17 digits after validating the `UA` plus 17 digits format and confirming that the canonical settlement exists. It does not read `carrier-mappings.json`.

When a method returns `null`, checkout hides the carrier and emits `mapping_missing`. A carrier-native fuzzy fallback is prohibited.

## 20. Versioning and Consumption

`schemaVersion` increases only for an incompatible JSON contract change. `datasetVersion` changes when runtime bytes change.

Deploy:

1. Pin the dataset commit SHA.
2. Download all three JSON files from the same revision.
3. Validate `schemaVersion`.
4. Validate file SHA-256 and byte size against the manifest.
5. Store the validated files as a deploy artifact.
6. Do not access GitHub during a checkout request.

## 21. Observability

The workflow summary shows each adapter's duration, source versions and hashes, source record counts, KOATUU conflicts, manual and exact counts, additions and removals, orphan overrides, and the reason no PR was created.

Checkout telemetry:

```text
mapping_missing
carrier_rejected_settlement_id
carrier_returned_no_points
dataset_hash_mismatch
dataset_schema_unsupported
```

## 22. MVP Completion Criteria

1. The current KATOTTG is discovered automatically.
2. For version 2026-07-07, the canonical dataset contains 29,703 records, including Kyiv and Sevastopol.
3. Nova Poshta is imported through `AddressGeneral/getSettlements` without an API key.
4. Meest is imported as ZIP/CP1251 regardless of the `.rar` extension.
5. The dataset generator does not call Ukrposhta and does not require Ukrposhta credentials.
6. Nova Poshta and Meest are matched by exact name and administrative hierarchy; KOATUU validates the consistency of already accepted mappings.
7. Ambiguous records do not enter runtime mappings.
8. One `katottg + carrier` pair has at most one mapping.
9. Manual overrides persist, while orphan overrides are not published at runtime.
10. A partial source failure does not modify the committed dataset.
11. Repeated generation from the same normalized inputs produces an empty diff.
12. The workflow creates or updates one reviewable draft PR only for a safe diff.
13. Checkout obtains the Nova Poshta `SettlementRef` and Meest `cityUuid` by KATOTTG.
14. Checkout passes KATOTTG directly to Ukrposhta.
15. Runtime files contain no branches, secrets, or raw API metadata.

## 23. Pull Request Sequence

### PR 1

- private tools workspace;
- domain and runtime schemas;
- KATOTTG importer with `M/C/X/K`;
- stable generation;
- fixtures and `settlements.json`.

### PR 2

- Nova Poshta and Meest adapters;
- source schemas;
- stable source snapshots;
- adapter tests.

### PR 3

- exact hierarchy matcher;
- KOATUU consistency validation;
- overrides and reports;
- `carrier-mappings.json` and manifest.

### PR 4

- quality gates;
- scheduled workflow;
- idempotent draft PR automation;
- checkout integration documentation.
