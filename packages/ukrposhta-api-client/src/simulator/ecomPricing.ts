// code and comments in English
import type { DeliveryType, ShipmentType } from '../contract/types/common';
import type { DeliveryPrice, DeliveryPriceRequest, PriceParcel, Tariff } from '../contract/types/pricing';

/** Upper weight bound (grams) → price in UAH, the REGION tariff of Express from the documentation. */
const WEIGHT_STEPS: ReadonlyArray<readonly [number, number]> = [
  [250, 18],
  [500, 21],
  [1000, 24],
  [2000, 30],
  [5000, 33],
  [10000, 44],
  [15000, 54],
  [20000, 64],
];

const DOOR_FEE = 12;
const STANDARD_DISCOUNT = 0.9;
const DECLARED_PRICE_RATE = 0.005;
const RETURN_RATIO = 0.5;

export function simulatedTariffs(): Tariff[] {
  return WEIGHT_STEPS.map(([weight, price], index) => ({
    uuid: `71d2fb97-6f${(0x2f + index).toString(16)}-be66-e053-6c66ff0a3dd0`,
    weight,
    length: 50,
    shipmentType: 'EXPRESS' as const,
    w2wVariation: 'REGION' as const,
    price,
    pricePerKg: 0,
    fromDate: '2018-08-01T00:00:00',
    toDate: '2099-12-31T00:00:00',
  }));
}

function weightPrice(grams: number): number {
  const step = WEIGHT_STEPS.find(([limit]) => grams <= limit);
  if (step) return step[1];
  const [lastLimit, lastPrice] = WEIGHT_STEPS[WEIGHT_STEPS.length - 1];
  return lastPrice + 4 * Math.ceil((grams - lastLimit) / 1000);
}

function doors(deliveryType: DeliveryType): number {
  return deliveryType === 'D2D' ? 2 : deliveryType === 'W2W' ? 0 : 1;
}

const round = (value: number) => Math.round(value * 100) / 100;

/** A deterministic stand-in for the carrier's tariff: enough to test totals, discounts and surcharges. */
export function simulatedPrice(input: {
  type: ShipmentType;
  deliveryType: DeliveryType;
  parcels: PriceParcel[];
  declaredPrice?: number;
  postPay?: number;
  discounts?: Array<{ description?: string; rate: number }>;
  documentBack?: boolean;
  sms?: boolean;
}): DeliveryPrice {
  const parts: string[] = [];
  let raw = 0;
  for (const parcel of input.parcels) {
    const price = weightPrice(parcel.weight) * (input.type === 'STANDARD' ? STANDARD_DISCOUNT : 1);
    raw += price;
    parts.push(`tariff (${input.type}, ${parcel.weight} g, ${parcel.length} cm)=${price.toFixed(2)}`);
  }
  const door = doors(input.deliveryType) * DOOR_FEE;
  if (door > 0) parts.push(`delivery type(${input.deliveryType})=${door.toFixed(2)}`);
  raw += door;
  const declared = input.declaredPrice ?? input.parcels.reduce((sum, p) => sum + (p.declaredPrice ?? 0), 0);
  const surcharge = round(declared * DECLARED_PRICE_RATE);
  if (surcharge > 0) parts.push(`declared price surcharge=${surcharge.toFixed(2)}`);
  raw += surcharge;
  if (input.documentBack) {
    raw += 40;
    parts.push('document back=40.00');
  }
  if (input.sms) {
    raw += 3;
    parts.push('sms=3.00');
  }
  raw = round(raw);
  let price = raw;
  for (const discount of input.discounts ?? []) {
    const amount = round((raw * discount.rate) / 100);
    price -= amount;
    parts.push(`${discount.description ?? `Discount ${discount.rate}%`}=${amount.toFixed(2)}`);
  }
  price = round(price);
  const postPayFee = input.postPay ? round(input.postPay * 0.02 + 5) : 0;
  return {
    deliveryPrice: price,
    rawDeliveryPrice: raw,
    calculationDescription: `Price=${price.toFixed(2)}: ${parts.join('; ')}`,
    postPayDeliveryPrice: postPayFee,
    returnDeliveryPrice: round(price * RETURN_RATIO),
    declaredPriceSurcharge: surcharge,
  };
}

export function requestToPriceInput(request: DeliveryPriceRequest): Parameters<typeof simulatedPrice>[0] {
  const parcels: PriceParcel[] = request.parcels ?? [
    {
      weight: request.weight ?? 0,
      length: request.length ?? 0,
      ...(request.width === undefined ? {} : { width: request.width }),
      ...(request.height === undefined ? {} : { height: request.height }),
    },
  ];
  return {
    type: request.type,
    deliveryType: request.deliveryType,
    parcels,
    declaredPrice: request.declaredPrice,
    postPay: request.postPay,
    discounts: request.discounts,
    documentBack: request.documentBack,
    sms: request.sms,
  };
}
