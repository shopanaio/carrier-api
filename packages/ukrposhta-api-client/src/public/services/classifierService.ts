// code and comments in English
import { CarrierError, CarrierErrorCategory } from '@shopana/carrier-core';
import type { ClientContext, QueryParams } from '@shopana/carrier-core';
import type { UkrposhtaPublicConfig } from '../config';
import type {
  ClassifierCity,
  ClassifierCourierArea,
  ClassifierDistrict,
  ClassifierHouse,
  ClassifierLanguage,
  ClassifierNearestOffice,
  ClassifierPostOffice,
  ClassifierRecord,
  ClassifierRegion,
  ClassifierStreet,
} from '../types/classifier';

export type UkrposhtaClassifierContext = ClientContext<UkrposhtaPublicConfig>;

export interface ClassifierCallOptions {
  signal?: AbortSignal;
}

/** `{ Entries: { Entry: [...] } }`; the service returns a bare object for a single hit and nothing for none. */
interface EntriesEnvelope<T> {
  Entries?: { Entry?: T | T[] } | null;
}

/**
 * Address classifier (`/address-classifier-ws`), authorized with the eCom bearer. Every method is a GET and
 * asks for JSON (the service answers XML by default). Search operations need at least one filter: the
 * service answers an empty result to a request without parameters, so the client rejects it up front.
 */
export class ClassifierService {
  readonly namespace = 'classifier' as const;
  private ctx!: UkrposhtaClassifierContext;

  attach(ctx: UkrposhtaClassifierContext) {
    this.ctx = ctx;
  }

  getRegions(params: { regionName?: string; regionNameEn?: string } = {}, options: ClassifierCallOptions = {}) {
    return this.list<ClassifierRegion>(
      '/get_regions_by_region_ua',
      { region_name: params.regionName, region_name_en: params.regionNameEn },
      options,
    );
  }

  getDistricts(params: { regionId?: string | number; districtName?: string }, options: ClassifierCallOptions = {}) {
    return this.list<ClassifierDistrict>(
      '/get_districts_by_region_id_and_district_ua',
      { region_id: params.regionId, district_ua: params.districtName },
      options,
      true,
    );
  }

  getCities(
    params: {
      regionId?: string | number;
      districtId?: string | number;
      cityName?: string;
      koatuu?: string;
      katottg?: string;
    },
    options: ClassifierCallOptions = {},
  ) {
    return this.list<ClassifierCity>(
      '/get_city_by_region_id_and_district_id_and_city_ua',
      {
        region_id: params.regionId,
        district_id: params.districtId,
        city_ua: params.cityName,
        koatuu: params.koatuu,
        katottg: params.katottg,
      },
      options,
      true,
    );
  }

  getStreets(
    params: { regionId?: string | number; districtId?: string | number; cityId?: string | number; streetName?: string },
    options: ClassifierCallOptions = {},
  ) {
    return this.list<ClassifierStreet>(
      '/get_street_by_region_id_and_district_id_and_city_id_and_street_ua',
      {
        region_id: params.regionId,
        district_id: params.districtId,
        city_id: params.cityId,
        street_ua: params.streetName,
      },
      options,
      true,
    );
  }

  /** Houses of a street with the postcode of each (the delivery zone code to use in `/addresses`). */
  getHouses(params: { streetId: string | number; houseNumber?: string }, options: ClassifierCallOptions = {}) {
    return this.list<ClassifierHouse>(
      '/get_addr_house_by_street_id',
      { street_id: params.streetId, housenumber: params.houseNumber },
      options,
    );
  }

  /** Whether the postcode is inside the courier delivery service area (`IS_COURIERAREA === '1'`). */
  async isCourierArea(postindex: string, options: ClassifierCallOptions = {}): Promise<boolean> {
    const [area] = await this.list<ClassifierCourierArea>('/get_courierarea_by_postindex', { postindex }, options);
    return area?.IS_COURIERAREA === '1';
  }

  getPostOffices(
    params: {
      postIndex?: string;
      postcode?: string;
      cityId?: string | number;
      districtId?: string | number;
      streetId?: string | number;
      regionId?: string | number;
    },
    options: ClassifierCallOptions = {},
  ) {
    return this.list<ClassifierPostOffice>(
      '/get_postoffices_by_postindex',
      {
        pi: params.postIndex,
        pc: params.postcode,
        poCityId: params.cityId,
        poDistrictId: params.districtId,
        poStreetId: params.streetId,
        poRegionId: params.regionId,
      },
      options,
      true,
    );
  }

