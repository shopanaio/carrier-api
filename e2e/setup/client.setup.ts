import { createClient, createNovaPoshtaContext, AddressService, ReferenceService, TrackingService, WaybillService } from '@shopana/novaposhta-api-client';

const apiKey = process.env.NP_API_KEY || '';

export const client = createClient(createNovaPoshtaContext({ apiKey }))
  .use(new AddressService())
  .use(new ReferenceService())
  .use(new TrackingService())
  .use(new WaybillService());
