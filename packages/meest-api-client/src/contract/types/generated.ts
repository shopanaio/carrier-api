// AUTO-GENERATED FILE. DO NOT EDIT DIRECTLY.
// Run `node scripts/generate-types.js` after updating contracts/meest-contract.swagger.json.
import type { MeestResponse } from './envelope';

// authentication :: POST /auth
export type AuthRequestBody = {
  username: string;
  password: string;
};
/** Result payload */
export type AuthResult = {
  token?: string;
  refresh_token?: string;
  expiresIn?: number;
};
export type AuthResponse = MeestResponse<AuthResult>;
export interface AuthRequest {
  body: AuthRequestBody;
}

// authentication :: POST /refreshToken
export type RefreshTokenRequestBody = {
  refreshToken: string;
};
/** Result payload */
export type RefreshTokenResult = {
  token?: string;
  refresh_token?: string;
  expiresIn?: number;
};
export type RefreshTokenResponse = MeestResponse<RefreshTokenResult>;
export interface RefreshTokenRequest {
  body: RefreshTokenRequestBody;
}

// other :: GET /banners
/** Result payload */
export type BannersResult = Array<{
  url?: {
    UA?: string;
    EN?: string;
    RU?: string;
  };
  file?: {
    UA?: string;
    EN?: string;
    RU?: string;
  };
}>;
export type BannersResponse = MeestResponse<BannersResult>;
export type BannersRequest = Record<string, never>;

// other :: GET /CheckPhoneOnParcel/{barCode}/{phoneCheck}
export interface CheckPhoneOnParcelPathParams {
  barCode: string;
  phoneCheck: string;
}
export type CheckPhoneOnParcelResponse = MeestResponse<void>;
export interface CheckPhoneOnParcelRequest {
  path: CheckPhoneOnParcelPathParams;
}

// other :: GET /contractClientInfo/{contractID}
export interface ContractClientInfoPathParams {
  contractID: string;
}
export type ContractClientInfoResponse = MeestResponse<void>;
export interface ContractClientInfoRequest {
  path: ContractClientInfoPathParams;
}

// other :: POST /contract_validation_check
export type ContractValidationCheckRequestBody = {
  ContractID: string;
  AgentID?: string;
};
/** Result payload */
export type ContractValidationCheckResult = {
  status?: string;
  text?: string;
};
export type ContractValidationCheckResponse = MeestResponse<ContractValidationCheckResult>;
export interface ContractValidationCheckRequest {
  body?: ContractValidationCheckRequestBody;
}

// other :: POST /parcelReturn_new
export type ParcelReturnNewRequestBody = {
  parcelID?: string;
  reasonID?: string;
};
export type ParcelReturnNewResponse = MeestResponse<void>;
export interface ParcelReturnNewRequest {
  body?: ParcelReturnNewRequestBody;
}

// other :: GET /parcelReturnReasons
/** Result payload */
export type ParcelReturnReasonsResult = Array<{
  name?: string;
  nameUA?: string;
  nameRU?: string;
  nameEN?: string;
  uuid?: string;
}>;
export type ParcelReturnReasonsResponse = MeestResponse<ParcelReturnReasonsResult>;
export type ParcelReturnReasonsRequest = Record<string, never>;

// parcels :: POST /calculate
export type CalculateRequestBody = {
  sendingDate?: string;
  contractID?: string;
  COD?: number;
  promocode?: string;
  sender?: {
    branchID: string;
    cityID: string;
    floor?: number;
    service: string;
  };
  receiver?: {
    countryID?: string;
    branchID: string;
    cityID: string;
    floor?: number;
    service: string;
  };
  specConditionsItems?: Array<{
    conditionID?: string;
  }>;
  placesItems?: Array<{
    quantity: number;
    weight: number;
    volume?: number;
    insurance?: number;
    length?: number;
    width?: number;
    height?: number;
    wheels?: string;
  }>;
};
/** Result payload */
export type CalculateResult = Array<{
  costServices?: string;
  estimatedDeliveryDate?: string;
  possibleDeliveryDates?: Array<{
    deliveryDate?: string;
  }>;
}>;
export type CalculateResponse = MeestResponse<CalculateResult>;
export interface CalculateRequest {
  body?: CalculateRequestBody;
}

// parcels :: POST /calculateExportB2C
export type CalculateExportB2CRequestBody = {
  receiver?: {
    service?: string;
    countryID: string;
    regionID?: string;
    cityID?: string;
  };
  ioss?: boolean;
  contractID?: string;
  sendingDate?: string;
  placesItems?: Array<{
    quantity?: number;
    placeWeight?: number;
    weight?: number;
    placeVolume?: number;
    volume?: number;
    insurance?: number;
    length?: number;
    width?: number;
    height?: number;
    formatID?: string;
  }>;
};
/** Result payload */
export type CalculateExportB2CResult = {
  Success?: boolean;
  Message?: string;
  Tariff?: number;
  Currency?: string;
  CurrencyName?: string;
  PriceSource?: string;
  Formula?: string;
  CountryGUID?: string;
  CountryCode?: number;
  CountryName?: string;
  CityGUID?: string;
  CityCode?: string;
  CityName?: string;
  AgentGUID?: string;
  AgentCode?: string;
  AgentName?: string;
  ContractGUID?: string;
  ContractCode?: string;
  ContractName?: string;
  ServiceType?: string;
  ServiceTypeName?: string;
  PlacesCount?: number;
  InputWeight?: number;
  InputVolumeCm?: number;
  InputVolumeM3?: number;
  InputLengthCm?: number;
  InputWidthCm?: number;
  InputHeightCm?: number;
  VolumeCalculatedByDimensions?: boolean;
  VolumeWeight?: number;
  CalculatedWeight?: number;
  UsedVolumeWeight?: boolean;
  IOSS?: string;
  CalculationDate?: string;
  CalculationDateFormatted?: string;
  PriceDependsOnCity?: boolean;
  UsedCityTariff?: boolean;
  UsedAgentTariff?: boolean;
  UsedDefaultTariff?: boolean;
  RegionGUID?: string;
  RegionName?: string;
  ZoneGUID?: string;
  ZoneName?: string;
  UsedZoneTariff?: boolean;
};
export type CalculateExportB2CResponse = MeestResponse<CalculateExportB2CResult>;
export interface CalculateExportB2CRequest {
  body?: CalculateExportB2CRequestBody;
}

