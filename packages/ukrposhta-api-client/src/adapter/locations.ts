// code and comments in English
import type {
  Address,
  AddressValidationResult,
  CallOptions,
  Location,
  LocationQuery,
} from '@shopana/carrier-contracts';
import type { ClassifierNearestOffice, ClassifierPostOffice, ClassifierRecord } from '../public/types/classifier';
import type { UkrposhtaClassifierClient } from './clients';
import { invalidInput } from './errors';

const text = (value: unknown): string | undefined => (typeof value === 'string' && value !== '' ? value : undefined);
const num = (value: unknown): number | undefined => {
  const parsed = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
};

function toLocation(record: ClassifierPostOffice): Location {
  const index = text(record.POSTINDEX) ?? String(record.ID);
  const lat = num(record.LATTITUDE);
  const lng = num(record.LONGITUDE);
  const street = text(record.STREET_UA);
  return {
    id: index,
    carrier: 'ukrposhta',
    type: 'branch',
    name: text(record.PO_LONG) ?? text(record.PO_SHORT) ?? index,
    number: index,
    address: {
      country: 'UA',
      postalCode: text(record.POSTCODE) ?? index,
      ...(text(record.REGION_UA) ? { region: text(record.REGION_UA) } : {}),
      ...(text(record.DISTRICT_UA) ? { district: text(record.DISTRICT_UA) } : {}),
      ...(text(record.CITY_UA) ? { city: text(record.CITY_UA) } : {}),
      ...(street ? { street } : {}),
      ...(text(record.HOUSENUMBER) ? { building: text(record.HOUSENUMBER) } : {}),
      ...geoOf(lat, lng),
    },
    raw: record,
  };
}

function uniqueById(locations: Location[]): Location[] {
  const seen = new Set<string>();
  return locations.filter(item => {
    if (seen.has(item.id)) return false;
    seen.add(item.id);
    return true;
  });
}

function geoOf(lat: number | undefined, lng: number | undefined) {
  return lat !== undefined && lng !== undefined ? { geo: { lat, lng } } : {};
}

function nearestToLocation(record: ClassifierNearestOffice): Location {
  const index = text(record.POSTINDEX) ?? String(record.ID);
  return {
    id: index,
    carrier: 'ukrposhta',
    type: 'branch',
    name: text(record.POSTFILIALNAME) ?? index,
    number: index,
    address: {
      country: 'UA',
      postalCode: text(record.POSTCODE) ?? index,
      ...(text(record.CITYNAME) ? { city: text(record.CITYNAME) } : {}),
      ...(text(record.ADDRESS) ? { street: text(record.ADDRESS) } : {}),
      ...geoOf(num(record.LATITUDE), num(record.LONGITUDE)),
    },
    raw: record,
  };
}

export function createLocationsApi(classifier: UkrposhtaClassifierClient) {
  return {
    /** Post offices by post office index or postcode, locality id or name, or the nearest to a point. */
    async findLocations(query: LocationQuery, options: CallOptions = {}): Promise<Location[]> {
      if (query.type !== undefined && query.type !== 'branch') return [];
      const limit = query.limit ?? Infinity;
      let locations: Location[];
      if (query.near) {
        const found = await classifier.classifier.getNearestPostOffices(
          { latitude: query.near.lat, longitude: query.near.lng, maxDistanceKm: query.near.radiusKm ?? 5 },
          options,
        );
        locations = found.map(nearestToLocation);
      } else if (query.postalCode !== undefined && query.postalCode !== '') {
        const [byIndex, byCode] = await Promise.all([
          classifier.classifier.getPostOffices({ postIndex: query.postalCode }, options),
          classifier.classifier.getPostOffices({ postcode: query.postalCode }, options),
        ]);
        locations = uniqueById([...byIndex, ...byCode].map(toLocation));
      } else if (query.cityId !== undefined && query.cityId !== '') {
        locations = (await classifier.classifier.getPostOffices({ cityId: query.cityId }, options)).map(toLocation);
      } else if (query.city !== undefined && query.city !== '') {
        const cities = await classifier.classifier.getCities({ cityName: query.city }, options);
        const offices = await Promise.all(
          cities.slice(0, 5).map(city => classifier.classifier.getPostOffices({ cityId: city.CITY_ID }, options)),
        );
        locations = uniqueById(offices.flat().map(toLocation));
      } else {
        throw invalidInput('Give a postalCode, cityId, city or near to look for post offices', 'query');
      }
      return locations.slice(0, limit);
    },

    /**
     * An address is valid when its postcode exists in the address classifier; a given city is compared with the
     * locality of the postcode. The normalized address carries the classifier's region, district and locality.
     */
    async validateAddress(address: Address, options: CallOptions = {}): Promise<AddressValidationResult> {
      if (address.country.toUpperCase() !== 'UA') {
        return { valid: false, messages: [`Ukrposhta delivers within Ukraine only, not ${address.country}`] };
      }
      if (address.postalCode === undefined || !/^\d{5}$/.test(address.postalCode)) {
        return { valid: false, messages: ['A five-digit postcode is required'] };
      }
      const found = await classifier.classifier.getCityDetailsByPostcode(address.postalCode, 'UA', options);
      const details = found[0] as ClassifierRecord | undefined;
      if (details === undefined)
        return { valid: false, messages: [`Postcode ${address.postalCode} is not in the address classifier`] };
      const normalized: Address = {
        ...address,
        country: 'UA',
        postalCode: address.postalCode,
        ...(text(details.REGION_NAME) === undefined ? {} : { region: text(details.REGION_NAME) }),
        ...(text(details.DISTRICT_NAME) === undefined ? {} : { district: text(details.DISTRICT_NAME) }),
        ...(text(details.CITY_NAME) === undefined ? {} : { city: text(details.CITY_NAME) }),
      };
      const given = cityKey(address.city);
      const known = cityKey(normalized.city);
      if (given !== undefined && known !== undefined && given !== known) {
        return {
          valid: false,
          normalized,
          messages: [`Postcode ${address.postalCode} belongs to ${normalized.city}, not ${address.city}`],
        };
      }
      return { valid: true, normalized };
    },
  };
}

export type { ClassifierRecord };

/** A locality name for comparison: lower case, without the "m." / "city" prefix of the classifier. */
function cityKey(city: string | undefined): string | undefined {
  const key = city
    ?.trim()
    .toLowerCase()
    .replace(/^(m|city|misto|mis)\.?\s+/, '');
  return key === undefined || key === '' ? undefined : key;
}
