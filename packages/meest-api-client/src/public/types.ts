// code and comments in English

/** Localized value as returned by the Meest public API. Empty string means "not translated". */
export interface MeestLocalized {
  ua: string;
  ru: string;
  en: string;
}

/** With the `lang` filter only the chosen language key stays inside localized values. */
export type MeestLocalizedPartial = Partial<MeestLocalized>;

/** Error description of a `status: 0` answer (the API still replies with HTTP 200). */
export interface MeestPublicMessage {
  code: number;
  ru: string;
  ua: string;
  en: string;
}

/**
 * Every public answer: `status` 1 with the data in `result`, or `status` 0 with `msg` and a null `result`.
 * The client returns this object untouched; use `unwrapMeestPublic` to turn an error answer into an exception.
 */
export interface MeestPublicEnvelope<T> {
  status: number;
  msg: MeestPublicMessage | null;
  result: T | null;
}

export type BranchTypeFilter = 'poshtomat' | 'minibranch' | 'mainbranch' | 'cargobranch' | 'internationalcargobranch';

export type PublicLang = 'ua' | 'ru' | 'en';

type Weekday = 'mo' | 'tu' | 'we' | 'th' | 'fr' | 'sa' | 'su';

/** Per weekday: `mo` (1 when open), `mo_s`/`mo_e` (opening and closing time), `mo_lb_s`/`mo_lb_e` (lunch break). */
export type WorkingHoursDetailed = { [D in Weekday]: number } & { [K in `${Weekday}_s` | `${Weekday}_e`]: string } & {
  [K in `${Weekday}_lb_s` | `${Weekday}_lb_e`]?: string;
};

/** Limits with the API's own spelling (`reqired`, `unavailible`, `availible`). */
export interface BranchLimits {
  receiving_only?: number;
  sending_only?: number;
  format_limit?: number;
  receiving_phone_reqired?: number;
  cash_pay_unavailible?: number;
  cash_terminal_availible?: number;
  place_max_kg?: number;
  parcel_max_kg?: number;
  parcel_max_m3?: number;
  max_insurance?: number;
  max_places?: number;
  max_length?: number;
  max_width?: number;
  max_height?: number;
  free_storage_days?: number;
}

/** A branch in the short form of the register (`GET /branches` without `viewdata=full`). */
export interface MeestBranchShort {
  br_id: string;
  num: string | number;
  num_showcase: string | number;
  type_id: string;
  type_public: MeestLocalizedPartial;
  city_id: string;
  city: MeestLocalizedPartial;
  lat: string;
  lng: string;
  parcel_max_kg: string | number;
}

/**
 * A branch in the full form: `viewdata=full`, a single branch and the locator. The full register has no
 * `num_showcase` and no top-level `parcel_max_kg` (the limit is in `limits`); `distance` (km) is added by the locator only.
 */
export interface MeestBranchFull {
  br_id: string;
  num: string | number;
  num_showcase?: string | number;
  type_id: string;
  type_public: MeestLocalizedPartial;
  region_id?: string;
  region?: MeestLocalizedPartial;
  district_id?: string;
  district?: MeestLocalizedPartial;
  city_id: string;
  city: MeestLocalizedPartial;
  street_id?: string;
  street?: MeestLocalizedPartial;
  street_number?: string;
  zip?: string;
  lat: string;
  lng: string;
  location_description?: string;
  working_hours?: string;
  working_hours_detailed?: WorkingHoursDetailed;
  limits?: BranchLimits;
  parcel_max_kg?: string | number;
  distance?: number;
}

export interface MeestRegion {
  ua: string;
  ru: string;
  en: string;
  region_id: string;
  kt: string;
}

export interface MeestDistrict {
  ua: string;
  ru: string;
  en: string;
  district_id: string;
  region_id: string;
  kt: string;
}

/** A locality. `is_delivery_in_city: true` means address delivery is NOT available. */
export interface MeestLocality {
  n_ua: string;
  n_ru: string;
  t_ua: string;
  city_id: string;
  kt: string;
  reg: string;
  reg_id?: string;
  dis: string;
  d_id: string;
  is_delivery_in_city: boolean;
}

/** The locality register wraps every item in `data`. */
export interface MeestLocalityItem {
  data: MeestLocality;
}

export interface MeestStreet {
  ua: string;
  ru: string;
  en: string;
  t_ua: string;
  t_ru: string;
  t_en: string;
  street_id: string;
  city_id: string;
  kt: string;
}

export interface GeoSearchFilter {
  /** Exact name match. */
  searchFull?: string;
  /** Prefix match. */
  searchBeginning?: string;
}

export interface DistrictsFilter extends GeoSearchFilter {
  regionId?: string;
}

export interface LocalitiesFilter extends GeoSearchFilter {
  districtId?: string;
}

export interface StreetsFilter extends GeoSearchFilter {
  /** Required by the API. */
  cityId: string;
}

export interface BranchesFilter {
  /** Name prefix in any language, or a locality id. */
  city?: string;
  district?: string;
  region?: string;
  type?: BranchTypeFilter | readonly BranchTypeFilter[];
  lang?: PublicLang;
  /** `full` returns the full branch form for every item of the register. */
  viewdata?: 'full';
}

export interface NearestFilter {
  type?: BranchTypeFilter | readonly BranchTypeFilter[];
}

export interface Coordinates {
  lat: number;
  lng: number;
}