// parcels :: POST /changingParcelBySender
export type ChangingParcelBySenderRequestBody = {
  parcelID?: string;
  senderPhone?: string;
  reciever?: string;
  recieverPhone?: string;
  COD?: number;
  NumberCardForCOD?: string;
};
/** Result payload */
export type ChangingParcelBySenderResult = {
  Success?: boolean;
  DocuentNumber?: string;
  SMS_sended?: boolean;
};
export type ChangingParcelBySenderResponse = MeestResponse<ChangingParcelBySenderResult>;
export interface ChangingParcelBySenderRequest {
  body?: ChangingParcelBySenderRequestBody;
}

// parcels :: GET /getParcel/{parcelID}/{searchMode}/{returnMode}
export interface GetParcelPathParams {
  parcelID: string;
  searchMode: string;
  /** objectData printCN23 printCP71 */
  returnMode: string;
}
/** Result payload */
export type GetParcelResult = {
  parcelNumber?: string;
  subAgent?: string;
  agent?: string;
  notation?: string;
  payType?: string;
  receiverPay?: string;
  COD?: string;
  weight?: string;
  pudoID?: string;
  pudoPointType?: string;
  expectedDeliveryDate?: string;
  sender?: {
    name?: string;
    phone?: string;
    zipCode?: string;
    branchID?: string;
    addressID?: string;
    building?: string;
    flat?: string;
    floor?: string;
    service?: string;
  };
  receiver?: {
    name?: string;
    phone?: string;
    zipCode?: string;
    branchID?: string;
    addressID?: string;
    building?: string;
    flat?: string;
    floor?: string;
    service?: string;
  };
  placesItems?: Array<{
    quantity?: string;
    weight?: string;
    volume?: string;
    insurance?: string;
    packID?: string;
    length?: string;
    width?: string;
    height?: string;
    wheels?: string;
    size?: string;
  }>;
  specConditionsItems?: Array<{
    conditionID?: string;
  }>;
  contentsItems?: Array<{
    contentName?: string;
    quantity?: string;
    weight?: string;
    value?: string;
    customsCode?: string;
    country?: string;
  }>;
  codPaymentItems?: Array<{
    agentId?: string;
    cod?: string;
  }>;
  goods?: Array<{
    article?: string;
    name?: string;
    serialNumber?: string;
    weight?: string;
    quantity?: string;
    price?: string;
    length?: string;
    width?: string;
    height?: string;
  }>;
  deliveryOptions?: {
    minAmountGoods?: string;
    amountDeliveryShortageGoods?: string;
  };
  cardForCOD?: {
    number?: string;
    ownername?: string;
    ownermobile?: string;
  };
  return?: boolean;
};
export type GetParcelResponse = MeestResponse<GetParcelResult>;
export interface GetParcelRequest {
  path: GetParcelPathParams;
}

// parcels :: POST /LockParcel
export type LockParcelRequestBody = {
  ClientUID?: string;
  ParcelUID?: string;
  ClientsShipmentRef: string;
  AppName?: string;
  Notation?: string;
};
/** Result payload */
export type LockParcelResult = unknown;
export type LockParcelResponse = MeestResponse<LockParcelResult>;
export interface LockParcelRequest {
  body?: LockParcelRequestBody;
}

// parcels :: GET /orderDateInfo/{streetID}
export interface OrderDateInfoPathParams {
  streetID: string;
}
/** Result payload */
export type OrderDateInfoResult = Array<{
  date?: string;
  isAvailable?: boolean;
}>;
export type OrderDateInfoResponse = MeestResponse<OrderDateInfoResult>;
export interface OrderDateInfoRequest {
  path: OrderDateInfoPathParams;
}

