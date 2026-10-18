// code and comments in English

/** Localized value as returned by the Meest public API. Empty string means "not translated". */
export interface MeestLocalized {
  ua: string;
  ru: string;
  en: string;
}

/** Response envelope: `status` 1 is success, 0 is an error described by `msg` (always HTTP 200). */
export interface MeestPublicEnvelope<T> {
  status: number;
  msg: MeestPublicMessage | null;
  result: T | null;
}

export interface MeestPublicMessage {
  code: number;
  ru: string;
  ua: string;
  en: string;
}

export type BranchTypeFilter = 'poshtomat' | 'minibranch' | 'mainbranch' | 'cargobranch' | 'internationalcargobranch';

export type PublicLang = 'ua' | 'ru' | 'en';

export interface WorkingHoursDetailed {
  /** `mo`, `tu`, `we`, `th`, `fr`, `sa`, `su`: 1 when the branch works that day. */
  [key: string]: number | string | undefined;
}

/** Limits as the API spells them, including its typos (`reqired`, `unavailible`, `availible`). */
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

/**
 * A branch (department, mini branch, parcel locker, cargo branch). The register returns a short form
 * (`br_id`, `num`, `num_showcase`, `type_id`, `city_id`, `city`, `lat`, `lng`, `parcel_max_kg`, `type_public`);
 * everything else is only present in the full form (single branch, locator, `viewdata=full`).
 * With the `lang` filter only the chosen language key stays inside localized values.
 */
export interface MeestBranch {
  br_id: string;
  num: string;
  num_showcase: string | number;
  type_id: string;
  type_public: Partial<MeestLocalized>;
  city_id: string;
  city: Partial<MeestLocalized>;
  lat: string;
  lng: string;
  parcel_max_kg?: string | number;
  region_id?: string;
  region?: Partial<MeestLocalized>;
  district_id?: string;
  district?: Partial<MeestLocalized>;
  street_id?: string;
  street?: Partial<MeestLocalized>;
  street_number?: string;
  zip?: string;
  location_description?: string;
  working_hours?: string;
  working_hours_detailed?: WorkingHoursDetailed;
  limits?: BranchLimits;
  /** Locator only: kilometres from the search point. */
  distance?: number;
}

export interface MeestRegion {
  ua: string;
  ru: string;
  en: string;
  region_id: string;
  kt: string;
}

export interface MeestDistrict extends MeestRegion {
  district_id: string;
}

/** Locality as unwrapped from `{ data }`. `is_delivery_in_city: true` means address delivery is NOT available. */
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

/** The register wraps every locality in `data`. */
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
