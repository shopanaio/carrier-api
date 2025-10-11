# Nova Poshta API - Postman Collection

Postman collection for Nova Poshta API Client.

## Structure

```
postman/novaposhta-api-client/
├── collection.json                      # All services (main collection)
├── address-service.collection.json      # Address service only
├── reference-service.collection.json    # Reference service only
├── environment.json                     # Environment variables
└── README.md                            # Documentation
```

## Quick Start

### 1. Import Collection to Postman

**Option A: Import all services**
1. Open Postman
2. Click **Import** in the top left corner
3. Select `collection.json` file
4. Import `environment.json` file

**Option B: Import specific services**
1. Import `address-service.collection.json` for address operations (6 requests)
2. Import `reference-service.collection.json` for reference data (12 requests)
3. These collections don't require API key

### 2. Setup API Key

1. Go to **Environments**
2. Select **Nova Poshta API - Production**
3. Fill in the `API_KEY` variable with your API key
4. Save changes

### 3. Usage

Select a request from the collection and click **Send**.

## Collection Structure

### 📁 Address Service
Working with addresses, cities, streets, regions (6 requests)

- **Get Settlement Areas** - list of regions/areas (Київська, Львівська, etc.)
- **Get Settlement Country Region** - regions for specific area
- **Get Cities** - search cities with Nova Poshta offices
- **Get Streets** - search streets in a specific city
- **Search Settlements** - online search for settlements
- **Search Settlement Streets** - online search for streets in settlement

### 📁 Reference Service
Reference data (12 requests)

- **Get Cargo Types** - list of cargo types
- **Get Pallets List** - available pallets
- **Get Pack List** - packaging types
- **Get Tires Wheels List** - tires and wheels types
- **Get Cargo Description List** - cargo descriptions
- **Get Message Code Text** - error/warning codes
- **Get Service Types** - delivery service types
- **Get Ownership Forms List** - ownership forms
- **Get Time Intervals** - delivery time intervals
- **Get Pickup Time Intervals** - pickup time intervals
- **Get Backward Delivery Cargo Types** - return shipment types
- **Get Types of Payers for Redelivery** - COD payer types

### 📁 Tracking Service
Package tracking

- **Track Documents** - track documents by number

### 📁 Waybill Service
Waybill management

- **Get Delivery Price** - calculate delivery cost

## Environment Variables

| Variable | Description | Type |
|----------|-------------|------|
| `BASE_URL` | Base API URL | `string` |
| `API_KEY` | API key | `secret` |
| `SENDER_CITY_REF` | Sender city ref (Kyiv) | `string` |
| `RECIPIENT_CITY_REF` | Recipient city ref (Lviv) | `string` |

## Usage Examples

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

### Get Streets

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

### Track Package

```json
{
  "apiKey": "{{API_KEY}}",
  "modelName": "TrackingDocument",
  "calledMethod": "getStatusDocuments",
  "methodProperties": {
    "Documents": [
      {
        "DocumentNumber": "20450123456789",
        "Phone": ""
      }
    ]
  }
}
```

### Calculate Delivery Cost

```json
{
  "apiKey": "{{API_KEY}}",
  "modelName": "InternetDocument",
  "calledMethod": "getDocumentPrice",
  "methodProperties": {
    "CitySender": "{{SENDER_CITY_REF}}",
    "CityRecipient": "{{RECIPIENT_CITY_REF}}",
    "Weight": "1",
    "ServiceType": "WarehouseWarehouse",
    "Cost": "500",
    "CargoType": "Parcel",
    "SeatsAmount": "1"
  }
}
```

## Testing

Each request includes automatic tests that check:
- Response status (200)
- Presence of required fields
- Data structure validity

Tests run automatically after request execution.

## Additional Resources

- [Official Nova Poshta API Documentation](https://devcenter.novaposhta.ua/)
- [GitHub Repository](https://github.com/yourusername/shopana-novaposhta-client)

## Changelog

### v1.0.0 (2025-10-11)
- ✨ Initial collection release
- ✅ Added basic examples for all services
- ✅ Configured environment variables
- ✅ Added automatic tests