// parcels :: POST /parcel
export type ParcelRequestBody = {
  parcelNumber?: string;
  subAgent?: string;
  notation?: string;
  contractID?: string;
  payType: string;
  receiverPay: boolean;
  COD?: number;
  weight?: number;
  sendingDate?: string;
  info4Sticker?: boolean;
  pudoID?: string;
  pudoPointType?: string;
  pudoDescription?: string;
  AgentID?: string;
  orderNumber?: string;
  barcode?: string;
  barcode_myMeest?: string;
  /** BAG_ID_IN */
  bagNumber?: string;
  /** AWB */
  awbNumber?: string;
  delivery_payment_payer?: string;
  promocode?: string;
  expectedPickUpDate?: {
    date?: string;
    timeFrom?: string;
    timeTo?: string;
  };
  expectedDeliveryDate?: {
    date?: string;
    timeFrom?: string;
    timeTo?: string;
  };
  sender?: {
    name: string;
    phone: string;
    zipCode?: string;
    branchID: string;
    addressID: string;
    building: string;
    flat?: string;
    floor?: number;
    corps?: string;
    service: string;
    notation?: string;
    countryId?: string;
    cityDescr?: string;
  };
  receiver?: {
    name: string;
    phone: string;
    zipCode?: string;
    branchID: string;
    addressID: string;
    building: string;
    flat?: string;
    floor?: number;
    corps?: string;
    service: string;
    countryId?: string;
    regionDescr?: string;
    districtDescr?: string;
    cityDescr?: string;
    addressDescr?: string;
    notation?: string;
    branchIdExternal?: string;
  };
  placesItems?: Array<{
    quantity: number;
    placeWeight: number;
    weight?: number;
    placeVolume: number;
    volume?: number;
    insurance?: number;
    length?: number;
    width?: number;
    height?: number;
    pallet?: boolean;
    wheels?: string;
    size?: string;
    formatID?: string;
  }>;
  specConditionsItems?: Array<{
    conditionID?: string;
  }>;
  contentsItems?: Array<{
    contentName: string;
    quantity: number;
    weight: number;
    value: number;
    customsCode?: string;
    country?: string;
    size?: string;
    ean13?: string;
    gender?: string;
    valueReceiverCurrency?: string;
  }>;
  codPaymentsItems?: Array<{
    agentId: string;
    cod: number;
  }>;
  goods?: Array<{
    article: string;
    name: string;
    serialNumber?: string;
    weight: number;
    quantity: number;
    price: number;
    length?: number;
    width?: number;
    height?: number;
  }>;
  deliveryOptions?: {
    minAmountGoods?: number;
    amountDeliveryShortageGoods?: number;
  };
  cardForCOD?: {
    number: string;
    ownername?: string;
    ownermobile: string;
  };
  branchForCOD?: {
    branchID: string;
    receiver?: {
      firstname: string;
      middlename: string;
      lastname: string;
    };
    payer?: {
      firstname: string;
      middlename: string;
      lastname: string;
      phone?: string;
    };
  };
};
/** Result payload */
export type ParcelResult = {
  parcelID?: string;
  AgentID?: string;
  barCode?: string;
  costServices?: number;
  estimatedDeliveryDate?: string;
  parcelNumber?: string;
  branchName?: string;
  branchCode?: string;
  branchAddressDetails?: string;
  deliveryType?: string;
  formatType?: string;
  totalPlaces?: number;
  hikingServiceRoute?: string;
  mainServiceRoute?: string;
  receiverName?: string;
  receiverPhone?: string;
  receiverCity?: string;
  receiverDistrict?: string;
  receiverRegion?: string;
  receiverAddress?: string;
  receiverBuilding?: string;
  receiverFlat?: string;
  COD?: number;
  notation?: string;
  value?: number;
};
export type ParcelResponse = MeestResponse<ParcelResult>;
export interface ParcelRequest {
  body?: ParcelRequestBody;
}

// parcels :: PUT /parcelChangeContractID
export type ParcelChangeContractIDRequestBody = {
  contractID: string;
  payType?: string;
  receiverPay?: string;
};
export interface ParcelChangeContractIDQueryParams {
  barCode: string;
}
/** Result payload */
export type ParcelChangeContractIDResult = Record<string, unknown>;
export type ParcelChangeContractIDResponse = MeestResponse<ParcelChangeContractIDResult>;
export interface ParcelChangeContractIDRequest {
  query: ParcelChangeContractIDQueryParams;
  body?: ParcelChangeContractIDRequestBody;
}

// parcels :: DELETE /parcel/{parcelID}/{contractID}
export type ParcelDeleteRequestBody = unknown;
export interface ParcelDeletePathParams {
  parcelID: string;
  contractID?: string;
}
/** Result payload */
export type ParcelDeleteResult = Record<string, unknown>;
export type ParcelDeleteResponse = MeestResponse<ParcelDeleteResult>;
export interface ParcelDeleteRequest {
  path: ParcelDeletePathParams;
  body?: ParcelDeleteRequestBody;
}

// parcels :: PUT /parcel/{parcelID}
export type ParcelPutRequestBody = {
  parcelNumber?: string;
  subAgent?: string;
  notation?: string;
  contractID?: string;
  payType: string;
  receiverPay: boolean;
  COD?: number;
  weight?: number;
  sendingDate?: string;
  info4Sticker?: boolean;
  pudoID?: string;
  pudoPointType?: string;
  pudoDescription?: string;
  AgentID?: string;
  orderNumber?: string;
  barcode?: string;
  barcode_myMeest?: string;
  /** BAG_ID_IN */
  bagNumber?: string;
  /** AWB */
  awbNumber?: string;
  delivery_payment_payer?: string;
  expectedPickUpDate?: {
    date?: string;
    timeFrom?: string;
    timeTo?: string;
  };
  expectedDeliveryDate?: {
    date?: string;
    timeFrom?: string;
    timeTo?: string;
  };
  sender?: {
    name: string;
    phone: string;
    zipCode?: string;
    branchID: string;
    addressID: string;
    building: string;
    flat?: string;
    floor?: number;
    corps?: string;
    service: string;
    notation?: string;
    countryId?: string;
    cityDescr?: string;
  };
  receiver?: {
    name: string;
    phone: string;
    zipCode: string;
    branchID: string;
    addressID: string;
    building: string;
    flat?: string;
    floor?: number;
    corps?: string;
    service: string;
    countryId?: string;
    regionDescr?: string;
    districtDescr?: string;
    cityDescr?: string;
    addressDescr?: string;
    notation?: string;
    branchIdExternal?: string;
  };
  placesItems?: Array<{
    quantity: number;
    weight: number;
    volume?: number;
    insurance?: number;
    packID?: string;
    length?: number;
    width?: number;
    height?: number;
    pallet?: boolean;
    wheels?: string;
    size?: string;
    formatID?: string;
  }>;
  specConditionsItems?: Array<{
    conditionID?: string;
  }>;
  contentsItems?: Array<{
    contentName: string;
    quantity: number;
    weight: number;
    value: number;
    customsCode?: string;
    country?: string;
    size?: string;
    ean13?: string;
    gender?: string;
    valueReceiverCurrency?: string;
  }>;
  codPaymentsItems?: Array<{
    agentId: string;
    cod: number;
  }>;
  goods?: Array<{
    article: string;
    name: string;
    serialNumber?: string;
    weight: number;
    quantity: number;
    price: number;
    length?: number;
    width?: number;
    height?: number;
  }>;
  deliveryOptions?: {
    minAmountGoods?: number;
    amountDeliveryShortageGoods?: number;
  };
  cardForCOD?: {
    number: string;
    ownername?: string;
    ownermobile?: string;
  };
};
export interface ParcelPutPathParams {
  parcelID: string;
}
/** Result payload */
export type ParcelPutResult = {
  parcelID?: string;
  barCode?: string;
  costOfServices?: number;
  estimatedDeliveryDate?: string;
};
export type ParcelPutResponse = MeestResponse<ParcelPutResult>;
export interface ParcelPutRequest {
  path: ParcelPutPathParams;
  body?: ParcelPutRequestBody;
}

