// code and comments in English
// Response records of the address classifier (v3.22 of 25.09.2026): one type per endpoint, with the fields of the
// documented examples. The service sends every value as a string or null, numbers and flags included.

/** Every record value is a string or null. */
export type ClassifierValue = string | null;

/**
 * The XML-derived JSON envelope. `Entry` is one object for a single hit and an array for several; a request
 * without hits answers an empty object.
 */
export interface ClassifierEntries<T> {
  Entries?: { Entry?: T | T[] } | null;
}

/** Record of `get_regions_by_region_ua`. */
export interface ClassifierRegion {
  REGION_ID: ClassifierValue;
  REGION_UA: ClassifierValue;
  REGION_EN: ClassifierValue;
  REGION_KATOTTG: ClassifierValue;
  REGION_KOATUU: ClassifierValue;
}

/** Record of `get_districts_by_region_id_and_district_ua`. */
export interface ClassifierDistrict {
  REGION_ID: ClassifierValue;
  DISTRICT_KOATUU: ClassifierValue;
  REGION_KATOTTG: ClassifierValue;
  DISTRICT_ID: ClassifierValue;
  REGION_RU: ClassifierValue;
  DISTRICT_KATOTTG: ClassifierValue;
  DISTRICT_EN: ClassifierValue;
  REGION_UA: ClassifierValue;
  REGION_EN: ClassifierValue;
  DISTRICT_UA: ClassifierValue;
  REGION_KOATUU: ClassifierValue;
  DISTRICT_RU: ClassifierValue;
  NEW_DISTRICT_UA: ClassifierValue;
}

/** Record of `get_city_by_region_id_and_district_id_and_city_ua`. */
export interface ClassifierCity {
  REGION_ID: ClassifierValue;
  POPULATION: ClassifierValue;
  IS_DISTRICTCENTER: ClassifierValue;
  DISTRICT_ID: ClassifierValue;
  LONGITUDE: ClassifierValue;
  CITY_KATOTTG: ClassifierValue;
  CITY_RU: ClassifierValue;
  DISTRICT_EN: ClassifierValue;
  REGION_EN: ClassifierValue;
  SHORTCITYTYPE_EN: ClassifierValue;
  OLDCITY_RU: ClassifierValue;
  CITYTYPE_UA: ClassifierValue;
  OLDCITY_UA: ClassifierValue;
  NEW_DISTRICT_UA: ClassifierValue;
  CITY_EN: ClassifierValue;
  CITYTYPE_RU: ClassifierValue;
  CITY_KOATUU: ClassifierValue;
  REGION_RU: ClassifierValue;
  NAME_UA: ClassifierValue;
  REGION_UA: ClassifierValue;
  SHORTCITYTYPE_RU: ClassifierValue;
  OLDCITY_EN: ClassifierValue;
  CITY_ID: ClassifierValue;
  DISTRICT_UA: ClassifierValue;
  CITYTYPE_EN: ClassifierValue;
  SHORTCITYTYPE_UA: ClassifierValue;
  LATTITUDE: ClassifierValue;
  CITY_UA: ClassifierValue;
  OWNOF: ClassifierValue;
  DISTRICT_RU: ClassifierValue;
}

/** Record of `get_street_by_region_id_and_district_id_and_city_id_and_street_ua`. */
export interface ClassifierStreet {
  REGION_ID: ClassifierValue;
  OLDSTREET_EN: ClassifierValue;
  DISTRICT_ID: ClassifierValue;
  CITY_RU: ClassifierValue;
  STREET_UA: ClassifierValue;
  SHORTSTREETTYPE_UA: ClassifierValue;
  DISTRICT_EN: ClassifierValue;
  REGION_EN: ClassifierValue;
  STREET_ID: ClassifierValue;
  STREETTYPE_UA: ClassifierValue;
  SHORTSTREETTYPE_RU: ClassifierValue;
  STREETTYPE_RU: ClassifierValue;
  OLDSTREET_UA: ClassifierValue;
  NEW_DISTRICT_UA: ClassifierValue;
  CITY_EN: ClassifierValue;
  STREET_EN: ClassifierValue;
  OLDSTREET_RU: ClassifierValue;
  REGION_RU: ClassifierValue;
  REGION_UA: ClassifierValue;
  SHORTSTREETTYPE_EN: ClassifierValue;
  STREETTYPE_EN: ClassifierValue;
  CITY_ID: ClassifierValue;
  DISTRICT_UA: ClassifierValue;
  STREET_RU: ClassifierValue;
  CITY_UA: ClassifierValue;
  DISTRICT_RU: ClassifierValue;
}

