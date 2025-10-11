# Nova Poshta API - Postman Collection

Postman collection for Nova Poshta API Client.

## Structure

```
postman/novaposhta-api-client/
├── reference-service.collection.json              # Reference service (12 requests)
├── address-settlement-areas.collection.json       # Settlement areas/regions (2 requests)
├── address-settlement-regions.collection.json     # Settlement regions/districts (2 requests)
├── address-cities.collection.json                 # Cities search (5 requests)
├── address-streets.collection.json                # Streets search (9 requests)
├── address-search-settlements.collection.json     # Online settlement search (5 requests)
├── address-search-streets.collection.json         # Online street search (5 requests)
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

### 2. Setup API Key (Optional for Address Collections)

**Note:** Address collections work without API key. API key is only required for Reference Service.

If you want to use Reference Service:
1. Go to **Environments**
2. Select **Nova Poshta API - Production**
3. Fill in the `API_KEY` variable with your API key
4. Save changes

### 3. Usage

Select a request from the collection and click **Send**.

## Collection Structure

### 📁 Address - Settlement Areas (2 requests)
Get list of Ukrainian regions/areas (oblasti) - Київська область, Львівська область, etc.

- **Get All Settlement Areas** - Complete list of all areas
- **Get Settlement Area by Ref** - Get specific area by reference

### 📁 Address - Settlement Regions (2 requests)
Get districts/regions within specific areas

- **Get Oblast Regions - Kyiv Example** - All districts in Kyiv Oblast
- **Get Oblast Regions - Lviv Example** - All districts in Lviv Oblast

**Required:** AreaRef from getSettlementAreas

### 📁 Address - Cities (5 requests)
Search and retrieve cities with Nova Poshta offices

- **Get All Cities** - All cities without filters
- **Search Cities by Name** - Search with partial name match
- **Search Cities with Limit** - Limit number of results
- **Search Cities with Pagination** - Use Page and Limit for pagination
- **Get City by Ref** - Get specific city by reference

**Features:** Search by name, pagination, filtering by ref

### 📁 Address - Streets (9 requests)
Search for streets in specific cities

- **Get All Streets in City** - All streets in city (CityRef required)
- **Search Street by Name** - Search streets by name in city
- **Search Streets with Limit** - Limit results (max 500 per page)
- **Search Streets - Page 1** - First page (records 1-50)
- **Search Streets - Page 2** - Second page (records 51-100)
- **Search Streets - Page 3** - Third page (records 101-150)
- **Search Streets - Large Page Size** - Max 500 records per page
- **Search Streets - Page 2 with Max Limit** - Page 2 with 500 limit (records 501-1000)
- **Search Streets - Different City** - Example for different city

**Features:** Search by CityRef and name, pagination, partial matching
**Pagination:** Supports Page + Limit, up to 500 records per page

### 📁 Address - Search Settlements (5 requests)
Online fuzzy search for any settlement (cities, towns, villages) with warehouse information

- **Search Settlements - Basic** - Standard search with all parameters
- **Search Settlements - Partial Match** - Fuzzy search with partial name
- **Search Settlements - By Postal Code** - Search by postal index
- **Search Settlements - With Pagination** - Get next pages of results
- **Search Settlements - Large Limit** - Maximum 500 records per page

**Features:** Fuzzy search, postal code search, warehouse count, area/region info, pagination
**Returns:** SettlementRef, **deliveryCity (CityRef for waybills)**, region, area, warehouse count, settlement type
**Use when:** Finding small villages/towns, checking warehouse availability, or getting CityRef for any settlement

### 📁 Address - Search Streets (5 requests)
Online fuzzy search for streets in settlements with GPS coordinates

- **Search Streets - Basic** - Standard search with GPS coordinates
- **Search Streets - Partial Name** - Fuzzy search with partial name
- **Search Streets - Without Limit** - Limit is optional parameter
- **Search Streets - Different Settlement** - Example for different settlement
- **Search Streets - Maximum Limit** - Maximum 500 records per page

**Features:** Real-time search, **GPS coordinates (lat/lon)**, street types, UA/RU names
**Returns:** SettlementRef, street ref, full formatted name, type, **GPS coordinates**
**Use when:** Need precise geolocation, working with settlement-based addresses, or mapping

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
  "modelName": "Address",
  "calledMethod": "getSettlementAreas",
  "methodProperties": {}
}
```