// parcels :: GET /parcelsList/{dateFrom}
export interface ParcelsListPathParams {
  dateFrom: string;
}
/** Result payload */
export type ParcelsListResult = Array<{
  parcelID?: string;
  parcelNumber?: string;
  '\u0432arCode'?: string;
  registerID?: string;
  registerType?: string;
}>;
export type ParcelsListResponse = MeestResponse<ParcelsListResult>;
export interface ParcelsListRequest {
  path: ParcelsListPathParams;
}

// parcels :: GET /parcelStatus/{parcelID}
export interface ParcelStatusPathParams {
  parcelID: string;
}
/** Result payload */
export type ParcelStatusResult = Array<{
  status?: string;
  statusCode?: string;
  date?: string;
}>;
export type ParcelStatusResponse = MeestResponse<ParcelStatusResult>;
export interface ParcelStatusRequest {
  path: ParcelStatusPathParams;
}

// parcels :: GET /parcelStatusDetails/{parcelID}
export interface ParcelStatusDetailsPathParams {
  parcelID: string;
}
/** Result payload */
export type ParcelStatusDetailsResult = {
  parcelNumber?: string;
  parcelCode?: string;
  senderBranch?: string;
  senderBranchNumber?: string;
  receiverBranch?: string;
  receiverBranchNumber?: string;
  senderBranchTMO?: string;
  senderBranchTMONumber?: string;
  receiverBranchTMO?: string;
  receiverBranchTMONumber?: string;
  senderService?: string;
  receiverService?: string;
  statuses?: Array<string>;
};
export type ParcelStatusDetailsResponse = MeestResponse<ParcelStatusDetailsResult>;
export interface ParcelStatusDetailsRequest {
  path: ParcelStatusDetailsPathParams;
}

// parcels :: GET /specConditions
/** Result payload */
export type SpecConditionsResult = Array<{
  conditionID?: string;
  conditionDescr?: {
    descrUA?: string;
    descrRU?: string;
    descrEN?: string;
  };
}>;
export type SpecConditionsResponse = MeestResponse<SpecConditionsResult>;
export type SpecConditionsRequest = Record<string, never>;

// parcels :: POST /UnlockParcel
export type UnlockParcelRequestBody = {
  ClientUID?: string;
  ClientsShipmentRef: string;
  ParcelUID?: string;
  AppName?: string;
  Notation?: string;
};
/** Result payload */
export type UnlockParcelResult = unknown;
export type UnlockParcelResponse = MeestResponse<UnlockParcelResult>;
export interface UnlockParcelRequest {
  body?: UnlockParcelRequestBody;
}

// print :: GET /print/cn23Form/{printValue}/{phone}
export interface Cn23FormPathParams {
  printValue: string;
  phone: string;
}
/** Result payload */
export type Cn23FormResult = unknown;
export type Cn23FormResponse = MeestResponse<Cn23FormResult>;
export interface Cn23FormRequest {
  path: Cn23FormPathParams;
}

// print :: GET /print/declarationForm/{printValue}/{phone}/{contentType}
export interface DeclarationFormPathParams {
  printValue: string;
  phone: string;
  contentType: string;
}
/** Result payload */
export type DeclarationFormResult = unknown;
export type DeclarationFormResponse = MeestResponse<DeclarationFormResult>;
export interface DeclarationFormRequest {
  path: DeclarationFormPathParams;
}

// print :: GET /print/register/{printValue}/{contentType}
export interface RegisterPathParams {
  printValue: string;
  contentType: string;
}
/** Result payload */
export type RegisterResult = unknown;
export type RegisterResponse = MeestResponse<RegisterResult>;
export interface RegisterRequest {
  path: RegisterPathParams;
}

// print :: GET /print/sticker100/{printValue}
export interface Sticker100QueryParams {
  agent?: string;
  page?: number;
}
export interface Sticker100PathParams {
  printValue: string;
}
/** Result payload */
export type Sticker100Result = unknown;
export type Sticker100Response = MeestResponse<Sticker100Result>;
export interface Sticker100Request {
  path: Sticker100PathParams;
  query?: Sticker100QueryParams;
}

// print :: GET /print/sticker100A4/{printValue}
export interface Sticker100A4QueryParams {
  position: string;
}
export interface Sticker100A4PathParams {
  printValue: string;
}
/** Result payload */
export type Sticker100A4Result = unknown;
export type Sticker100A4Response = MeestResponse<Sticker100A4Result>;
export interface Sticker100A4Request {
  path: Sticker100A4PathParams;
  query: Sticker100A4QueryParams;
}

// registers :: GET /availableTimeSlots
export interface AvailableTimeSlotsQueryParams {
  cityID?: string;
  streetID?: string;
  type: string;
}
/** Result payload */
export type AvailableTimeSlotsResult = {
  zone?: string;
  availableTimeSlots?: Array<{
    ID?: string;
    type?: string;
    timeFrom?: string;
    timeTo?: string;
    availableToday?: boolean;
  }>;
  availableDates?: Array<{
    date?: string;
    isAvailable?: boolean;
  }>;
};
export type AvailableTimeSlotsResponse = MeestResponse<AvailableTimeSlotsResult>;
export interface AvailableTimeSlotsRequest {
  query: AvailableTimeSlotsQueryParams;
}

// registers :: POST /registerBranch
export type RegisterBranchRequestBody = {
  notation?: string;
  contractID?: string;
  parcelsItems?: Array<{
    parcelID: string;
  }>;
};
/** Result payload */
export type RegisterBranchResult = {
  registerID?: string;
  registerNumber?: string;
  Not_added_to_registry?: Array<string>;
};
export type RegisterBranchResponse = MeestResponse<RegisterBranchResult>;
export interface RegisterBranchRequest {
  body?: RegisterBranchRequestBody;
}