/** Record of `get_addr_house_by_street_id`. */
export interface ClassifierHouse {
  STREET_ID: ClassifierValue;
  POSTCODE: ClassifierValue;
  HOUSENUMBER_UA: ClassifierValue;
  LOCK_UA: ClassifierValue;
  POSTINDEXBLOCKED: ClassifierValue;
}

/** Record of `get_courierarea_by_postindex`. */
export interface ClassifierCourierArea {
  IS_COURIERAREA: ClassifierValue;
  postindex: ClassifierValue;
}

/** Record of `get_postoffices_by_postindex`. */
export interface ClassifierPostOffice {
  POLOCK_EN: ClassifierValue;
  TYPE_SHORT: ClassifierValue;
  CITY_RU: ClassifierValue;
  POREGION_ID: ClassifierValue;
  SHORTPDCITYTYPE_RU: ClassifierValue;
  DISTRICT_EN: ClassifierValue;
  PDCITYTYPE_EN: ClassifierValue;
  POSTINDEX: ClassifierValue;
  SHORTCITYTYPE_EN: ClassifierValue;
  MEREZA_NUMBER: ClassifierValue;
  POLOCK_UA: ClassifierValue;
  ID: ClassifierValue;
  STREETTYPE_RU: ClassifierValue;
  CITYTYPE_UA: ClassifierValue;
  POSTREET_ID: ClassifierValue;
  NEW_DISTRICT_UA: ClassifierValue;
  PO_LONG: ClassifierValue;
  PDCITY_UA: ClassifierValue;
  POLOCK_RU: ClassifierValue;
  PO_SHORT: ClassifierValue;
  SUBTYPE_ID: ClassifierValue;
  LOCK_RU: ClassifierValue;
  TYPE_LONG: ClassifierValue;
  TYPE_ACRONYM: ClassifierValue;
  PARENT_ID: ClassifierValue;
  TECHINDEX: ClassifierValue;
  REGION_UA: ClassifierValue;
  AVALIBLE: ClassifierValue;
  PDCITY_ID: ClassifierValue;
  PDCITYTYPE_RU: ClassifierValue;
  IS_NODISTRICT: ClassifierValue;
  DISTRICT_UA: ClassifierValue;
  PO_CODE: ClassifierValue;
  ADDRESS: ClassifierValue;
  SHORTCITYTYPE_UA: ClassifierValue;
  PODISTRICT_ID: ClassifierValue;
  LOCK_EN: ClassifierValue;
  PDOLDCITYNAME_EN: ClassifierValue;
  POSTCODE: ClassifierValue;
  PDCITY_EN: ClassifierValue;
  PHONE: ClassifierValue;
  LONGITUDE: ClassifierValue;
  STREET_UA: ClassifierValue;
  REGION_EN: ClassifierValue;
  PDREGION_ID: ClassifierValue;
  CARGO: ClassifierValue;
  SHORTPDCITYTYPE_UA: ClassifierValue;
  STREETTYPE_UA: ClassifierValue;
  LOCK_UA: ClassifierValue;
  ISVPZ: ClassifierValue;
  PDOLDCITYNAME_UA: ClassifierValue;
  PDCITY_MEREZA: ClassifierValue;
  CITY_EN: ClassifierValue;
  STREET_EN: ClassifierValue;
  LOCK_CODE: ClassifierValue;
  PDOLDCITYNAME_RU: ClassifierValue;
  CITYTYPE_RU: ClassifierValue;
  REGION_RU: ClassifierValue;
  POCITY_ID: ClassifierValue;
  PDCITY_RU: ClassifierValue;
  RESTRICTED_ACCESS: ClassifierValue;
  PDCITYTYPE_UA: ClassifierValue;
  SHORTCITYTYPE_RU: ClassifierValue;
  SHORTPDCITYTYPE_EN: ClassifierValue;
  MRTPS: ClassifierValue;
  STREETTYPE_EN: ClassifierValue;
  IS_NOLETTERS: ClassifierValue;
  PDDISTRICT_ID: ClassifierValue;
  CITYTYPE_EN: ClassifierValue;
  HOUSENUMBER: ClassifierValue;
  LATTITUDE: ClassifierValue;
  STREET_RU: ClassifierValue;
  CITY_UA: ClassifierValue;
  DISTRICT_RU: ClassifierValue;
}

