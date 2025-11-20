<div align="center">

# @shopana/novaposhta-api-client

**Type-safe Nova Poshta API client for Node.js and browsers**

[![npm version](https://img.shields.io/npm/v/@shopana/novaposhta-api-client.svg?style=flat-square)](https://www.npmjs.com/package/@shopana/novaposhta-api-client)
[![Bundle Size](https://img.shields.io/bundlephobia/minzip/@shopana/novaposhta-api-client?style=flat-square)](https://bundlephobia.com/package/@shopana/novaposhta-api-client)
[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg?style=flat-square)](https://www.apache.org/licenses/LICENSE-2.0)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg?style=flat-square)](https://www.typescriptlang.org/)

**Lightweight, plugin-based, transport-agnostic API client with complete type safety**

[Features](#-features) • [Installation](#-installation) • [Quick Start](#-quick-start) • [Documentation](#-documentation) • [Examples](#-examples)

</div>

---

## 🎯 Overview

Modern Nova Poshta API client built with TypeScript, featuring **plugin architecture** for tree-shaking, **namespaced API** for clarity, and **transport-agnostic** design for flexibility.

### Why Choose This Client?

- 🔌 **Plugin Architecture**: Use only the services you need - tree-shake the rest
- 📛 **Namespaced API**: Clean calls like `client.address.*`, `client.tracking.*`, `client.waybill.*`
- 🎨 **Transport Agnostic**: Works with fetch, axios, or your custom HTTP client
- 🎯 **100% Type-Safe**: Full TypeScript support with strict typing
- 🌐 **Universal**: Runs in Node.js, browsers, and edge runtimes
- 🌳 **Tree-Shakeable**: Optimal bundle size - only bundle what you use
- 🧪 **Testable**: Easy mocking via transport injection
- 📦 **Zero Dependencies**: Core client has no runtime dependencies

---

## 🚀 Installation

```bash
# NPM
npm install @shopana/novaposhta-api-client @shopana/novaposhta-transport-fetch

# Yarn
yarn add @shopana/novaposhta-api-client @shopana/novaposhta-transport-fetch

# PNPM
pnpm add @shopana/novaposhta-api-client @shopana/novaposhta-transport-fetch
```

---

## ⚡ Quick Start

```typescript
import {
  createClient,
  AddressService,
  CounterpartyService,
  ContactPersonService,
  ReferenceService,
  TrackingService,
  WaybillService,
} from '@shopana/novaposhta-api-client';
import { createFetchHttpTransport } from '@shopana/novaposhta-transport-fetch';

const client = createClient({
  transport: createFetchHttpTransport(),           // external transport (HTTP POST JSON)
  baseUrl: 'https://api.novaposhta.ua/v2.0/json/', // NP JSON endpoint
  // apiKey is optional; it will be sent only if provided
  apiKey: process.env.NP_API_KEY,
})
  .use(new AddressService())
  .use(new CounterpartyService())
  .use(new ContactPersonService())
  .use(new ReferenceService())
  .use(new TrackingService())
  .use(new WaybillService());

// Namespaced API
const cities = await client.address.getCities({});
const cargoTypes = await client.reference.getCargoTypes();
const tracked = await client.tracking.trackDocument('20400048799000');
```

## Counterparty Management

### Get Counterparties

```ts
const senders = await client.counterparty.getCounterparties({
  CounterpartyProperty: 'Sender',
  Page: 1,
});
```

### Create Private Person Counterparty

```ts
const newRecipient = await client.counterparty.save({
  CounterpartyType: 'PrivatePerson',
  CounterpartyProperty: 'Recipient',
  FirstName: 'Іван',
  LastName: 'Петренко',
  Phone: '380501234567',
  Email: 'ivan@example.com',
  CityRef: 'city-ref',
});
```

### Create Organization Counterparty

```ts
const organization = await client.counterparty.save({
  CounterpartyType: 'Organization',
  CounterpartyProperty: 'Sender',
  Phone: '380671234567',
  Email: 'office@company.com',
  OwnershipForm: 'ТОВ',    // ownership form ref
  EDRPOU: '12345678',      // tax code
  // Optional contact person
  FirstName: 'Марія',
  LastName: 'Менеджер',
  CityRef: 'city-ref',
});
```

### Get Counterparty Details

```ts
// Get addresses
const addresses = await client.counterparty.getCounterpartyAddresses({
  Ref: 'counterparty-ref',
  Page: 1,
});

// Get contact persons
const contacts = await client.counterparty.getCounterpartyContactPersons({
  Ref: 'counterparty-ref',
});

// Get available options (payment permissions, delays, etc.)
const options = await client.counterparty.getCounterpartyOptions({
  Ref: 'counterparty-ref',
});
```

## Contact Person Management

### Create Contact Person

```ts
const contact = await client.contactPerson.save({
  CounterpartyRef: 'counterparty-ref',
  FirstName: 'Марія',
  LastName: 'Коваленко',
  Phone: '380671234567',
});
```

## Address Management

### Search and Create Address

```ts
// Search for a settlement
const settlements = await client.address.searchSettlements({
  CityName: 'Київ',
  Page: 1,
  Limit: 10,
});
const settlementRef = settlements.data[0].Ref;

// Search for a street
const streets = await client.address.searchSettlementStreets({
  StreetName: 'Хрещатик',
  SettlementRef: settlementRef,
  Limit: 10,
});
const streetRef = streets.data[0].Ref;

// Create address
const address = await client.address.save({
  CounterpartyRef: 'counterparty-ref',
  StreetRef: streetRef,
  BuildingNumber: '10',
  Flat: '5',
  Note: 'Door code: 1234',
});
```

### Update and Delete Address

```ts
// Update address
await client.address.update({
  Ref: 'address-ref',
  CounterpartyRef: 'counterparty-ref',
  StreetRef: 'new-street-ref',
  BuildingNumber: '15',
  Flat: '10',
});

// Delete address
await client.address.delete({
  Ref: 'address-ref',
});
```

## Reference Data

### Get Reference Dictionaries

```ts
// Get payer types (Sender/Recipient/ThirdPerson)
const payerTypes = await client.reference.getTypesOfPayers();

// Get payment forms (Cash/NonCash)
const paymentForms = await client.reference.getPaymentForms();

// Get counterparty types (PrivatePerson/Organization)
const counterpartyTypes = await client.reference.getTypesOfCounterparties();

// Get cargo types
const cargoTypes = await client.reference.getCargoTypes();

// Get service types (warehouse-warehouse, door-warehouse, etc.)
const serviceTypes = await client.reference.getServiceTypes();
```

## Complete Waybill Creation Workflow

This example shows the complete process of creating a recipient and waybill:

```ts
// 1. Create recipient counterparty
const recipient = await client.counterparty.save({
  CounterpartyType: 'PrivatePerson',
  CounterpartyProperty: 'Recipient',
  FirstName: 'Іван',
  LastName: 'Петренко',
  Phone: '380501234567',
  Email: 'ivan@example.com',
});

const recipientRef = recipient.data[0].Ref;

// 2. Get contact person (created automatically with counterparty)
const recipientContact = recipient.data[0].ContactPerson.data[0].Ref;

// 3. Search for recipient city
const cities = await client.address.searchSettlements({
  CityName: 'Київ',
  Page: 1,
  Limit: 1,
});
const recipientCityRef = cities.data[0].DeliveryCity;

// 4. Search for warehouse in recipient city
const warehouses = await client.address.getWarehouses({
  CityRef: recipientCityRef,
  Limit: 1,
});
const recipientWarehouseRef = warehouses.data[0].Ref;

// 5. Create waybill
const waybill = await client.waybill.create({
  PayerType: 'Sender',
  PaymentMethod: 'Cash',
  DateTime: '25.12.2024',
  CargoType: 'Parcel',
  Weight: 1.5,
  ServiceType: 'WarehouseWarehouse',
  SeatsAmount: 1,
  Description: 'Test package',
  Cost: 1000,
  CitySender: 'sender-city-ref',         // your sender city
  Sender: 'sender-counterparty-ref',     // your sender counterparty
  SenderAddress: 'sender-warehouse-ref', // your sender warehouse
  ContactSender: 'sender-contact-ref',   // your sender contact
  SendersPhone: '380671234567',
  CityRecipient: recipientCityRef,
  Recipient: recipientRef,
  RecipientAddress: recipientWarehouseRef,
  ContactRecipient: recipientContact,
  RecipientsPhone: '380501234567',
});

console.log('Waybill created:', waybill.data[0].IntDocNumber);
```

---

## 🛠️ Custom Transport

Don't want to use the fetch transport? Create your own:

```typescript
// Minimal HTTP POST JSON transport using fetch
export function createSimpleFetchTransport() {
  return async ({ url, body, signal }: { url: string; body: unknown; signal?: AbortSignal }) => {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(body),
      signal,
    });
    return { status: res.status, data: await res.json() };
  };
}

const client = createClient({
  transport: createSimpleFetchTransport(),
  baseUrl: 'https://api.novaposhta.ua/v2.0/json/',
  apiKey: process.env.NOVA_POSHTA_API_KEY, // optional
});
```

### Using Axios

```typescript
import axios from 'axios';

function createAxiosTransport() {
  return async ({ url, body, signal }) => {
    const response = await axios.post(url, body, {
      headers: { 'Content-Type': 'application/json' },
      signal,
    });
    return { status: response.status, data: response.data };
  };
}

const client = createClient({
  transport: createAxiosTransport(),
  baseUrl: 'https://api.novaposhta.ua/v2.0/json/',
  apiKey: process.env.NOVA_POSHTA_API_KEY,
});
```

---

## ✨ Features

### Plugin Architecture
Connect only the services you need. Each service is a separate plugin:

```typescript
const client = createClient({ transport, baseUrl, apiKey })
  .use(new AddressService())      // Only if you need address operations
  .use(new TrackingService());    // Only if you need tracking

// Tree-shaking automatically removes unused services from your bundle
```

### Namespaced API
Clean, organized method calls:

```typescript
client.address.*       // Address operations
client.reference.*     // Reference data
client.tracking.*      // Tracking operations
client.waybill.*       // Waybill management
client.counterparty.*  // Counterparty operations
client.contactPerson.* // Contact person management
```

### Complete Type Safety
All inputs and outputs are strictly typed:

```typescript
// TypeScript knows the exact shape of the response
const result = await client.address.searchCities({ FindByString: 'Kyiv', Limit: 10 });
//    ^? NovaPoshtaResponse<City[]>

// Autocomplete for all parameters
const waybill = await client.waybill.create({
  PayerType: '...',     // Autocomplete: 'Sender' | 'Recipient' | 'ThirdPerson'
  PaymentMethod: '...', // Autocomplete: 'Cash' | 'NonCash'
  // ... all parameters with type checking
});
```

### Transport Agnostic
The client doesn't make HTTP calls directly. Instead, it uses an injected transport:

- ✅ Easy testing with mock transports
- ✅ Use any HTTP client (fetch, axios, node-fetch, etc.)
- ✅ Add custom headers, authentication, retries
- ✅ Works in any JavaScript environment

---

## 📚 API Services

### AddressService
Methods for working with addresses, cities, streets, and warehouses:

```typescript
client.address.searchCities({ FindByString, Limit })
client.address.searchSettlements({ CityName, Limit })
client.address.searchSettlementStreets({ SettlementRef, StreetName, Limit })
client.address.getWarehouses({ CityRef, Limit, ... })
client.address.save({ CounterpartyRef, StreetRef, BuildingNumber, ... })
client.address.update({ Ref, CounterpartyRef, ... })
client.address.delete({ Ref })
```

### ReferenceService
Access reference data and dictionaries:

```typescript
client.reference.getCargoTypes()
client.reference.getServiceTypes()
client.reference.getPaymentMethods()
client.reference.getPaymentForms()
client.reference.getTypesOfPayers()
client.reference.getTypesOfCounterparties()
client.reference.getOwnershipForms()
client.reference.getTimeIntervals({ RecipientCityRef })
// ... and more
```

### TrackingService
Track packages and view delivery status:

```typescript
client.tracking.trackDocument({ Documents: ['20450123456789'], Phone: '380501234567' })
client.tracking.trackMultipleDocuments({ Documents: ['20450123456789', '...'] })
client.tracking.getDocumentMovement({ Documents: ['20450123456789'] })
client.tracking.getDocumentList({ DateTimeFrom: '01.01.2025', DateTimeTo: '31.01.2025' })
```

### WaybillService
Create and manage waybills (Internet documents):

```typescript
client.waybill.create({ ... })
client.waybill.update({ request: { DocumentRef, ... } })
client.waybill.delete({ DocumentRefs: ['...'] })
client.waybill.calculateCost({ CitySender, CityRecipient, Weight, ... })
client.waybill.getDeliveryDate({ CitySender, CityRecipient, ServiceType })
client.waybill.getEstimate({ ... })
```

### CounterpartyService
Manage senders and recipients:

```typescript
client.counterparty.getCounterparties({ CounterpartyProperty: 'Sender' })
client.counterparty.save({ CounterpartyType: 'PrivatePerson', ... })
client.counterparty.update({ Ref, ... })
client.counterparty.delete({ Ref })
client.counterparty.getCounterpartyAddresses({ Ref })
client.counterparty.getCounterpartyContactPersons({ Ref })
client.counterparty.getCounterpartyOptions({ Ref })
```

### ContactPersonService
Manage contact persons for counterparties:

```typescript
client.contactPerson.save({ CounterpartyRef, FirstName, LastName, Phone })
client.contactPerson.update({ Ref, CounterpartyRef, ... })
client.contactPerson.delete({ Ref, CounterpartyRef })
```

---

## 🌍 Supported Environments

- ✅ **Node.js** 16+, 18+, 20+
- ✅ **Browsers** (Chrome, Firefox, Safari, Edge)
- ✅ **Edge Runtimes** (Cloudflare Workers, Vercel Edge, Deno)
- ✅ **React Native** (with polyfills)
- ✅ **Electron**

The only requirement is the ability to make HTTP POST requests with JSON.

---

## 🧪 Testing

### Mocking the Transport

```typescript
import { createClient, AddressService } from '@shopana/novaposhta-api-client';

const mockTransport = async ({ url, body }) => {
  // Mock implementation
  return {
    status: 200,
    data: {
      success: true,
      data: [{ Ref: 'test-ref', Description: 'Test City' }],
      errors: [],
      warnings: [],
      info: [],
    },
  };
};

const client = createClient({
  transport: mockTransport,
  baseUrl: 'https://api.novaposhta.ua/v2.0/json/',
  apiKey: 'test-key',
}).use(new AddressService());

// Now you can test without real API calls
const result = await client.address.searchCities({ query: 'Test' });
expect(result.data).toHaveLength(1);
```

---

## 📖 Examples

### Complete E-commerce Integration

```typescript
import { createClient, AddressService, WaybillService, CounterpartyService } from '@shopana/novaposhta-api-client';
import { createFetchHttpTransport } from '@shopana/novaposhta-transport-fetch';

const client = createClient({
  transport: createFetchHttpTransport(),
  baseUrl: 'https://api.novaposhta.ua/v2.0/json/',
  apiKey: process.env.NOVA_POSHTA_API_KEY,
})
  .use(new AddressService())
  .use(new WaybillService())
  .use(new CounterpartyService());

async function createOrderShipment(order) {
  // 1. Create recipient if needed
  const recipient = await client.counterparty.save({
    CounterpartyType: 'PrivatePerson',
    CounterpartyProperty: 'Recipient',
    FirstName: order.customer.firstName,
    LastName: order.customer.lastName,
    Phone: order.customer.phone,
  });

  // 2. Find delivery warehouse
  const warehouses = await client.address.getWarehouses({
    CityRef: order.deliveryCityRef,
    Limit: 1,
  });

  // 3. Create waybill
  const waybill = await client.waybill.create({
    PayerType: 'Sender',
    PaymentMethod: 'Cash',
    DateTime: new Date().toLocaleDateString('uk-UA'),
    CargoType: 'Parcel',
    Weight: order.totalWeight,
    ServiceType: 'WarehouseWarehouse',
    SeatsAmount: 1,
    Description: `Order #${order.id}`,
    Cost: order.total,
    CitySender: process.env.SENDER_CITY_REF,
    Sender: process.env.SENDER_COUNTERPARTY_REF,
    SenderAddress: process.env.SENDER_WAREHOUSE_REF,
    ContactSender: process.env.SENDER_CONTACT_REF,
    SendersPhone: process.env.SENDER_PHONE,
    CityRecipient: order.deliveryCityRef,
    Recipient: recipient.data[0].Ref,
    RecipientAddress: warehouses.data[0].Ref,
    ContactRecipient: recipient.data[0].ContactPerson.data[0].Ref,
    RecipientsPhone: order.customer.phone,
  });

  return {
    trackingNumber: waybill.data[0].IntDocNumber,
    waybillRef: waybill.data[0].Ref,
  };
}
```

---

## 🔧 Advanced Usage

### Error Handling

```typescript
try {
  const result = await client.address.searchCities({ FindByString: 'Kyiv' });

  if (!result.success) {
    console.error('API errors:', result.errors);
    console.warn('API warnings:', result.warnings);
  }

  // Process data
  console.log('Found cities:', result.data);
} catch (error) {
  console.error('Network or transport error:', error);
}
```

### Request Cancellation

```typescript
const controller = new AbortController();

const promise = client.address.searchCities(
  { FindByString: 'Kyiv' },
  { signal: controller.signal }
);

// Cancel after 5 seconds
setTimeout(() => controller.abort(), 5000);

try {
  const result = await promise;
} catch (error) {
  if (error.name === 'AbortError') {
    console.log('Request was cancelled');
  }
}
```

---

## 🤝 Contributing

Contributions are welcome! Please see the [main repository](https://github.com/shopanaio/carrier-api) for contribution guidelines.

---

## 📄 License

Apache License 2.0 - see [LICENSE](../../LICENSE) for details.

---

## 🔗 Links

- [Nova Poshta API Documentation](https://developers.novaposhta.ua/)
- [NPM Package](https://www.npmjs.com/package/@shopana/novaposhta-api-client)
- [GitHub Repository](https://github.com/shopanaio/carrier-api)
- [MCP Server](https://www.npmjs.com/package/@shopana/novaposhta-mcp-server)

---

<div align="center">

**Made with ❤️ by [Shopana.io](https://shopana.io)**

[⬆ Back to Top](#shopananovaposhta-api-client)

</div>
