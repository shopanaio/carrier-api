# Nova Poshta API - Postman Collection

Postman collection for Nova Poshta API Client.

## Structure

```
postman/novaposhta-api-client/
├── reference-service.collection.json              # Reference service (12 requests)
├── address-settlement-areas.collection.json       # Settlement areas/regions (4 requests)
├── address-settlement-regions.collection.json     # Settlement regions/districts (6 requests)
├── address-cities.collection.json                 # Cities search (10 requests)
├── address-streets.collection.json                # Streets search (12 requests)
├── address-search-settlements.collection.json     # Online settlement search (12 requests)
├── address-search-streets.collection.json         # Online street search (14 requests)
├── environment.json                               # Environment variables
└── README.md                                      # Documentation
```

## Quick Start

### 1. Import Collection to Postman

**Import specific address collections:**
1. Open Postman
2. Click **Import** in the top left corner
3. Select one or more collection files:
   - `address-settlement-areas.collection.json` - Settlement areas (oblasti)
   - `address-settlement-regions.collection.json` - Settlement regions (districts)
   - `address-cities.collection.json` - Cities search with various examples
   - `address-streets.collection.json` - Streets search in cities
   - `address-search-settlements.collection.json` - Online settlement search
   - `address-search-streets.collection.json` - Online street search with coordinates
   - `reference-service.collection.json` - Reference data (cargo types, packing, etc.)
4. Import `environment.json` file

**Note:** Address collections don't require API key, reference data does

### 2. Setup API Key

1. Go to **Environments**
2. Select **Nova Poshta API - Production**
3. Fill in the `API_KEY` variable with your API key
4. Save changes

### 3. Usage

Select a request from the collection and click **Send**.

## Collection Structure

### 📁 Address - Settlement Areas (4 requests)
Get list of Ukrainian regions/areas (oblasti) - Київська область, Львівська область, etc.

- **Get All Settlement Areas** - Complete list of all areas
- **Get Settlement Areas - With Ref Filter** - Kyiv Oblast details
- **Get Settlement Areas - Lviv Region** - Lviv Oblast details
- **Get Settlement Areas - Odesa Region** - Odesa Oblast details

**Cached:** 12 hours

### 📁 Address - Settlement Regions (6 requests)
Get districts/regions within specific areas

- **Get Kyiv Oblast Regions** - All districts in Kyiv Oblast
- **Get Lviv Oblast Regions** - All districts in Lviv Oblast
- **Get Kharkiv Oblast Regions** - All districts in Kharkiv Oblast
- **Get Odesa Oblast Regions** - All districts in Odesa Oblast
- **Get Dnipro Oblast Regions** - All districts in Dnipro Oblast
- **Get Zaporizhzhia Oblast Regions** - All districts in Zaporizhzhia Oblast

**Cached:** 12 hours

### 📁 Address - Cities (10 requests)
Search and retrieve cities with Nova Poshta offices

- **Get All Cities - Default** - All cities without filters
- **Search Cities - Київ** - Search for Kyiv
- **Search Cities - Львів** - Search for Lviv
- **Search Cities - With Limit** - Limited results (10 records)
- **Search Cities - With Pagination** - First page of 20 results
- **Search Cities - Partial Match** - Partial string search
- **Get City by Ref - Київ** - Get Kyiv by reference
- **Get City by Ref - Львів** - Get Lviv by reference
- **Search Cities - Large Limit** - Up to 100 results
- **Search Cities - Second Page** - Pagination example

**Features:** Search by name, pagination, filtering by ref
**Cached:** 12 hours

### 📁 Address - Streets (12 requests)
Search for streets in specific cities

- **Get Streets - Київ, All Streets** - All streets in Kyiv
- **Search Street - Київ, Хрещатик** - Khreshchatyk street
- **Search Street - Київ, Шевченка** - Shevchenko streets
- **Search Street - Київ, with Limit** - Limited results
- **Search Street - Київ, with Pagination** - Paginated results
- **Get Streets - Львів, All Streets** - All streets in Lviv
- **Search Street - Львів, Свободи** - Freedom Avenue in Lviv
- **Search Street - Одеса, Дерибасівська** - Deribasivska in Odesa
- **Search Street - Харків, Сумська** - Sumska in Kharkiv
- **Search Street - Partial Match** - Partial name search
- **Search Street - Дніпро, Набережна** - Embankment in Dnipro
- **Search Street - Large Limit** - Up to 500 streets