// registers :: DELETE /registerBranch/{registerID}
export type RegisterBranchDeleteRequestBody = unknown;
export interface RegisterBranchDeletePathParams {
  registerID: string;
}
/** Result payload */
export type RegisterBranchDeleteResult = Record<string, unknown>;
export type RegisterBranchDeleteResponse = MeestResponse<RegisterBranchDeleteResult>;
export interface RegisterBranchDeleteRequest {
  path: RegisterBranchDeletePathParams;
  body?: RegisterBranchDeleteRequestBody;
}

// registers :: PUT /registerBranch/{registerID}
export type RegisterBranchPutRequestBody = {
  notation?: string;
  contractID?: string;
  parcelsItems?: Array<{
    parcelID: string;
  }>;
};
export interface RegisterBranchPutPathParams {
  registerID: string;
}
/** Result payload */
export type RegisterBranchPutResult = {
  registerID?: string;
  registerNumber?: string;
};
export type RegisterBranchPutResponse = MeestResponse<RegisterBranchPutResult>;
export interface RegisterBranchPutRequest {
  path: RegisterBranchPutPathParams;
  body?: RegisterBranchPutRequestBody;
}

// registers :: POST /registerPickup
export type RegisterPickupRequestBody = {
  notation?: string;
  contractID?: string;
  payType: string;
  receiverPay?: boolean;
  expectedPickUpDate?: {
    date: string;
    timeFrom: string;
    timeTo: string;
  };
  sender?: {
    name: string;
    phone: string;
    addressID: string;
    building: string;
    flat?: string;
    floor?: string;
  };
  parcelsItems?: Array<{
    parcelID: string;
  }>;
};
/** Result payload */
export type RegisterPickupResult = {
  registerID?: string;
  registerNumber?: string;
  pickUpDate?: string;
};
export type RegisterPickupResponse = MeestResponse<RegisterPickupResult>;
export interface RegisterPickupRequest {
  body?: RegisterPickupRequestBody;
}

// registers :: DELETE /registerPickup/{registerID}
export type RegisterPickupDeleteRequestBody = unknown;
export interface RegisterPickupDeletePathParams {
  registerID: string;
}
/** Result payload */
export type RegisterPickupDeleteResult = Record<string, unknown>;
export type RegisterPickupDeleteResponse = MeestResponse<RegisterPickupDeleteResult>;
export interface RegisterPickupDeleteRequest {
  path: RegisterPickupDeletePathParams;
  body?: RegisterPickupDeleteRequestBody;
}

// registers :: PUT /registerPickup/{registerID}
export type RegisterPickupPutRequestBody = {
  notation?: string;
  contractID?: string;
  payType: string;
  receiverPay: boolean;
  expectedPickUpDate?: {
    date: string;
    timeFrom: string;
    timeTo: string;
  };
  sender?: {
    name: string;
    phone: string;
    addressID: string;
    building: string;
    flat?: string;
    floor?: string;
  };
  parcelsItems?: Array<{
    parcelID: string;
  }>;
};
export interface RegisterPickupPutPathParams {
  registerID: string;
}
/** Result payload */
export type RegisterPickupPutResult = {
  registerID?: string;
  registerNumber?: string;
  pickUpDate?: string;
};
export type RegisterPickupPutResponse = MeestResponse<RegisterPickupPutResult>;
export interface RegisterPickupPutRequest {
  path: RegisterPickupPutPathParams;
  body?: RegisterPickupPutRequestBody;
}

// registers :: GET /registersList/{dateFrom}
export interface RegistersListPathParams {
  dateFrom: string;
}
/** Result payload */
export type RegistersListResult = Array<{
  registerID?: string;
  registerType?: string;
  parcelQty?: number;
}>;
export type RegistersListResponse = MeestResponse<RegistersListResult>;
export interface RegistersListRequest {
  path: RegistersListPathParams;
}

// search :: POST /addressSearch
export type AddressSearchRequestBody = {
  filters?: {
    cityID?: string;
    addressDescr?: string;
    addressID?: string;
  };
};
/** Result payload */
export type AddressSearchResult = Array<{
  addressID?: string;
  addressDescr?: {
    descrUA?: string;
    descrRU?: string;
    descrEN?: string;
    descrLoc?: string;
  };
  latitude?: number;
  longitude?: number;
  cityID?: string;
  viewCity?: string;
  cityDescr?: {
    descrUA?: string;
    descrRU?: string;
    descrEN?: string;
    descrLoc?: string;
  };
  Localization?: string;
}>;
export type AddressSearchResponse = MeestResponse<AddressSearchResult>;
export interface AddressSearchRequest {
  body?: AddressSearchRequestBody;
}

// search :: POST /addressSearchByCoord
export type AddressSearchByCoordRequestBody = {
  lat: number;
  lon: number;
};
/** Result payload */
export type AddressSearchByCoordResult = Array<{
  geoPoint?: {
    lat?: string;
    lon?: string;
    display_name?: string;
  };
  address?: {
    country?: string;
    postcode?: string;
    region?: string;
    city?: string;
    /** county */
    county?: string;
  };
  addressUID?: {
    UIDcity?: string;
    UIDstreet?: string;
  };
}>;
export type AddressSearchByCoordResponse = MeestResponse<AddressSearchByCoordResult>;
export interface AddressSearchByCoordRequest {
  body?: AddressSearchByCoordRequestBody;
}