/** Record of `get_postoffices_openhours_by_postindex`. */
export interface ClassifierPostOfficeHours {
  LOCK_REASON: ClassifierValue;
  DAYOFWEEK_UA: ClassifierValue;
  POSTOFFICE_TYPE: ClassifierValue;
  INTERVALTYPE: ClassifierValue;
  DAYOFWEEK_NUM: ClassifierValue;
  LOCK_CODE: ClassifierValue;
  SHORTNAME: ClassifierValue;
  POSTCODE: ClassifierValue;
  DAYOFWEEK_EN: ClassifierValue;
  POSTOFFICE_PARENT: ClassifierValue;
  DAYOFWEEK_SHORTNAME_UA: ClassifierValue;
  TTO: ClassifierValue;
  WORKCOMMENT: ClassifierValue;
  id: ClassifierValue;
  FULLNAME: ClassifierValue;
  DAYOFWEEK_RU: ClassifierValue;
  ISVPZ: ClassifierValue;
  TFROM: ClassifierValue;
}

/** Record of `get_postoffices_openhours_by_id`. */
export interface ClassifierPostOfficeHoursById {
  LOCK_REASON: ClassifierValue;
  DAYOFWEEK_UA: ClassifierValue;
  POSTOFFICE_TYPE: ClassifierValue;
  INTERVALTYPE: ClassifierValue;
  DAYOFWEEK_NUM: ClassifierValue;
  LOCK_CODE: ClassifierValue;
  SHORTNAME: ClassifierValue;
  POSTCODE: ClassifierValue;
  CITY_KOATUU: ClassifierValue;
  DAYOFWEEK_EN: ClassifierValue;
  CITY_KATOTTG: ClassifierValue;
  POSTOFFICE_PARENT: ClassifierValue;
  DAYOFWEEK_SHORTNAME_UA: ClassifierValue;
  TTO: ClassifierValue;
  CITY_ID: ClassifierValue;
  WORKCOMMENT: ClassifierValue;
  id: ClassifierValue;
  CITY_UA: ClassifierValue;
  FULLNAME: ClassifierValue;
  DAYOFWEEK_RU: ClassifierValue;
  ISVPZ: ClassifierValue;
  TFROM: ClassifierValue;
}

/** Record of `get_postoffices_mobile_openhours_by_postindex`. */
export interface ClassifierMobilePostOfficeHours {
  LOCK_REASON: ClassifierValue;
  DAYOFWEEK_UA: ClassifierValue;
  POSTOFFICE_TYPE: ClassifierValue;
  INTERVALTYPE: ClassifierValue;
  LOCK_CODE: ClassifierValue;
  DAYOFWEEK_NUM: ClassifierValue;
  SHORTNAME: ClassifierValue;
  POSTCODE: ClassifierValue;
  DAYOFWEEK_EN: ClassifierValue;
  POSTOFFICE_PARENT: ClassifierValue;
  DAYOFWEEK_SHORTNAME_UA: ClassifierValue;
  TTO: ClassifierValue;
  TECHINDEX: ClassifierValue;
  CITY_ID: ClassifierValue;
  CITY: ClassifierValue;
  WORKCOMMENT: ClassifierValue;
  id: ClassifierValue;
  FULLNAME: ClassifierValue;
  DAYOFWEEK_RU: ClassifierValue;
  ISVPZ: ClassifierValue;
  TFROM: ClassifierValue;
}

/** Record of `get_postoffices_by_geolocation`. */
export interface ClassifierNearestPostOffice {
  CITYNAME: ClassifierValue;
  DISTANCE: ClassifierValue;
  POSTCODE: ClassifierValue;
  LONGITUDE: ClassifierValue;
  ADDRESS: ClassifierValue;
  POSTINDEX: ClassifierValue;
  ID: ClassifierValue;
  LATITUDE: ClassifierValue;
  POSTFILIALNAME: ClassifierValue;
}