**Features:** Search by CityRef and name, pagination, partial matching
**Cached:** 12 hours

### 📁 Address - Search Settlements (12 requests)
Online fuzzy search for settlements with warehouse information

- **Search Settlements - Київ** - Search for Kyiv
- **Search Settlements - Львів** - Search for Lviv
- **Search Settlements - Partial Match** - Partial name search
- **Search Settlements - Small Village** - Boryspil example
- **Search Settlements - By Postal Code** - Search by postal code (01001)
- **Search Settlements - Common Name** - Common prefix search
- **Search Settlements - Pagination Page 2** - Second page
- **Search Settlements - Large Limit** - Up to 500 results
- **Search Settlements - Ivano-Frankivsk** - Complex multi-word name
- **Search Settlements - Zaporizhzhia** - Zaporizhzhia search
- **Search Settlements - Single Character** - Single char search
- **Search Settlements - Kharkiv Region** - Kharkiv search

**Features:** Fuzzy search, postal code search, warehouse count, pagination
**Returns:** Settlement ref, delivery city ref, region, area, warehouse count
**Cached:** 1 hour

### 📁 Address - Search Streets (14 requests)
Online fuzzy search for streets with GPS coordinates

- **Search Streets - Київ, Хрещатик** - Khreshchatyk in Kyiv
- **Search Streets - Київ, Шевченка** - Shevchenko in Kyiv
- **Search Streets - Partial Name** - Partial match example
- **Search Streets - With Limit 10** - Limited to 10 results
- **Search Streets - Without Limit** - Default limit
- **Search Streets - Lviv, Svobody** - Freedom Avenue in Lviv
- **Search Streets - Lviv, Kopernyka** - Kopernyk street in Lviv
- **Search Streets - Odesa, Deribasivska** - Deribasivska in Odesa
- **Search Streets - Kharkiv, Sumska** - Sumska in Kharkiv
- **Search Streets - Dnipro, Embankment** - Embankment in Dnipro
- **Search Streets - Common Pattern** - Pattern search
- **Search Streets - Single Character** - Single char search
- **Search Streets - Maximum Limit** - Up to 500 results
- **Search Streets - Zaporizhzhia** - Soborny Avenue

**Features:** Real-time search, GPS coordinates (lat/lon), street types
**Returns:** Settlement ref, street ref, full name, type, coordinates
**Cached:** 1 hour

### 📁 Reference Service (12 requests)
Reference data for deliveries

- **Get Cargo Types** - List of cargo types
- **Get Pallets List** - Available pallets
- **Get Pack List** - Packaging types
- **Get Tires Wheels List** - Tires and wheels types
- **Get Cargo Description List** - Cargo descriptions
- **Get Message Code Text** - Error/warning codes
- **Get Service Types** - Delivery service types
- **Get Ownership Forms List** - Ownership forms
- **Get Time Intervals** - Delivery time intervals
- **Get Pickup Time Intervals** - Pickup time intervals
- **Get Backward Delivery Cargo Types** - Return shipment types
- **Get Types of Payers for Redelivery** - COD payer types

**Requires:** API Key

## Environment Variables

| Variable | Description | Type |
|----------|-------------|------|
| `BASE_URL` | Base API URL | `string` |
| `API_KEY` | API key | `secret` |
| `SENDER_CITY_REF` | Sender city ref (Kyiv) | `string` |
| `RECIPIENT_CITY_REF` | Recipient city ref (Lviv) | `string` |

## Usage Examples

### Get Settlement Areas

```json
{
  "apiKey": "{{API_KEY}}",
  "modelName": "Address",
  "calledMethod": "getSettlementAreas",
  "methodProperties": {}
}
```

**Response includes:** Area name (Київська область), ref, administrative center

### Get Settlement Regions

```json
{
  "apiKey": "{{API_KEY}}",
  "modelName": "Address",
  "calledMethod": "getSettlementCountryRegion",
  "methodProperties": {
    "AreaRef": "71508128-9b87-11de-822f-000c2965ae0e"
  }
}
```

**Response includes:** Region name, ref, type, administrative center

### Search Cities

```json
{
  "apiKey": "{{API_KEY}}",
  "modelName": "Address",
  "calledMethod": "getCities",
  "methodProperties": {
    "FindByString": "Київ",
    "Limit": "20"
  }
}
```

