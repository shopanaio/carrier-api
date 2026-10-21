// Pins the exact field set of every public API type to the documentation and to live answers (publicapi.meest.com).
import type * as T from '../src';

type Eq<A, B> = (<X>() => X extends A ? 1 : 2) extends <X>() => X extends B ? 1 : 2 ? true : false;
type Assert<V extends true> = V;
type Req<O> = { [K in keyof O]-?: {} extends Pick<O, K> ? never : K }[keyof O];

type Day = 'mo' | 'tu' | 'we' | 'th' | 'fr' | 'sa' | 'su';

// Envelope.
export type EnvelopeKeys = Assert<Eq<keyof T.MeestPublicEnvelope<unknown>, 'status' | 'msg' | 'result'>>;
export type MessageKeys = Assert<Eq<keyof T.MeestPublicMessage, 'code' | 'ru' | 'ua' | 'en'>>;
export type LocalizedKeys = Assert<Eq<keyof T.MeestLocalized, 'ua' | 'ru' | 'en'>>;

// Short branch (register without viewdata=full): all ten fields are present.
export type ShortKeys = Assert<
  Eq<
    keyof T.MeestBranchShort,
    'br_id' | 'num' | 'num_showcase' | 'type_id' | 'type_public' | 'city_id' | 'city' | 'lat' | 'lng' | 'parcel_max_kg'
  >
>;
export type ShortRequired = Assert<Eq<Req<T.MeestBranchShort>, keyof T.MeestBranchShort>>;

// Full branch (viewdata=full, single branch, locator).
export type FullKeys = Assert<
  Eq<
    keyof T.MeestBranchFull,
    | 'br_id'
    | 'num'
    | 'num_showcase'
    | 'type_id'
    | 'type_public'
    | 'region_id'
    | 'region'
    | 'district_id'
    | 'district'
    | 'city_id'
    | 'city'
    | 'street_id'
    | 'street'
    | 'street_number'
    | 'zip'
    | 'lat'
    | 'lng'
    | 'location_description'
    | 'working_hours'
    | 'working_hours_detailed'
    | 'limits'
    | 'parcel_max_kg'
    | 'distance'
  >
>;
export type FullRequired = Assert<
  Eq<Req<T.MeestBranchFull>, 'br_id' | 'num' | 'type_id' | 'type_public' | 'city_id' | 'city' | 'lat' | 'lng'>
>;

export type LimitsKeys = Assert<
  Eq<
    keyof T.BranchLimits,
    | 'receiving_only'
    | 'sending_only'
    | 'format_limit'
    | 'receiving_phone_reqired'
    | 'cash_pay_unavailible'
    | 'cash_terminal_availible'
    | 'place_max_kg'
    | 'parcel_max_kg'
    | 'parcel_max_m3'
    | 'max_insurance'
    | 'max_places'
    | 'max_length'
    | 'max_width'
    | 'max_height'
    | 'free_storage_days'
  >
>;
export type HoursKeys = Assert<
  Eq<keyof T.WorkingHoursDetailed, Day | `${Day}_s` | `${Day}_e` | `${Day}_lb_s` | `${Day}_lb_e`>
>;
export type HoursRequired = Assert<Eq<Req<T.WorkingHoursDetailed>, Day | `${Day}_s` | `${Day}_e`>>;

// Geo.
export type RegionKeys = Assert<Eq<keyof T.MeestRegion, 'ua' | 'ru' | 'en' | 'region_id' | 'kt'>>;
export type DistrictKeys = Assert<Eq<keyof T.MeestDistrict, 'ua' | 'ru' | 'en' | 'district_id' | 'region_id' | 'kt'>>;
export type LocalityKeys = Assert<
  Eq<
    keyof T.MeestLocality,
    'n_ua' | 'n_ru' | 't_ua' | 'city_id' | 'kt' | 'reg' | 'reg_id' | 'dis' | 'd_id' | 'is_delivery_in_city'
  >
>;
export type LocalityRequired = Assert<Eq<Req<T.MeestLocality>, Exclude<keyof T.MeestLocality, 'reg_id'>>>;
export type LocalityItemKeys = Assert<Eq<keyof T.MeestLocalityItem, 'data'>>;
export type StreetKeys = Assert<
  Eq<keyof T.MeestStreet, 'ua' | 'ru' | 'en' | 't_ua' | 't_ru' | 't_en' | 'street_id' | 'city_id' | 'kt'>
>;

// Request filters (query parameters of the documented endpoints).
export type BranchesFilterKeys = Assert<
  Eq<keyof T.BranchesFilter, 'city' | 'district' | 'region' | 'type' | 'lang' | 'viewdata'>
>;
export type GeoFilterKeys = Assert<Eq<keyof T.GeoSearchFilter, 'searchFull' | 'searchBeginning'>>;
export type DistrictsFilterKeys = Assert<Eq<keyof T.DistrictsFilter, 'searchFull' | 'searchBeginning' | 'regionId'>>;
export type LocalitiesFilterKeys = Assert<
  Eq<keyof T.LocalitiesFilter, 'searchFull' | 'searchBeginning' | 'districtId'>
>;
export type StreetsFilterKeys = Assert<Eq<keyof T.StreetsFilter, 'searchFull' | 'searchBeginning' | 'cityId'>>;
export type StreetsRequired = Assert<Eq<Req<T.StreetsFilter>, 'cityId'>>;
export type BranchTypes = Assert<
  Eq<T.BranchTypeFilter, 'poshtomat' | 'minibranch' | 'mainbranch' | 'cargobranch' | 'internationalcargobranch'>
>;
export type NearestKeys = Assert<Eq<keyof T.NearestFilter, 'type'>>;
