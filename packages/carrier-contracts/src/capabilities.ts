// code and comments in English
import type {
  Address,
  AddressValidationResult,
  CreateShipmentInput,
  Label,
  LabelRequest,
  Location,
  LocationQuery,
  Manifest,
  Pickup,
  PickupRequest,
  Rate,
  RateRequest,
  Shipment,
  TrackingEvent,
  TrackingResult,
  TransitTime,
} from './model';

export const CAPABILITIES = [
  'rates',
  'shipments',
  'labels',
  'tracking',
  'cancel',
  'pickup',
  'locations',
  'returns',
  'manifest',
  'addressValidation',
  'transitTimes',
  'webhooks',
] as const;

export type Capability = (typeof CAPABILITIES)[number];

/** Per-call options every capability method accepts. */
export interface CallOptions {
  signal?: AbortSignal;
}

export interface RatesCapability {
  getRates(request: RateRequest, options?: CallOptions): Promise<Rate[]>;
}

export interface ShipmentsCapability {
  createShipment(input: CreateShipmentInput, options?: CallOptions): Promise<Shipment>;
  getShipment?(id: string, options?: CallOptions): Promise<Shipment>;
}

export interface LabelsCapability {
  getLabel(request: LabelRequest, options?: CallOptions): Promise<Label>;
}

export interface TrackingCapability {
  track(trackingNumbers: string[], options?: CallOptions): Promise<TrackingResult[]>;
}

export interface CancelCapability {
  cancelShipment(id: string, options?: CallOptions): Promise<void>;
}

export interface PickupCapability {
  schedulePickup(request: PickupRequest, options?: CallOptions): Promise<Pickup>;
  cancelPickup?(id: string, options?: CallOptions): Promise<void>;
}

export interface LocationsCapability {
  findLocations(query: LocationQuery, options?: CallOptions): Promise<Location[]>;
}

export interface ReturnsCapability {
  createReturn(shipmentId: string, options?: CallOptions & { reason?: string }): Promise<Shipment>;
}

export interface ManifestCapability {
  createManifest(shipmentIds: string[], options?: CallOptions): Promise<Manifest>;
}

export interface AddressValidationCapability {
  validateAddress(address: Address, options?: CallOptions): Promise<AddressValidationResult>;
}

export interface TransitTimesCapability {
  getTransitTimes(request: RateRequest, options?: CallOptions): Promise<TransitTime[]>;
}

/**
 * Push tracking without an HTTP server: the consumer receives the request and hands
 * headers + raw body to the adapter.
 */
export interface WebhooksCapability {
  verifyWebhook(headers: Record<string, string>, rawBody: string | Uint8Array): boolean | Promise<boolean>;
  parseWebhook(rawBody: string | Uint8Array): Array<TrackingEvent & { trackingNumber: string }>;
}

export interface CapabilityMap {
  rates: RatesCapability;
  shipments: ShipmentsCapability;
  labels: LabelsCapability;
  tracking: TrackingCapability;
  cancel: CancelCapability;
  pickup: PickupCapability;
  locations: LocationsCapability;
  returns: ReturnsCapability;
  manifest: ManifestCapability;
  addressValidation: AddressValidationCapability;
  transitTimes: TransitTimesCapability;
  webhooks: WebhooksCapability;
}

/** Methods each capability must implement; used by `hasCapability` and conformance checks. */
export const CAPABILITY_METHODS: { readonly [C in Capability]: readonly string[] } = {
  rates: ['getRates'],
  shipments: ['createShipment'],
  labels: ['getLabel'],
  tracking: ['track'],
  cancel: ['cancelShipment'],
  pickup: ['schedulePickup'],
  locations: ['findLocations'],
  returns: ['createReturn'],
  manifest: ['createManifest'],
  addressValidation: ['validateAddress'],
  transitTimes: ['getTransitTimes'],
  webhooks: ['verifyWebhook', 'parseWebhook'],
};

type UnionToIntersection<U> = (U extends unknown ? (arg: U) => void : never) extends (arg: infer I) => void ? I : never;

