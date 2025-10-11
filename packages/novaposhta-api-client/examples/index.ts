import { createClient } from '../src/core/client';
import { AddressService } from '../src/services/addressService';
import { ReferenceService } from '../src/services/referenceService';
import { TrackingService } from '../src/services/trackingService';
import { WaybillService } from '../src/services/waybillService';
import { createNodeHttpTransport } from './transport';

async function main() {
  const client = createClient({
    transport: createNodeHttpTransport(),
    baseUrl: 'https://api.novaposhta.ua/v2.0/json/',
    apiKey: process.env.NP_API_KEY || 'your-api-key',
  })
    .use(new AddressService())
    .use(new ReferenceService())
    .use(new TrackingService())
    .use(new WaybillService());

  // Address API
  const cities = await client.address.getCities({});
  console.log('Cities success:', cities.success, 'items:', Array.isArray(cities.data) ? cities.data.length : 0);

  // Reference API
  const cargoTypes = await client.reference.getCargoTypes();
  console.log(
    'CargoTypes success:',
    cargoTypes.success,
    'items:',
    Array.isArray(cargoTypes.data) ? cargoTypes.data.length : 0,
  );

  // Tracking API (example number)
  const tracked = await client.tracking.trackDocument('20400048799000');
  console.log('Track first item:', tracked);
}
