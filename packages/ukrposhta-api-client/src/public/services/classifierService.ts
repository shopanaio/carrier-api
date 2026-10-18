// code and comments in English
import type { ClientContext, QueryParams } from '@shopana/carrier-core';
import type { UkrposhtaPublicConfig } from '../config';
import type {
  ClassifierCity,
  ClassifierCityByName,
  ClassifierCityDetails,
  ClassifierCityPostOffice,
  ClassifierCityPostcode,
  ClassifierCourierArea,
  ClassifierDistrict,
  ClassifierDistrictByName,
  ClassifierEntries,
  ClassifierHouse,
  ClassifierLanguage,
  ClassifierLocalityPostOffice,
  ClassifierMobilePostOfficeHours,
  ClassifierNearestPostOffice,
  ClassifierPostOffice,
  ClassifierPostOfficeHours,
  ClassifierPostOfficeHoursById,
  ClassifierPostcodeAddress,
  ClassifierRegion,
  ClassifierStreet,
  ClassifierStreetByName,
  ClassifierSubfilialType,
} from '../types/classifier';

export type UkrposhtaClassifierContext = ClientContext<UkrposhtaPublicConfig>;

export interface ClassifierCallOptions {
  signal?: AbortSignal;
}

type Id = string | number;

/**
 * Address classifier (`/address-classifier-ws`, v3.22), authorized with the eCom bearer. Every method is a GET that
 * asks for JSON (the service answers XML by default) and returns the service's answer as it is: the
 * `{ Entries: { Entry } }` envelope, where `Entry` is one object for a single hit and an array for several. Use
 * `entriesOf` to get a list. Search operations need at least one filter; without one the service answers an empty
 * body. The service limits the request rate (see the documentation, section 1.1).
 */
export class ClassifierService {
  readonly namespace = 'classifier' as const;
  private ctx!: UkrposhtaClassifierContext;

  attach(ctx: UkrposhtaClassifierContext) {
    this.ctx = ctx;
  }

  /** `GET /get_regions_by_region_ua`. */
  getRegions(params: { regionName?: string; regionNameEn?: string } = {}, options: ClassifierCallOptions = {}) {
    return this.get<ClassifierRegion>(
      '/get_regions_by_region_ua',
      { region_name: params.regionName, region_name_en: params.regionNameEn },
      options,
    );
  }

  /** `GET /get_districts_by_region_id_and_district_ua` (at least one filter). */
  getDistricts(params: { regionId?: Id; districtName?: string }, options: ClassifierCallOptions = {}) {
    return this.get<ClassifierDistrict>(
      '/get_districts_by_region_id_and_district_ua',
      { region_id: params.regionId, district_ua: params.districtName },
      options,
    );
  }

  /** `GET /get_city_by_region_id_and_district_id_and_city_ua` (at least one filter; also by KOATUU or KATOTTG). */
  getCities(
    params: { regionId?: Id; districtId?: Id; cityName?: string; koatuu?: string; katottg?: string },
    options: ClassifierCallOptions = {},
  ) {
    return this.get<ClassifierCity>(
      '/get_city_by_region_id_and_district_id_and_city_ua',
      {
        region_id: params.regionId,
        district_id: params.districtId,
        city_ua: params.cityName,
        koatuu: params.koatuu,
        katottg: params.katottg,
      },
      options,
    );
  }

  /** `GET /get_street_by_region_id_and_district_id_and_city_id_and_street_ua` (at least one filter). */
  getStreets(
    params: { regionId?: Id; districtId?: Id; cityId?: Id; streetName?: string },
    options: ClassifierCallOptions = {},
  ) {
    return this.get<ClassifierStreet>(
      '/get_street_by_region_id_and_district_id_and_city_id_and_street_ua',
      {
        region_id: params.regionId,
        district_id: params.districtId,
        city_id: params.cityId,
        street_ua: params.streetName,
      },
      options,
    );
  }

  /** `GET /get_addr_house_by_street_id`: houses of a street with the postcode of each. */
  getHouses(params: { streetId: Id; houseNumber?: string }, options: ClassifierCallOptions = {}) {
    return this.get<ClassifierHouse>(
      '/get_addr_house_by_street_id',
      { street_id: params.streetId, housenumber: params.houseNumber },
      options,
    );
  }