/** Record of `get_postoffices_by_city_id`. */
export interface ClassifierCityPostOffice {
  POSTTERMINAL: ClassifierValue;
  DISTRICT_ID: ClassifierValue;
  TYPE_SHORT: ClassifierValue;
  CITY_RU: ClassifierValue;
  IS_CASH: ClassifierValue;
  DISTRICT_EN: ClassifierValue;
  IS_SECURITY: ClassifierValue;
  IS_SMARTBOX: ClassifierValue;
  POSTINDEX: ClassifierValue;
  SHORTCITYTYPE_EN: ClassifierValue;
  MEREZA_NUMBER: ClassifierValue;
  ID: ClassifierValue;
  STREETTYPE_RU: ClassifierValue;
  CITYTYPE_UA: ClassifierValue;
  NEW_DISTRICT_UA: ClassifierValue;
  PO_LONG: ClassifierValue;
  PO_SHORT: ClassifierValue;
  PELPEREKAZY: ClassifierValue;
  LOCK_RU: ClassifierValue;
  TYPE_LONG: ClassifierValue;
  TYPE_ACRONYM: ClassifierValue;
  PARENT_ID: ClassifierValue;
  TECHINDEX: ClassifierValue;
  REGION_UA: ClassifierValue;
  IS_FLAGMAN: ClassifierValue;
  DISTRICT_UA: ClassifierValue;
  ADDRESS: ClassifierValue;
  SHORTCITYTYPE_UA: ClassifierValue;
  REGION_ID: ClassifierValue;
  LOCK_EN: ClassifierValue;
  PHONE: ClassifierValue;
  LONGITUDE: ClassifierValue;
  STREET_UA: ClassifierValue;
  REGION_EN: ClassifierValue;
  IS_AUTOMATED: ClassifierValue;
  STREETTYPE_UA: ClassifierValue;
  LOCK_UA: ClassifierValue;
  ISVPZ: ClassifierValue;
  CITY_EN: ClassifierValue;
  STREET_EN: ClassifierValue;
  LOCK_CODE: ClassifierValue;
  CITYTYPE_RU: ClassifierValue;
  REGION_RU: ClassifierValue;
  SHORTCITYTYPE_RU: ClassifierValue;
  STREETTYPE_EN: ClassifierValue;
  CITY_ID: ClassifierValue;
  IS_NOLETTERS: ClassifierValue;
  CITYTYPE_EN: ClassifierValue;
  HOUSENUMBER: ClassifierValue;
  LATTITUDE: ClassifierValue;
  STREET_RU: ClassifierValue;
  CITY_UA: ClassifierValue;
  IS_DHL: ClassifierValue;
  DISTRICT_RU: ClassifierValue;
  CARGO: ClassifierValue;
}

/** Record of `get_city_details_by_postcode`. */
export interface ClassifierCityDetails {
  REGION_ID: ClassifierValue;
  DISTRICT_NAME: ClassifierValue;
  NEW_DISTRICT_NAME: ClassifierValue;
  CITY_ID: ClassifierValue;
  REGION_NAME: ClassifierValue;
  POSTCODE: ClassifierValue;
  DISTRICT_ID: ClassifierValue;
  CITY_NAME: ClassifierValue;
  CITYTYPE_NAME: ClassifierValue;
  OLDSTREET_NAME: ClassifierValue;
  OLDCITY_NAME: ClassifierValue;
  CITYTYPE_ID: ClassifierValue;
}

/** Record of `get_address_by_postcode`. */
export interface ClassifierPostcodeAddress {
  REGION_ID: ClassifierValue;
  STREETTYPE_NAME: ClassifierValue;
  NEW_DISTRICT_NAME: ClassifierValue;
  STREETTYPE_ID: ClassifierValue;
  POSTCODE: ClassifierValue;
  DISTRICT_ID: ClassifierValue;
  OLDSTREET_NAME: ClassifierValue;
  ERP_DISTRICT_ID: ClassifierValue;
  ERP_CITY_ID: ClassifierValue;
  ERP_HOUSE_ID: ClassifierValue;
  SHORTSTREETTYPE_NAME: ClassifierValue;
  CITYTYPE_ID: ClassifierValue;
  ERP_STREET_ID: ClassifierValue;
  DISTRICT_NAME: ClassifierValue;
  CITY_ID: ClassifierValue;
  STREET_ID: ClassifierValue;
  REGION_NAME: ClassifierValue;
  CITY_NAME: ClassifierValue;
  CITYTYPE_NAME: ClassifierValue;
  STREET_NAME: ClassifierValue;
  HOUSENUMBER: ClassifierValue;
  OLDCITY_NAME: ClassifierValue;
  ERP_REGION_ID: ClassifierValue;
}

/** Record of `get_postcode_by_city_id`. */
export interface ClassifierCityPostcode {
  CITY_ID: ClassifierValue;
  POSTCODE: ClassifierValue;
}