**Response includes:** City name (UA/RU), ref, delivery days, area, settlement type

### Search Streets in City

```json
{
  "apiKey": "{{API_KEY}}",
  "modelName": "Address",
  "calledMethod": "getStreet",
  "methodProperties": {
    "CityRef": "8d5a980d-391c-11dd-90d9-001a92567626",
    "FindByString": "Хрещатик",
    "Limit": "20"
  }
}
```

**Response includes:** Street name, ref, type, type ref

### Search Settlements Online

```json
{
  "apiKey": "{{API_KEY}}",
  "modelName": "Address",
  "calledMethod": "searchSettlements",
  "methodProperties": {
    "CityName": "Київ",
    "Limit": "50",
    "Page": "1"
  }
}
```

**Response includes:** Total count, settlement name, area, region, warehouse count, settlement ref, delivery city ref

### Search Streets Online (with coordinates)

```json
{
  "apiKey": "{{API_KEY}}",
  "modelName": "Address",
  "calledMethod": "searchSettlementStreets",
  "methodProperties": {
    "StreetName": "Хрещатик",
    "SettlementRef": "e718a680-4b33-11e4-ab6d-005056801329",
    "Limit": "50"
  }
}
```

**Response includes:** Total count, street name (UA/RU), settlement ref, street ref, full name, type, GPS coordinates (lat/lon)

## Testing

Each request includes automatic tests that check:
- Response status (200)
- Presence of required fields
- Data structure validity

Tests run automatically after request execution.

## Additional Resources

- [Official Nova Poshta API Documentation](https://devcenter.novaposhta.ua/)
- [GitHub Repository](https://github.com/yourusername/shopana-novaposhta-client)

## API Features Demonstrated

### Settlement Areas Collection
- Get all Ukrainian regions/areas (oblasti)
- Filter by specific area reference
- Examples for major regions (Kyiv, Lviv, Odesa)

### Settlement Regions Collection
- Get districts within each oblast
- Examples for 6 major oblasts
- Comprehensive coverage of administrative divisions

### Cities Collection
- Search by partial name
- Get all cities or filter by string
- Pagination support (Page + Limit)
- Get city by exact reference
- Examples with various search patterns
- Up to 500 records per page

### Streets Collection
- Search streets by city reference (required)
- Optional name filtering
- Pagination support
- Examples for major cities (Kyiv, Lviv, Odesa, Kharkiv, Dnipro)
- Famous streets demonstration
- Partial and full name matching
- Up to 500 records per page

### Search Settlements Collection
- **Real-time fuzzy search**
- Search by name or postal code
- Returns warehouse availability count
- Pagination support (Page + Limit required)
- Settlement ref for further queries
- Delivery city ref for delivery operations
- Region and area information
- Settlement type codes (city, village, etc.)

### Search Streets Collection
- **Real-time fuzzy search with GPS**
- GPS coordinates (latitude/longitude) for each street
- Search in specific settlement
- Street type information (вулиця, проспект, бульвар, etc.)
- Full street presentation format
- Optional limit parameter
- Both Ukrainian and Russian names
- Settlement and street references

## Common Patterns

### Hierarchical Address Flow
1. Get settlement areas → `getSettlementAreas`
2. Get regions in area → `getSettlementCountryRegion`
3. Search for settlement → `searchSettlements`
4. Search for street → `searchSettlementStreets`

### Direct City/Street Flow
1. Search cities → `getCities`
2. Get streets in city → `getStreet`

### Key Differences
- `getCities` + `getStreet` - Works with **City Ref** (for warehouse addresses)
- `searchSettlements` + `searchSettlementStreets` - Works with **Settlement Ref** (for door-to-door delivery)

## Changelog

### v2.0.0 (2025-10-11)
- ✨ Split address service into 6 specialized collections
- ✅ Added 58 comprehensive examples for address operations
- ✅ Demonstrated all parameter combinations
- ✅ Added examples for major Ukrainian cities
- ✅ Included postal code search examples
- ✅ Added GPS coordinates examples
- ✅ Comprehensive pagination demonstrations

### v1.0.0 (2025-10-11)
- ✨ Initial collection release
- ✅ Added basic examples for all services
- ✅ Configured environment variables
- ✅ Added automatic tests
