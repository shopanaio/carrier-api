import { CarrierErrorCategory } from '@shopana/carrier-core';
import { SimClock } from '@shopana/carrier-testing';
import { createUkrposhtaClassifierClient } from '../src';
import { entriesOf } from '../src/public/services/classifierService';
import { createUkrposhtaClassifierSimulator } from '../src/simulator';

function setup() {
  const clock = new SimClock();
  const sim = createUkrposhtaClassifierSimulator({ clock });
  const client = createUkrposhtaClassifierClient({
    transport: sim.transport,
    bearer: 'ecom-bearer',
    retry: { sleep: clock.sleep, clock },
  });
  return { sim, client };
}

describe('ClassifierService', () => {
  it('asks for JSON and sends the eCom bearer', async () => {
    const { sim, client } = setup();
    sim.seedRegion({ REGION_ID: '286', REGION_UA: 'Київ', REGION_EN: 'Kyiv' });
    const regions = await client.classifier.getRegions({ regionName: 'Киї' });
    expect(regions).toEqual([{ REGION_ID: '286', REGION_UA: 'Київ', REGION_EN: 'Kyiv' }]);
    const call = sim.calls[0]!;
    expect(call.headers.accept).toBe('application/json');
    expect(call.headers.authorization).toBe('Bearer ecom-bearer');
  });

  it('turns a single hit into an array and many hits into the array as is', async () => {
    const { sim, client } = setup();
    sim.seedRegion({ REGION_ID: '286', REGION_UA: 'Київ' });
    sim.seedRegion({ REGION_ID: '270', REGION_UA: 'Київська' });
    expect(await client.classifier.getRegions({ regionName: 'Київс' })).toHaveLength(1);
    expect(await client.classifier.getRegions({ regionName: 'Київ' })).toHaveLength(2);
  });

  it('returns an empty list for an empty answer', async () => {
    const { client } = setup();
    expect(await client.classifier.getRegions({ regionName: 'Nowhere' })).toEqual([]);
  });

  it('finds post offices by index', async () => {
    const { sim, client } = setup();
    sim.seedPostOffice({ ID: '2700', POSTINDEX: '01001', POSTCODE: '01001', PO_SHORT: 'Київ 1' });
    const [office] = await client.classifier.getPostOffices({ postIndex: '01001' });
    expect(office).toMatchObject({ POSTINDEX: '01001', PO_SHORT: 'Київ 1' });
    expect(sim.calls[0]!.query).toEqual({ pi: '01001' });
  });

  it('finds cities by region and name', async () => {
    const { sim, client } = setup();
    sim.seedCity({ CITY_ID: '1', REGION_ID: '286', DISTRICT_ID: '1', CITY_UA: 'Київ' });
    sim.seedCity({ CITY_ID: '2', REGION_ID: '270', DISTRICT_ID: '2', CITY_UA: 'Бровари' });
    const cities = await client.classifier.getCities({ regionId: 270, cityName: 'Бров' });
    expect(cities.map(c => c.CITY_ID)).toEqual(['2']);
  });

  it('checks the courier area', async () => {
    const { sim, client } = setup();
    sim.seedCourierArea('02223');
    expect(await client.classifier.isCourierArea('02223')).toBe(true);
    expect(await client.classifier.isCourierArea('99999')).toBe(false);
  });

  it('refuses a search without filters instead of sending it', async () => {
    const { sim, client } = setup();
    await expect(client.classifier.getCities({})).rejects.toThrow(/at least one filter/);
    await expect(client.classifier.getStreets({})).rejects.toThrow(/at least one filter/);
    expect(sim.calls).toHaveLength(0);
  });

  it('drops undefined parameters from the query', async () => {
    const { sim, client } = setup();
    await client.classifier.getPostOffices({ postIndex: '01001', cityId: undefined });
    expect(sim.calls[0]!.query).toEqual({ pi: '01001' });
  });

  it('maps a rejected bearer to an authentication error', async () => {
    const { sim } = setup();
    const response = await sim.transport({
      method: 'GET',
      url: 'https://www.ukrposhta.ua/address-classifier-ws/get_regions_by_region_ua',
    });
    expect(response.status).toBe(401);
    expect(CarrierErrorCategory.Authentication).toBe('authentication');
  });
});

describe('entriesOf', () => {
  it('handles every shape the service produces', () => {
    expect(entriesOf(undefined)).toEqual([]);
    expect(entriesOf(null)).toEqual([]);
    expect(entriesOf('')).toEqual([]);
    expect(entriesOf({})).toEqual([]);
    expect(entriesOf({ Entries: null })).toEqual([]);
    expect(entriesOf({ Entries: {} })).toEqual([]);
    expect(entriesOf({ Entries: { Entry: { a: 1 } } })).toEqual([{ a: 1 }]);
    expect(entriesOf({ Entries: { Entry: [{ a: 1 }, { a: 2 }] } })).toHaveLength(2);
  });
});