/** Record of `get_postoffices_by_postcode_cityid_cityvpzid`. */
export interface ClassifierLocalityPostOffice {
  LOCK_EN: ClassifierValue;
  CITY_UA_VPZ: ClassifierValue;
  POSTTERMINAL: ClassifierValue;
  POSTOFFICE_UA: ClassifierValue;
  POSTCODE: ClassifierValue;
  ISAUTOMATED: ClassifierValue;
  PHONE: ClassifierValue;
  LONGITUDE: ClassifierValue;
  CITY_KATOTTG: ClassifierValue;
  STREET_UA_VPZ: ClassifierValue;
  IS_SECURITY: ClassifierValue;
  CARGO: ClassifierValue;
  POSTOFFICE_ID: ClassifierValue;
  POSTOFFICE_UA_DETAILS: ClassifierValue;
  POSTINDEX: ClassifierValue;
  LOCK_UA: ClassifierValue;
  CITY_UA_TYPE: ClassifierValue;
  CITY_VPZ_KATOTTG: ClassifierValue;
  LOCK_CODE: ClassifierValue;
  CITY_VPZ_ID: ClassifierValue;
  CITY_KOATUU: ClassifierValue;
  STREET_ID_VPZ: ClassifierValue;
  LOCK_RU: ClassifierValue;
  CITY_VPZ_KOATUU: ClassifierValue;
  TYPE_ACRONYM: ClassifierValue;
  TYPE_LONG: ClassifierValue;
  TYPE_ID: ClassifierValue;
  CITY_ID: ClassifierValue;
  IS_NOLETTERS: ClassifierValue;
  HOUSENUMBER: ClassifierValue;
  LATTITUDE: ClassifierValue;
  CITY_UA: ClassifierValue;
}

/** Record of `get_subfilialtype`. */
export interface ClassifierSubfilialType {
  SUBTYPE_MRZ_NMBR: ClassifierValue;
  SUBTYPE_NAME: ClassifierValue;
  SUBTYPE_STATUS: ClassifierValue;
  SUBTYPE_NOTE: ClassifierValue;
  TYPE_MRZ_NMBR: ClassifierValue;
  TYPE_NAME: ClassifierValue;
  IS_TRANSF: ClassifierValue;
  IS_PREPAID: ClassifierValue;
  IS_POSTPAY: ClassifierValue;
  IS_MULTPV: ClassifierValue;
  MAX_WEIGHT: ClassifierValue;
  MAX_LENGTH: ClassifierValue;
  MAX_WIDTH: ClassifierValue;
  MAX_HEIGHT: ClassifierValue;
  MAX_VOLUME: ClassifierValue;
  MAX_DECLVAL: ClassifierValue;
  AVAILABLE_MAILTYPE: ClassifierValue;
  AVAILABLE_PAYER: ClassifierValue;
  AVAILABLE_TYPEPAY: ClassifierValue;
  ERP_CREATED_AT: ClassifierValue;
  ERP_UPDATED_AT: ClassifierValue;
}

/** Record of `get_district_by_name`. */
export interface ClassifierDistrictByName {
  REGION_ID: ClassifierValue;
  DISTRICT_NAME: ClassifierValue;
  NEW_DISTRICT_NAME: ClassifierValue;
  REGION_NAME: ClassifierValue;
  DISTRICT_ID: ClassifierValue;
}

/** Record of `get_city_by_name`. */
export interface ClassifierCityByName {
  REGION_ID: ClassifierValue;
  DISTRICT_NAME: ClassifierValue;
  NEW_DISTRICT_NAME: ClassifierValue;
  CITY_ID: ClassifierValue;
  REGION_NAME: ClassifierValue;
  DISTRICT_ID: ClassifierValue;
  CITY_NAME: ClassifierValue;
  CITYTYPE_NAME: ClassifierValue;
  OLDCITY_NAME: ClassifierValue;
  CITYTYPE_ID: ClassifierValue;
}

/** Record of `get_street_by_name`. */
export interface ClassifierStreetByName {
  REGION_ID: ClassifierValue;
  STREETTYPE_NAME: ClassifierValue;
  NEW_DISTRICT_NAME: ClassifierValue;
  STREETTYPE_ID: ClassifierValue;
  DISTRICT_ID: ClassifierValue;
  OLDSTREET_NAME: ClassifierValue;
  SHORTSTREETTYPE_NAME: ClassifierValue;
  CITYTYPE_ID: ClassifierValue;
  DISTRICT_NAME: ClassifierValue;
  CITY_ID: ClassifierValue;
  STREET_ID: ClassifierValue;
  REGION_NAME: ClassifierValue;
  CITY_NAME: ClassifierValue;
  CITYTYPE_NAME: ClassifierValue;
  STREET_NAME: ClassifierValue;
  OLDCITY_NAME: ClassifierValue;
}

export type ClassifierLanguage = 'UA' | 'EN';
