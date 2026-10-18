// code and comments in English

/**
 * Address classifier records are flat objects of strings with upper-case keys; numbers arrive as
 * strings and missing values as null. Only the fields the client relies on are named, the rest stay in the index signature.
 */
export type ClassifierRecord = Record<string, string | number | null | undefined>;

export interface ClassifierRegion extends ClassifierRecord {
  REGION_ID: string;
  REGION_UA: string;
  REGION_EN: string | null;
  REGION_KOATUU: string | null;
  REGION_KATOTTG: string | null;
}

export interface ClassifierDistrict extends ClassifierRecord {
  REGION_ID: string;
  DISTRICT_ID: string;
  DISTRICT_UA: string;
  DISTRICT_EN: string | null;
}

export interface ClassifierCity extends ClassifierRecord {
  REGION_ID: string;
  DISTRICT_ID: string;
  CITY_ID: string;
  CITY_UA: string;
  CITY_EN: string | null;
  CITY_KOATUU: string | null;
  CITY_KATOTTG: string | null;
}

export interface ClassifierStreet extends ClassifierRecord {
  STREET_ID: string;
  STREET_UA: string;
  STREETTYPE_UA: string | null;
  CITY_ID: string;
  POSTCODE: string | null;
}

export interface ClassifierHouse extends ClassifierRecord {
  STREET_ID: string;
  HOUSENUMBER_UA: string;
  POSTCODE: string | null;
}

export interface ClassifierPostOffice extends ClassifierRecord {
  ID: string;
  POSTINDEX: string;
  PO_SHORT: string | null;
  PO_LONG: string | null;
  CITY_UA: string | null;
  TYPE_LONG: string | null;
}

export interface ClassifierCourierArea extends ClassifierRecord {
  IS_COURIERAREA: string;
  postindex: string;
}

export interface ClassifierNearestOffice extends ClassifierRecord {
  ID: number | string;
  POSTINDEX: string;
  POSTCODE: string | null;
  ADDRESS: string | null;
  CITYNAME: string | null;
  DISTANCE: number | string | null;
}

export type ClassifierLanguage = 'UA' | 'EN';