  /** `GET /get_courierarea_by_postindex`: `IS_COURIERAREA` is `"1"` inside the courier delivery area. */
  getCourierArea(postindex: string, options: ClassifierCallOptions = {}) {
    return this.get<ClassifierCourierArea>('/get_courierarea_by_postindex', { postindex }, options);
  }

  /** `GET /get_postoffices_by_postindex` (at least one filter). */
  getPostOffices(
    params: {
      postIndex?: string;
      postcode?: string;
      cityId?: Id;
      districtId?: Id;
      streetId?: Id;
      regionId?: Id;
      cityAdditionalId?: Id;
      districtAdditionalId?: Id;
      regionAdditionalId?: Id;
    },
    options: ClassifierCallOptions = {},
  ) {
    return this.get<ClassifierPostOffice>(
      '/get_postoffices_by_postindex',
      {
        pi: params.postIndex,
        pc: params.postcode,
        poCityId: params.cityId,
        poDistrictId: params.districtId,
        poStreetId: params.streetId,
        poRegionId: params.regionId,
        pdCityId: params.cityAdditionalId,
        pdDistrictId: params.districtAdditionalId,
        pdRegionId: params.regionAdditionalId,
      },
      options,
    );
  }

  /** `GET /get_postoffices_openhours_by_postindex`: schedule of a stationary post office (`pc` is required). */
  getPostOfficeOpenHours(params: { postcode: string; postOfficeId?: Id }, options: ClassifierCallOptions = {}) {
    return this.get<ClassifierPostOfficeHours>(
      '/get_postoffices_openhours_by_postindex',
      { pc: params.postcode, id: params.postOfficeId },
      options,
    );
  }

  /** `GET /get_postoffices_openhours_by_id`: schedule of any post office, stationary or mobile (at least one filter). */
  getPostOfficeOpenHoursById(params: { postcode?: string; postOfficeId?: Id }, options: ClassifierCallOptions = {}) {
    return this.get<ClassifierPostOfficeHoursById>(
      '/get_postoffices_openhours_by_id',
      { pc: params.postcode, id: params.postOfficeId },
      options,
    );
  }

  /** `GET /get_postoffices_mobile_openhours_by_postindex`: arrival schedule of a mobile post office (at least one filter). */
  getMobilePostOfficeOpenHours(
    params: { postcode?: string; scheduleRecordId?: Id; techIndex?: string },
    options: ClassifierCallOptions = {},
  ) {
    return this.get<ClassifierMobilePostOfficeHours>(
      '/get_postoffices_mobile_openhours_by_postindex',
      { pc: params.postcode, id: params.scheduleRecordId, techindex: params.techIndex },
      options,
    );
  }

  /** `GET /get_postoffices_by_geolocation`: the nearest post offices within `maxDistanceKm`. */
  getNearestPostOffices(
    params: { latitude: number; longitude: number; maxDistanceKm: number },
    options: ClassifierCallOptions = {},
  ) {
    return this.get<ClassifierNearestPostOffice>(
      '/get_postoffices_by_geolocation',
      { lat: params.latitude, long: params.longitude, maxdistance: params.maxDistanceKm },
      options,
    );
  }

  /** `GET /get_postoffices_by_city_id`: post offices of a locality (`regionId` is required) or by post office index. */
  getPostOfficesByCity(
    params: { regionId?: Id; districtId?: Id; cityId?: Id; postIndex?: string },
    options: ClassifierCallOptions = {},
  ) {
    return this.get<ClassifierCityPostOffice>(
      '/get_postoffices_by_city_id',
      {
        region_id: params.regionId,
        district_id: params.districtId,
        city_id: params.cityId,
        postindex: params.postIndex,
      },
      options,
    );
  }