// search :: POST /branchSearch
export type BranchSearchRequestBody = {
  filters?: {
    branchID?: string;
    branchNo?: number;
    branchTypeID?: string;
    branchDescr?: string;
    cityID?: string;
    cityDescr?: string;
    districtID?: string;
    districtDescr?: string;
    regionID?: string;
    regionDescr?: string;
    networkDepartment?: boolean;
    networkPartner?: string;
    networkPartnerCode?: string;
    addressMoreInformation?: string;
    CheckoutEPS?: boolean;
  };
  getCobranding?: boolean;
  '\u0441obrandingCode'?: string;
  in?: boolean;
  test?: boolean;
  includeInboundRestriction?: boolean;
  BranchLoadSchedule?: boolean;
};
/** Result payload */
export type BranchSearchResult = Array<{
  branchID?: string;
  branchIDref?: string;
  branchNo?: number;
  branchCode?: string;
  branchNumber?: string;
  branchType?: string;
  isBranchOpen?: boolean;
  isBranchClosed?: boolean;
  branchTypeID?: string;
  branchTypeDescr?: string;
  branchTypeAPP?: string;
  branchTypeIDClient?: string;
  ClientTypeSubdivision?: string;
  ClientTypeSubdivisionID?: string;
  ShortName?: string;
  FullName?: string;
  cash?: boolean;
  networkDepartment?: boolean;
  networkPartner?: string;
  networkPartnerCode?: string;
  branchDescr?: {
    descrUA?: string;
    descrLoc?: string;
    descrSearchUA?: string;
    descrSearchLoc?: string;
  };
  addressID?: string;
  addressDescr?: {
    descrUA?: string;
    descrRU?: string;
    descrEN?: string;
    descrLoc?: string;
  };
  addressMoreInformation?: string;
  cityID?: string;
  viewCity?: string;
  cityDescr?: {
    descrUA?: string;
    descrRU?: string;
    descrEN?: string;
    descrLoc?: string;
  };
  districtID?: string;
  districtDescr?: {
    descrUA?: string;
    descrRU?: string;
    descrEN?: string;
    descrLoc?: string;
  };
  regionID?: string;
  regionDescr?: {
    descrUA?: string;
    descrRU?: string;
    descrEN?: string;
    descrLoc?: string;
  };
  workingHours?: string;
  building?: string;
  zipCode?: string;
  latitude?: number;
  longitude?: number;
  branchWorkTime?: Array<{
    day?: string;
    timeFrom?: string;
    timeTo?: string;
    LunchBreakFrom?: string;
    LunchBreakTo?: string;
  }>;
  phone?: string;
  address?: string;
  paymentTypes?: string;
  branchLimits?: {
    weightTotalMax?: number;
    volumeTotalMax?: number;
    insuranceTotalMax?: number;
    weightPlaceMax?: number;
    volumePlaceMax?: number;
    quantityPlacesMax?: number;
    gabaritesMax?: {
      length?: number;
      width?: number;
      height?: number;
      weightMax?: number;
    };
    formatLimit?: boolean;
    cashPayUnavailible?: boolean;
    sendingOnly?: boolean;
    receivingOnly?: boolean;
    receiverCellPhoneRequired?: boolean;
    terminalCash?: boolean;
  };
  Localization?: string;
  CheckoutEPS?: boolean;
  overloaded?: boolean;
  favourite?: boolean;
  reserve?: boolean;
  InboundRestriction?: boolean;
  InboundRestrictionStartDate?: string;
  InboundRestrictionEndDate?: string;
  ResponseArrayRecordNumber?: number;
  paymentMethods?: Array<{
    uid?: string;
    nameUkr?: string;
  }>;
  customerIdentification?: Array<{
    uid?: string;
    nameUkr?: string;
  }>;
  PartnerServices?: Array<Record<string, unknown>>;
  Services?: Array<{
    uid?: string;
    nameUkr?: string;
    '\u043aeflectMAP'?: boolean;
  }>;
  ScheduleLoadDepartments?: Array<{
    Time_Range?: string;
    Received_from_couriers?: number;
    Picked_up_by_couriers?: number;
    Received_by_clients?: number;
    Percentage_Received_from_couriers?: number;
    Percentage_Picked_up_by_couriers?: number;
    Percentage_Received_by_clients?: number;
  }>;
}>;
export type BranchSearchResponse = MeestResponse<BranchSearchResult>;
export interface BranchSearchRequest {
  body?: BranchSearchRequestBody;
}

// search :: GET /branchSearchGeo/{latitude}/{longitude}/{radius}
export interface BranchSearchGeoPathParams {
  latitude: number;
  longitude: number;
  radius: number;
}
/** Result payload */
export type BranchSearchGeoResult = Array<{
  branchID?: string;
  branchNo?: number;
  branchType?: string;
  branchTypeID?: string;
  'branchTypeDes\u0441r'?: string;
  branchTypeAPP?: string;
  isAvailable?: boolean;
  isClosed?: boolean;
  isDeleted?: boolean;
  branchDescr?: {
    descrUA?: string;
    descrSearchUA?: string;
  };
  addressID?: string;
  addressDescr?: {
    descrUA?: string;
    descrRU?: string;
    descrEN?: string;
  };
  addressMoreInformation?: string;
  cityID?: string;
  cityDescr?: {
    descrUA?: string;
    descrRU?: string;
    descrEN?: string;
  };
  regionID?: string;
  regionDescr?: {
    descrUA?: string;
    descrRU?: string;
    descrEN?: string;
  };
  districtID?: string;
  districtDescr?: {
    descrUA?: string;
    descrRU?: string;
    descrEN?: string;
  };
  workingHours?: string;
  building?: string;
  zipCode?: string;
  latitude?: number;
  longitude?: number;
  favourite?: boolean;
  reserve?: boolean;
  mylatitude?: number;
  mylongitude?: number;
  distance?: number;
  radius?: number;
  branchLimits?: {
    weightTotalMax?: number;
    volumeTotalMax?: number;
    insuranceTotalMax?: number;
    weightPlaceMax?: number;
    quantityPlacesMax?: number;
    storageDays?: number;
    gabaritesMax?: {
      length?: number;
      width?: number;
      height?: number;
    };
    formatLimit?: boolean;
    cashPayUnavailible?: boolean;
    sendingOnly?: boolean;
    receivingOnly?: boolean;
    receiverCellPhoneRequired?: boolean;
    terminalCash?: boolean;
  };
}>;
export type BranchSearchGeoResponse = MeestResponse<BranchSearchGeoResult>;
export interface BranchSearchGeoRequest {
  path: BranchSearchGeoPathParams;
}