**Response includes:** Area name (Київська область), ref, administrative center

### Get Settlement Regions

```json
{
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

### Pattern 1: Direct City Search (for known cities)
1. Search cities → `getCities` → get **CityRef**
2. Get streets in city → `getStreet` (using CityRef)
3. Use CityRef + street info for waybill creation

**Best for:** Working with major known cities (Kyiv, Lviv, Odesa, etc.)

### Pattern 2: Universal Settlement Search (for any location)
1. Search settlement → `searchSettlements` → get **SettlementRef** + **deliveryCity (CityRef)**
2. Search streets → `searchSettlementStreets` (using SettlementRef) → get **GPS coordinates**
3. Use deliveryCity (CityRef) + street info + GPS for waybill creation

**Best for:** Finding small villages/towns, checking warehouse availability, needing GPS coordinates

### Pattern 3: Hierarchical Browse
1. Get settlement areas → `getSettlementAreas` (list all oblasti)
2. Get regions in area → `getSettlementCountryRegion` (list districts)
3. Search for settlement → `searchSettlements` (find specific town/village)
4. Search for street → `searchSettlementStreets` (get street with GPS)

**Best for:** Building address selection UI with region/area filters

### Key Differences

#### getStreet vs searchSettlementStreets

**`getStreet` (Direct city search):**
- Uses **CityRef** from `getCities`
- For working with **known major cities**
- Returns: `ref`, `description`, `streetsType`, `streetsTypeRef`
- Optional: `FindByString`
- Supports: Full pagination (Page + Limit)
- Use when: You already know the city (Kyiv, Lviv, etc.)

**`searchSettlements` + `searchSettlementStreets` (Universal search):**
- Uses **SettlementRef** from `searchSettlements`
- For **finding any settlement** (cities, towns, villages)
- `searchSettlements` returns **both** `SettlementRef` AND `deliveryCity` (CityRef)
- Returns: All above + **GPS coordinates (lat/lon)**, full name (`present`), both UA/RU names, `totalCount`
- Required: `StreetName` + `SettlementRef`
- Optional: `Limit` only (no Page parameter)
- Includes: Geographical location for precise address
- Use when: Searching for any settlement or need GPS coordinates

**Quick Comparison:**

| Feature | getStreet | searchSettlementStreets |
|---------|-----------|------------------------|
| **Input Ref** | CityRef | SettlementRef |
| **Use Case** | Known cities | Universal settlement search |
| **GPS Coordinates** | ❌ No | ✅ Yes (lat/lon) |
| **Names** | UA only | UA + RU |
| **Pagination** | Page + Limit | Limit only |
| **Total Count** | ❌ No | ✅ Yes |
| **Settlement Info** | ❌ No | ✅ Returns warehouse count, area, region |

**When to use:**
- `getCities` + `getStreet` → When working with **known major cities**
- `searchSettlements` + `searchSettlementStreets` → When need to **find any settlement** (including villages), get warehouse info, or need **GPS coordinates**

**Example Response Differences:**

```javascript
// getStreet response - simple street info
{
  ref: "8d5a980d-...",              // Street ref
  description: "Хрещатик",
  streetsType: "Street",
  streetsTypeRef: "..."
}

// searchSettlements response - includes deliveryCity!
{
  ref: "e718a680-...",              // SettlementRef
  deliveryCity: "8d5a980d-...",    // ← CityRef for waybill creation!
  mainDescription: "Київ",
  area: "Київська область",
  warehouses: 150,                  // Number of warehouses
  settlementTypeCode: "city"
}

// searchSettlementStreets response - full info with GPS
{
  settlementRef: "e718a680-...",           // Settlement ref
  settlementStreetRef: "8d5a980d-...",     // Street ref
  settlementStreetDescription: "Хрещатик", // Ukrainian name
  settlementStreetDescriptionRu: "Крещатик", // Russian name
  present: "вул. Хрещатик",                 // Full formatted name
  streetsType: "Street",
  streetsTypeDescription: "Street",
  location: {
    lat: "50.4501",  // ✅ GPS for maps/navigation
    lon: "30.5234"
  }
}
```