/** How often a carrier may be polled for tracking. Scheduling stays with the consumer. */
export interface TrackingPolicy {
  /** Minimum seconds between polls of the same number. */
  minIntervalSec?: number;
  /** Max numbers per `track` call; adapters chunk larger inputs. */
  maxPerCall?: number;
  /** False when the carrier forbids polling (Hermes DE). */
  pollingAllowed: boolean;
}

export interface AdapterBase<C extends Capability> {
  /** Carrier slug, e.g. `ukrposhta`. */
  readonly carrier: string;
  readonly capabilities: ReadonlySet<C>;
  readonly trackingPolicy?: TrackingPolicy;
}

/**
 * An adapter typed by its declared capabilities:
 * `CarrierAdapter<'shipments' | 'tracking'>` has exactly `createShipment` and `track` (plus base fields).
 */
export type CarrierAdapter<C extends Capability = Capability> = AdapterBase<C> & UnionToIntersection<CapabilityMap[C]>;

/** Narrows an adapter of unknown capabilities. Checks both the declaration and the methods. */
export function hasCapability<C extends Capability>(
  adapter: AdapterBase<Capability>,
  capability: C,
): adapter is AdapterBase<Capability> & CapabilityMap[C] {
  if (!isKnownCapability(capability) || !adapter.capabilities.has(capability)) return false;
  return CAPABILITY_METHODS[capability].every(
    method => typeof (adapter as unknown as Record<string, unknown>)[method] === 'function',
  );
}

function isKnownCapability(capability: string): capability is Capability {
  return Object.prototype.hasOwnProperty.call(CAPABILITY_METHODS, capability);
}

/**
 * Builds an adapter object, checking that every declared capability has its methods.
 * Accepts plain objects and class instances: methods and getters (own and prototype) are kept, bound to the instance.
 */
export function defineAdapter<C extends Capability>(
  adapter: { carrier: string; capabilities: readonly C[]; trackingPolicy?: TrackingPolicy } & UnionToIntersection<
    CapabilityMap[C]
  >,
): CarrierAdapter<C> {
  const source = adapter as unknown as { carrier?: unknown; capabilities: readonly C[] } & Record<string, unknown>;
  for (const capability of source.capabilities) {
    if (!isKnownCapability(capability))
      throw new TypeError(`Adapter ${String(source.carrier)} declares unknown capability "${String(capability)}"`);
    for (const method of CAPABILITY_METHODS[capability]) {
      if (typeof source[method] !== 'function') {
        throw new TypeError(`Adapter ${String(source.carrier)} declares "${capability}" but has no ${method}()`);
      }
    }
  }

  const result: Record<string, unknown> = {};
  const has = (key: string) => Object.prototype.hasOwnProperty.call(result, key);
  // Methods and getters from the prototype chain of a class instance, bound to the instance;
  // the nearest definition wins and own properties below override them.
  for (
    let proto = Object.getPrototypeOf(adapter) as object | null;
    proto && proto !== Object.prototype;
    proto = Object.getPrototypeOf(proto) as object | null
  ) {
    for (const key of Object.getOwnPropertyNames(proto)) {
      if (key === 'constructor' || has(key)) continue;
      const descriptor = Object.getOwnPropertyDescriptor(proto, key);
      if (typeof descriptor?.value === 'function') {
        result[key] = (descriptor.value as (...args: unknown[]) => unknown).bind(adapter);
      } else if (descriptor?.get !== undefined) {
        const owner = proto;
        Object.defineProperty(result, key, {
          get: (): unknown => Reflect.get(owner, key, adapter),
          enumerable: true,
          configurable: true,
        });
      }
    }
  }
  for (const key of Object.keys(source)) {
    if (key === 'capabilities') continue;
    const descriptor = Object.getOwnPropertyDescriptor(source, key);
    // Own getters stay live like prototype getters instead of being read once.
    if (descriptor?.get !== undefined) {
      Object.defineProperty(result, key, {
        get: (): unknown => Reflect.get(adapter as object, key),
        enumerable: true,
        configurable: true,
      });
    } else {
      Object.defineProperty(result, key, {
        value: descriptor?.value,
        enumerable: true,
        configurable: true,
        writable: true,
      });
    }
  }
  result.capabilities = new Set(source.capabilities);
  return result as unknown as CarrierAdapter<C>;
}