  /** `GET /get_postoffices_by_postcode_cityid_cityvpzid`: post offices by KOATUU / KATOTTG, postcode or district. */
  getPostOfficesByLocality(
    params: {
      cityKoatuu?: string;
      cityKatottg?: string;
      cityVpzKatottg?: string;
      postcode?: string;
      districtId?: Id;
    },
    options: ClassifierCallOptions = {},
  ) {
    return this.get<ClassifierLocalityPostOffice>(
      '/get_postoffices_by_postcode_cityid_cityvpzid',
      {
        city_koatuu: params.cityKoatuu,
        city_katottg: params.cityKatottg,
        city_vpz_katottg: params.cityVpzKatottg,
        postcode: params.postcode,
        district_id: params.districtId,
      },
      options,
    );
  }

  /** `GET /get_city_details_by_postcode`: region, district and locality of a postcode. */
  getCityDetailsByPostcode(postcode: string, lang: ClassifierLanguage, options: ClassifierCallOptions = {}) {
    return this.get<ClassifierCityDetails>('/get_city_details_by_postcode', { postcode, lang }, options);
  }

  /** `GET /get_address_by_postcode`: addresses of a postcode (`lang` is `UA` by default at the service). */
  getAddressByPostcode(postcode: string, lang?: ClassifierLanguage, options: ClassifierCallOptions = {}) {
    return this.get<ClassifierPostcodeAddress>('/get_address_by_postcode', { postcode, lang }, options);
  }

  /** `GET /get_postcode_by_city_id`: the delivery zone code of a locality. */
  getPostcodeByCity(cityId: Id, options: ClassifierCallOptions = {}) {
    return this.get<ClassifierCityPostcode>('/get_postcode_by_city_id', { city_id: cityId }, options);
  }

  /** `GET /get_subfilialtype`: limits and characteristics of the post office subtypes. Takes no parameters. */
  getSubfilialTypes(options: ClassifierCallOptions = {}) {
    return this.get<ClassifierSubfilialType>('/get_subfilialtype', {}, options);
  }

  /** `GET /get_district_by_name`: district search by name, optionally fuzzy. */
  searchDistricts(
    params: { regionId: Id; name: string; lang: ClassifierLanguage; fuzzy: boolean },
    options: ClassifierCallOptions = {},
  ) {
    return this.get<ClassifierDistrictByName>(
      '/get_district_by_name',
      { region_id: params.regionId, district_name: params.name, lang: params.lang, fuzzy: params.fuzzy ? 1 : 0 },
      options,
    );
  }

  /** `GET /get_city_by_name`: locality search by name, optionally fuzzy (`lang` also takes `RU`). */
  searchCities(
    params: { regionId: Id; districtId: Id; name: string; lang: ClassifierLanguage | 'RU'; fuzzy: boolean },
    options: ClassifierCallOptions = {},
  ) {
    return this.get<ClassifierCityByName>(
      '/get_city_by_name',
      {
        region_id: params.regionId,
        district_id: params.districtId,
        city_name: params.name,
        lang: params.lang,
        fuzzy: params.fuzzy ? 1 : 0,
      },
      options,
    );
  }

  /** `GET /get_street_by_name`: street search by name, optionally fuzzy. */
  searchStreets(
    params: { cityId: Id; name: string; lang: ClassifierLanguage; fuzzy: boolean },
    options: ClassifierCallOptions = {},
  ) {
    return this.get<ClassifierStreetByName>(
      '/get_street_by_name',
      { city_id: params.cityId, street_name: params.name, lang: params.lang, fuzzy: params.fuzzy ? 1 : 0 },
      options,
    );
  }

  private get<T>(path: string, query: QueryParams, options: ClassifierCallOptions): Promise<ClassifierEntries<T>> {
    return this.ctx.http.request<ClassifierEntries<T>>({
      method: 'GET',
      path,
      query,
      headers: { Accept: 'application/json' },
      signal: options.signal,
    });
  }
}

/**
 * The records of a classifier answer as a list. This is a helper for the caller; the service methods return the
 * answer untouched. No hits give `[]`, one hit `[hit]`.
 */
export function entriesOf<T>(answer: ClassifierEntries<T> | null | undefined): T[] {
  const entry = answer?.Entries?.Entry;
  if (entry === undefined || entry === null) return [];
  return Array.isArray(entry) ? entry : [entry];
}