  /** Post offices of a locality; `regionId` is required by the service. */
  getPostOfficesByCity(
    params: { regionId: string | number; districtId?: string | number; cityId?: string | number; postIndex?: string },
    options: ClassifierCallOptions = {},
  ) {
    return this.list<ClassifierPostOffice>(
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

  /** Post offices of a locality by KOATUU / KATOTTG code, postcode or district. */
  getPostOfficesByLocality(
    params: {
      cityKoatuu?: string;
      cityKatottg?: string;
      cityVpzKatottg?: string;
      postcode?: string;
      districtId?: string | number;
    },
    options: ClassifierCallOptions = {},
  ) {
    return this.list<ClassifierPostOffice>(
      '/get_postoffices_by_postcode_cityid_cityvpzid',
      {
        city_koatuu: params.cityKoatuu,
        city_katottg: params.cityKatottg,
        city_vpz_katottg: params.cityVpzKatottg,
        postcode: params.postcode,
        district_id: params.districtId,
      },
      options,
      true,
    );
  }

  /** Nearest post offices to a point, within `maxDistanceKm`. */
  getNearestPostOffices(
    params: { latitude: number; longitude: number; maxDistanceKm: number },
    options: ClassifierCallOptions = {},
  ) {
    return this.list<ClassifierNearestOffice>(
      '/get_postoffices_by_geolocation',
      { lat: params.latitude, long: params.longitude, maxdistance: params.maxDistanceKm },
      options,
    );
  }

  /** Region, district and locality names for a postcode. */
  getCityDetailsByPostcode(postcode: string, lang: ClassifierLanguage = 'UA', options: ClassifierCallOptions = {}) {
    return this.list<ClassifierRecord>('/get_city_details_by_postcode', { postcode, lang }, options);
  }

  /** Address data for a postcode. */
  getAddressByPostcode(postcode: string, lang: ClassifierLanguage = 'UA', options: ClassifierCallOptions = {}) {
    return this.list<ClassifierRecord>('/get_address_by_postcode', { postcode, lang }, options);
  }

  /** Delivery area code (postcode) of a locality. */
  getPostcodeByCity(cityId: string | number, options: ClassifierCallOptions = {}) {
    return this.list<ClassifierRecord>('/get_postcode_by_city_id', { city_id: cityId }, options);
  }

  /** Fuzzy district search by name inside a region. */
  searchDistricts(
    params: { regionId: string | number; name: string; lang?: ClassifierLanguage; fuzzy?: boolean },
    options: ClassifierCallOptions = {},
  ) {
    return this.list<ClassifierRecord>(
      '/get_district_by_name',
      { region_id: params.regionId, district_name: params.name, lang: params.lang ?? 'UA', fuzzy: flag(params.fuzzy) },
      options,
    );
  }

  /** Fuzzy locality search by name inside a region and district. */
  searchCities(
    params: {
      regionId: string | number;
      districtId: string | number;
      name: string;
      lang?: 'UA' | 'EN' | 'RU';
      fuzzy?: boolean;
    },
    options: ClassifierCallOptions = {},
  ) {
    return this.list<ClassifierRecord>(
      '/get_city_by_name',
      {
        region_id: params.regionId,
        district_id: params.districtId,
        city_name: params.name,
        lang: params.lang ?? 'UA',
        fuzzy: flag(params.fuzzy),
      },
      options,
    );
  }

  /** Fuzzy street search by name inside a locality. */
  searchStreets(
    params: { cityId: string | number; name: string; lang?: ClassifierLanguage; fuzzy?: boolean },
    options: ClassifierCallOptions = {},
  ) {
    return this.list<ClassifierRecord>(
      '/get_street_by_name',
      { city_id: params.cityId, street_name: params.name, lang: params.lang ?? 'UA', fuzzy: flag(params.fuzzy) },
      options,
    );
  }

  private async list<T>(
    path: string,
    query: QueryParams,
    options: ClassifierCallOptions,
    requireFilter = false,
  ): Promise<T[]> {
    if (requireFilter && !Object.values(query).some(value => value !== undefined && value !== null && value !== '')) {
      throw new CarrierError({
        carrier: 'ukrposhta',
        code: 'INVALID_REQUEST',
        message: `${path} needs at least one filter parameter`,
        category: CarrierErrorCategory.Validation,
      });
    }
    const response = await this.ctx.http.request<EntriesEnvelope<T> | string | null>({
      method: 'GET',
      path,
      query,
      headers: { Accept: 'application/json' },
      signal: options.signal,
    });
    return entriesOf<T>(response);
  }
}

function flag(value: boolean | undefined): number {
  return value ? 1 : 0;
}

/** Normalizes the XML-derived envelope: no hits → `[]`, one hit → `[hit]`. */
export function entriesOf<T>(payload: EntriesEnvelope<T> | string | null | undefined): T[] {
  if (payload === null || payload === undefined || typeof payload === 'string') return [];
  const entry = payload.Entries?.Entry;
  if (entry === undefined || entry === null) return [];
  return Array.isArray(entry) ? entry : [entry];
}