// search :: GET /branchTypes
/** Result payload */
export type BranchTypesResult = Array<{
  branchTypeID?: string;
  branchTypeDescr?: {
    descrUA?: string;
    type?: string;
    typeAPP?: string;
  };
  branchLimits?: {
    weightTotalMax?: number;
    weightPlaceMax?: number;
    volumeTotalMax?: number;
    quantityPlacesMax?: number;
    insuranceTotalMax?: number;
    storageDays?: number;
    gabaritesMax?: {
      length?: number;
      width?: number;
      height?: number;
    };
  };
  ClientTypeSubdivisionID?: string;
  ClientTypeSubdivision?: string;
  ClientTypeDepartmentNameMini?: string;
  ClientTypeDepartmentDescription?: string;
}>;
export type BranchTypesResponse = MeestResponse<BranchTypesResult>;
export type BranchTypesRequest = Record<string, never>;

// search :: POST /citySearch
export type CitySearchRequestBody = {
  filters?: {
    cityID?: string;
    cityKATUU?: string;
    cityDescr?: string;
    districtID?: string;
    districtDescr?: string;
    countryID?: string;
    regionID?: string;
    regionDescr?: string;
    isDeliveryInCity?: boolean;
    IsBranchInCity?: boolean;
  };
  isDirectory?: boolean;
};
/** Result payload */
export type CitySearchResult = Array<{
  cityID?: string;
  viewCity?: string;
  cityKATUU?: string;
  cityDescr?: {
    descrUA?: string;
    descrRU?: string;
    descrEN?: string;
  };
  districtID?: string;
  districtDescr?: {
    descrUA?: string;
    descrRU?: string;
    descrEN?: string;
  };
  regionID?: string;
  regionDescr?: {
    descrUA?: string;
    descrRU?: string;
    descrEN?: string;
  };
  countryID?: string;
  isBranchInCity?: boolean;
  isDeliveryInCity?: boolean;
  deliveryZone?: number;
  deliveryDays?: {
    Mon?: boolean;
    Tue?: boolean;
    Wed?: boolean;
    Thu?: boolean;
    Fri?: boolean;
    Sat?: boolean;
    Sun?: boolean;
  };
  latitude?: string;
  longitude?: string;
  Localization?: string;
  isAvailableDoorService?: boolean;
  cityLimitsDoorService?: {
    disabledDoorService?: boolean;
    weightPlaceMax?: number;
    weightTotalMax?: number;
    volumeTotalMax?: number;
    insuranceTotalMax?: number;
    quantityPlacesMax?: number;
    gabaritesMaxlength?: number;
    gabaritesMaxwidth?: number;
    gabaritesMaxheight?: number;
  };
}>;
export type CitySearchResponse = MeestResponse<CitySearchResult>;
export interface CitySearchRequest {
  body?: CitySearchRequestBody;
}

// search :: POST /countrySearch
export type CountrySearchRequestBody = {
  filters?: {
    countryID?: string;
    countryDescr?: string;
  };
};
/** Result payload */
export type CountrySearchResult = Array<{
  countryID?: string;
  countryDescr?: {
    descrUA?: string;
    descrRU?: string;
    descrEN?: string;
  };
  alfaCode2?: string;
}>;
export type CountrySearchResponse = MeestResponse<CountrySearchResult>;
export interface CountrySearchRequest {
  body?: CountrySearchRequestBody;
}

// search :: POST /districtSearch
export type DistrictSearchRequestBody = {
  filters?: {
    districtID?: string;
    districtDescr?: string;
    regionID?: string;
    regionDescr?: string;
    districtKATUU?: string;
  };
};
/** Result payload */
export type DistrictSearchResult = Array<{
  districtID?: string;
  districtKATUU?: string;
  districtDescr?: {
    descrUA?: string;
    descrRU?: string;
    descrEN?: string;
  };
  regionID?: string;
  regionDescr?: {
    descrUA?: string;
    descrRU?: string;
    descrEN?: string;
  };
}>;
export type DistrictSearchResponse = MeestResponse<DistrictSearchResult>;
export interface DistrictSearchRequest {
  body?: DistrictSearchRequestBody;
}

// search :: GET /payTerminalSearch/{latitude}/{longitude}/{radius}
export interface PayTerminalSearchPathParams {
  latitude: number;
  longitude: number;
  radius: number;
}
/** Result payload */
export type PayTerminalSearchResult = Array<{
  type?: string;
  longitude?: string;
  latitude?: string;
  payTerminalDescr?: {
    descrUA?: string;
    descrRU?: string;
  };
  workingHours?: {
    descrUA?: string;
    descrRU?: string;
  };
  cityDescr?: {
    descrUA?: string;
    descrRU?: string;
  };
  addressDescr?: {
    descrUA?: string;
    descrRU?: string;
  };
  addressMoreInformationDescr?: {
    descrUA?: string;
    descrRU?: string;
  };
}>;
export type PayTerminalSearchResponse = MeestResponse<PayTerminalSearchResult>;
export interface PayTerminalSearchRequest {
  path: PayTerminalSearchPathParams;
}

// search :: POST /regionSearch
export type RegionSearchRequestBody = {
  filters?: {
    regionID?: string;
    regionKATUU?: string;
    regionDescr?: string;
    countryID?: string;
    countryDescr?: string;
  };
};
/** Result payload */
export type RegionSearchResult = Array<{
  regionID?: string;
  regionKATUU?: string;
  regionDescr?: {
    descrUA?: string;
    descrRU?: string;
    descrEN?: string;
  };
  countryID?: string;
  countryDescr?: {
    descrUA?: string;
    descrRU?: string;
    descrEN?: string;
  };
}>;
export type RegionSearchResponse = MeestResponse<RegionSearchResult>;
export interface RegionSearchRequest {
  body?: RegionSearchRequestBody;
}

