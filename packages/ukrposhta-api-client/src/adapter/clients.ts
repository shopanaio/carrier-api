// code and comments in English
import type { Client } from '@shopana/carrier-core';
import type { UkrposhtaContractContext } from '../contract';
import type { AddressesService } from '../contract/services/addressesService';
import type { CourierService } from '../contract/services/courierService';
import type { ClientsService } from '../contract/services/clientsService';
import type { LabelsService } from '../contract/services/labelsService';
import type { PricingService } from '../contract/services/pricingService';
import type { ShipmentGroupsService } from '../contract/services/shipmentGroupsService';
import type { ShipmentsService } from '../contract/services/shipmentsService';
import type { ClassifierService, UkrposhtaClassifierContext } from '../public/services/classifierService';
import type { TrackingService, UkrposhtaTrackingContext } from '../public/services/trackingService';

/** The eCom client the adapter needs: `createUkrposhtaContractClient(...)` with these services. */
export type UkrposhtaEcomClient = Client<
  {
    addresses: AddressesService;
    clients: ClientsService;
    shipments: ShipmentsService;
    pricing: PricingService;
    shipmentGroups: ShipmentGroupsService;
    labels: LabelsService;
  },
  UkrposhtaContractContext
>;

/** An eCom client that also has the courier service: it enables `schedulePickup`. */
export type UkrposhtaEcomClientWithCourier = UkrposhtaEcomClient &
  Client<{ courier: CourierService }, UkrposhtaContractContext>;

export type UkrposhtaTrackingClient = Client<{ tracking: TrackingService }, UkrposhtaTrackingContext>;
export type UkrposhtaClassifierClient = Client<{ classifier: ClassifierService }, UkrposhtaClassifierContext>;

/**
 * Clients to build the adapter from. Pass what you have: each capability is declared only when its
 * client is present (tracking needs only the tracking bearer, locations only the classifier).
 */
export interface UkrposhtaAdapterClients {
  /** Shipments, rates, labels, cancel and manifest. */
  ecom?: UkrposhtaEcomClient;
  /** Tracking. */
  tracking?: UkrposhtaTrackingClient;
  /** Locations and address validation. */
  classifier?: UkrposhtaClassifierClient;
}
