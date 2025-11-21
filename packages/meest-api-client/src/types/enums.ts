// code and comments in English
/** High-level payment responsibility */
export enum PaymentType {
  Sender = 'Sender',
  Recipient = 'Recipient',
  ThirdParty = 'ThirdParty',
}

/** Delivery service type */
export enum ServiceType {
  Door = 'Door',
  Branch = 'Branch',
}

/** Parcel creation services */
export enum ParcelService {
  WarehouseWarehouse = 'WarehouseWarehouse',
  WarehouseDoor = 'WarehouseDoor',
  DoorWarehouse = 'DoorWarehouse',
  DoorDoor = 'DoorDoor',
}

/** Additional delivery options */
export enum DeliveryOption {
  SaturdayDelivery = 'SaturdayDelivery',
  EveningDelivery = 'EveningDelivery',
  ReturnDocuments = 'ReturnDocuments',
}

/** Known parcel processing states */
export enum ParcelStatusCode {
  Created = 'CREATED',
  Registered = 'REGISTERED',
  Accepted = 'ACCEPTED',
  InTransit = 'IN_TRANSIT',
  OnDelivery = 'ON_DELIVERY',
  Delivered = 'DELIVERED',
  DeliveredToStorage = 'DELIVERED_TO_STORAGE',
  Returned = 'RETURNED',
  Deleted = 'DELETED',
  CreatedNotTransferred = 'CREATED_NOT_TRANSFERRED',
}

/** Print endpoints may request different artifact formats */
export enum PrintFormat {
  Pdf = 'pdf',
  Zpl = 'zpl',
  Png = 'png',
}

export const PAYMENT_TYPES = Object.values(PaymentType);
export const SERVICE_TYPES = Object.values(ServiceType);
export const PRINT_FORMATS = Object.values(PrintFormat);

export function isPaymentType(value: string): value is PaymentType {
  return PAYMENT_TYPES.includes(value as PaymentType);
}

export function isPrintFormat(value: string): value is PrintFormat {
  return PRINT_FORMATS.includes(value as PrintFormat);
}
