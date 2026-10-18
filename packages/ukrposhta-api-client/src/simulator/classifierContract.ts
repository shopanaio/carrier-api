// code and comments in English
// Contract of the address classifier (version 3.20 of 09.12.2024), the operations the client relies on most.
import { defineContract } from '@shopana/carrier-testing';
import { ukrposhtaBaseUrls } from '../config';

const entries = {
  type: 'object',
  properties: {
    Entries: {
      type: 'object',
      properties: { Entry: { oneOf: [{ type: 'array', items: { type: 'object' } }, { type: 'object' }] } },
    },
  },
};
const ok = { '200': { schema: entries }, '401': { schema: { type: 'object' } } };
const strings = (...names: string[]) => ({
  type: 'object',
  properties: Object.fromEntries(names.map(name => [name, { type: 'string' }])),
});

export const ukrposhtaClassifierContract = defineContract({
  name: 'ukrposhta-address-classifier',
  baseUrl: ukrposhtaBaseUrls('production').addressClassifier,
  operations: [
    {
      id: 'getRegions',
      method: 'GET',
      path: '/get_regions_by_region_ua',
      params: { query: strings('region_name', 'region_name_en') },
      responses: ok,
    },
    {
      id: 'getCities',
      method: 'GET',
      path: '/get_city_by_region_id_and_district_id_and_city_ua',
      params: { query: strings('region_id', 'district_id', 'city_ua', 'koatuu', 'katottg') },
      responses: ok,
    },
    {
      id: 'getPostOffices',
      method: 'GET',
      path: '/get_postoffices_by_postindex',
      params: { query: strings('pi', 'pc', 'poCityId', 'poDistrictId', 'poStreetId', 'poRegionId') },
      responses: ok,
    },
    {
      id: 'getNearestPostOffices',
      method: 'GET',
      path: '/get_postoffices_by_geolocation',
      params: { query: { ...strings('lat', 'long', 'maxdistance'), required: ['lat', 'long', 'maxdistance'] } },
      responses: ok,
    },
    {
      id: 'getCityDetailsByPostcode',
      method: 'GET',
      path: '/get_city_details_by_postcode',
      params: { query: { ...strings('postcode', 'lang'), required: ['postcode'] } },
      responses: ok,
    },
    {
      id: 'isCourierArea',
      method: 'GET',
      path: '/get_courierarea_by_postindex',
      params: { query: { ...strings('postindex'), required: ['postindex'] } },
      responses: ok,
    },
  ],
});
