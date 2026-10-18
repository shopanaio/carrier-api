import type { HttpRequest, HttpTransport } from '@shopana/carrier-core';
import { createUkrposhtaClassifierClient } from '../src';

function setup() {
  const requests: HttpRequest[] = [];
  const transport: HttpTransport = (async (request: HttpRequest) => {
    requests.push(request);
    return { status: 200, headers: {}, data: { Entries: { Entry: [{ ID: '1' }] } } };
  }) as HttpTransport;
  const client = createUkrposhtaClassifierClient({ transport, bearer: 'b', retry: false });
  const last = () => {
    const request = requests[requests.length - 1]!;
    return { path: new URL(request.url).pathname, query: request.query };
  };
  return { client, last };
}

describe('ClassifierService queries', () => {
  it('maps every operation to its documented path and parameters', async () => {
    const { client, last } = setup();
    const c = client.classifier;
    const base = '/address-classifier-ws';

    await c.getDistricts({ regionId: 286, districtName: 'Поділ' });
    expect(last()).toEqual({
      path: `${base}/get_districts_by_region_id_and_district_ua`,
      query: { region_id: 286, district_ua: 'Поділ' },
    });

    await c.getCities({ koatuu: '8000000000' });
    expect(last().query).toEqual({ koatuu: '8000000000' });

    await c.getStreets({ cityId: 5, streetName: 'Хорива' });
    expect(last()).toEqual({
      path: `${base}/get_street_by_region_id_and_district_id_and_city_id_and_street_ua`,
      query: { city_id: 5, street_ua: 'Хорива' },
    });

    await c.getHouses({ streetId: 9, houseNumber: '40' });
    expect(last()).toEqual({ path: `${base}/get_addr_house_by_street_id`, query: { street_id: 9, housenumber: '40' } });

    await c.getPostOfficesByCity({ regionId: 286, cityId: 1 });
    expect(last()).toEqual({
      path: `${base}/get_postoffices_by_city_id`,
      query: { region_id: 286, city_id: 1 },
    });

    await c.getPostOfficesByLocality({ cityKoatuu: '1', postcode: '01001' });
    expect(last()).toEqual({
      path: `${base}/get_postoffices_by_postcode_cityid_cityvpzid`,
      query: { city_koatuu: '1', postcode: '01001' },
    });

    await c.getNearestPostOffices({ latitude: 50.45, longitude: 30.52, maxDistanceKm: 3 });
    expect(last()).toEqual({
      path: `${base}/get_postoffices_by_geolocation`,
      query: { lat: 50.45, long: 30.52, maxdistance: 3 },
    });

    await c.getCityDetailsByPostcode('01001');
    expect(last()).toEqual({
      path: `${base}/get_city_details_by_postcode`,
      query: { postcode: '01001', lang: 'UA' },
    });

    await c.getAddressByPostcode('01001', 'EN');
    expect(last().query).toEqual({ postcode: '01001', lang: 'EN' });

    await c.getPostcodeByCity(7);
    expect(last()).toEqual({ path: `${base}/get_postcode_by_city_id`, query: { city_id: 7 } });

    await c.searchDistricts({ regionId: 1, name: 'Ки', fuzzy: true });
    expect(last()).toEqual({
      path: `${base}/get_district_by_name`,
      query: { region_id: 1, district_name: 'Ки', lang: 'UA', fuzzy: 1 },
    });

    await c.searchCities({ regionId: 1, districtId: 2, name: 'Бро', lang: 'RU' });
    expect(last()).toEqual({
      path: `${base}/get_city_by_name`,
      query: { region_id: 1, district_id: 2, city_name: 'Бро', lang: 'RU', fuzzy: 0 },
    });

    await c.searchStreets({ cityId: 3, name: 'Хор' });
    expect(last()).toEqual({
      path: `${base}/get_street_by_name`,
      query: { city_id: 3, street_name: 'Хор', lang: 'UA', fuzzy: 0 },
    });
  });
});