// search :: GET /zipCodeSearch/{zipCode}
export interface ZipCodeSearchPathParams {
  zipCode: string;
}
/** Result payload */
export type ZipCodeSearchResult = Array<{
  zipCode?: string;
  cityID?: string;
  cityDescr?: {
    descrUA?: string;
    descrRU?: string;
    descrEN?: string;
  };
  districtID?: string;
  districtDescr?: {
    descrUA?: string;
    descrRU?: string;
    descrEN?: string;
  };
  regionID?: string;
  regionDescr?: {
    descrUA?: string;
    descrRU?: string;
    descrEN?: string;
  };
  countryID?: string;
  isBranchInCity?: boolean;
  deliveryZone?: number;
  deliveryDays?: {
    Mon?: boolean;
    Tue?: boolean;
    Wed?: boolean;
    Thu?: boolean;
    Fri?: boolean;
    Sat?: boolean;
    Sun?: boolean;
  };
}>;
export type ZipCodeSearchResponse = MeestResponse<ZipCodeSearchResult>;
export interface ZipCodeSearchRequest {
  path: ZipCodeSearchPathParams;
}

// tracking :: GET /parcelInfoTracking/{parcelID}
export interface ParcelInfoTrackingPathParams {
  parcelID: string;
}
/** Result payload */
export type ParcelInfoTrackingResult = Array<{
  parcelID?: string;
  parcelIDref?: string;
  parcelNumber?: string;
  barCode?: string;
  PDD?: string;
  JIT0?: string;
  sender?: {
    name?: string;
    phone?: string;
    cityUA?: string;
  };
  receiver?: {
    name?: string;
    phone?: string;
    cityUA?: string;
  };
  DetailingParcelItems?: Array<{
    formatName?: string;
    weight?: number;
    insurance?: number;
  }>;
}>;
export type ParcelInfoTrackingResponse = MeestResponse<ParcelInfoTrackingResult>;
export interface ParcelInfoTrackingRequest {
  path: ParcelInfoTrackingPathParams;
}

// tracking :: GET /tracking/{trackNumber}
export interface TrackingPathParams {
  trackNumber: string;
}
/** Result payload */
export type TrackingResult = Array<{
  parcelNumber?: string;
  barCode?: string;
  eventDateTime?: string;
  eventCode?: number;
  /** event Code. UPU standard */
  eventCodeUPU?: string;
  eventPlaces?: string;
  eventCountryDescr?: {
    descrUA?: string;
    descrRU?: string;
    descrEN?: string;
  };
  eventCityDescr?: {
    descrUA?: string;
    descrRU?: string;
    descrEN?: string;
  };
  eventDescr?: {
    descrUA?: string;
    descrRU?: string;
    descrEN?: string;
  };
  eventDetailDescr?: {
    descrUA?: string;
    descrRU?: string;
    descrEN?: string;
  };
}>;
export type TrackingResponse = MeestResponse<TrackingResult>;
export interface TrackingRequest {
  path: TrackingPathParams;
}

// tracking :: GET /trackingByDate/{searchDate}
export interface TrackingByDatePathParams {
  searchDate: string;
}
/** Result payload */
export type TrackingByDateResult = Array<{
  parcelNumber?: string;
  barCode?: string;
  eventDateTime?: string;
  eventCode?: number;
  /** event Code. UPU standard */
  eventCodeUPU?: string;
  eventCountryDescr?: {
    descrUA?: string;
    descrRU?: string;
    descrEN?: string;
  };
  eventCityDescr?: {
    descrUA?: string;
    descrRU?: string;
    descrEN?: string;
  };
  eventDescr?: {
    descrUA?: string;
    descrRU?: string;
    descrEN?: string;
  };
  eventDetailDescr?: {
    descrUA?: string;
    descrRU?: string;
    descrEN?: string;
  };
}>;
export type TrackingByDateResponse = MeestResponse<TrackingByDateResult>;
export interface TrackingByDateRequest {
  path: TrackingByDatePathParams;
}

// tracking :: GET /trackingByPeriod/{dateFrom}/{dateTo}
export interface TrackingByPeriodPathParams {
  dateFrom: string;
  dateTo: string;
}
/** Result payload */
export type TrackingByPeriodResult = Array<{
  parcelNumber?: string;
  barCode?: string;
  eventDateTime?: string;
  eventCode?: number;
  /** event Code. UPU standard */
  eventCodeUPU?: string;
  eventCountryDescr?: {
    descrUA?: string;
    descrRU?: string;
    descrEN?: string;
  };
  eventCityDescr?: {
    descrUA?: string;
    descrRU?: string;
    descrEN?: string;
  };
  eventDescr?: {
    descrUA?: string;
    descrRU?: string;
    descrEN?: string;
  };
  eventDetailDescr?: {
    descrUA?: string;
    descrRU?: string;
    descrEN?: string;
  };
}>;
export type TrackingByPeriodResponse = MeestResponse<TrackingByPeriodResult>;
export interface TrackingByPeriodRequest {
  path: TrackingByPeriodPathParams;
}

// tracking :: GET /trackingDelivered/{dateFrom}/{dateTo}/{page}
export interface TrackingDeliveredPathParams {
  dateFrom: string;
  dateTo: string;
  page: number;
}
/** Result payload */
export type TrackingDeliveredResult = Array<{
  parcelNumber?: string;
  barCode?: string;
  eventDateTime?: string;
  eventCountryDescr?: {
    descrUA?: string;
    descrRU?: string;
    descrEN?: string;
  };
  eventCityDescr?: {
    descrUA?: string;
    descrRU?: string;
    descrEN?: string;
  };
}>;
export type TrackingDeliveredResponse = MeestResponse<TrackingDeliveredResult>;
export interface TrackingDeliveredRequest {
  path: TrackingDeliveredPathParams;
}
