// code and comments in English
import type { CallOptions, ShipmentType, UkrposhtaMessage } from '../types/common';
import type {
  GroupAddResult,
  GroupShipmentsCount,
  GroupShipmentsQuery,
  ShipmentGroup,
  ShipmentGroupInput,
} from '../types/group';
import type { Shipment, ShipmentInput } from '../types/shipment';
import type { UkrposhtaContractContext } from './base';
import { WITH_TOKEN } from './base';

/**
 * Shipment groups (`/shipment-groups`): the register of form 103a. A group closes when its shipments are registered
 * at a post office; shipments can be added and removed only before that. A group holds up to 500 shipments.
 */
export class ShipmentGroupsService {
  readonly namespace = 'shipmentGroups' as const;
  private ctx!: UkrposhtaContractContext;

  attach(ctx: UkrposhtaContractContext) {
    this.ctx = ctx;
  }

  /** `POST /shipment-groups`. */
  create(group: ShipmentGroupInput, options?: CallOptions): Promise<ShipmentGroup>;
  /** `POST /shipment-groups` with an array: up to 100 groups in one request. */
  create(groups: ShipmentGroupInput[], options?: CallOptions): Promise<ShipmentGroup[]>;
  create(body: ShipmentGroupInput | ShipmentGroupInput[], options: CallOptions = {}) {
    return this.ctx.http.request<ShipmentGroup | ShipmentGroup[]>({
      method: 'POST',
      path: '/shipment-groups',
      json: body,
      meta: WITH_TOKEN,
      signal: options.signal,
    });
  }

  /** `PUT /shipment-groups/{uuid}`: renames the group. */
  rename(uuid: string, name: string, options: CallOptions = {}): Promise<ShipmentGroup> {
    return this.ctx.http.request<ShipmentGroup>({
      method: 'PUT',
      path: '/shipment-groups/{uuid}',
      pathParams: { uuid },
      json: { name },
      meta: WITH_TOKEN,
      signal: options.signal,
    });
  }

  /** `POST /shipment-groups/{groupUuid}/shipments/{shipmentUuid}`. */
  addShipment(groupUuid: string, shipmentUuid: string, options: CallOptions = {}): Promise<UkrposhtaMessage> {
    return this.ctx.http.request<UkrposhtaMessage>({
      method: 'POST',
      path: '/shipment-groups/{groupUuid}/shipments/{shipmentUuid}',
      pathParams: { groupUuid, shipmentUuid },
      meta: WITH_TOKEN,
      signal: options.signal,
    });
  }

  /**
   * `PUT /shipment-groups/{groupUuid}/shipments`: up to 1000 shipments by uuid or by barcode. A shipment that
   * cannot be added is reported in the answer (HTTP 207) while the others are added.
   */
  addShipments(groupUuid: string, shipmentIdentifiers: string[], options: CallOptions = {}): Promise<GroupAddResult[]> {
    return this.ctx.http.request<GroupAddResult[]>({
      method: 'PUT',
      path: '/shipment-groups/{groupUuid}/shipments',
      pathParams: { groupUuid },
      json: shipmentIdentifiers,
      meta: WITH_TOKEN,
      signal: options.signal,
    });
  }

  /** `POST /shipment-groups/{groupUuid}/shipments`: creates shipments directly inside the group. */
  createShipment(groupUuid: string, shipment: ShipmentInput, options?: CallOptions): Promise<Shipment>;
  createShipment(groupUuid: string, shipments: ShipmentInput[], options?: CallOptions): Promise<Shipment[]>;
  createShipment(groupUuid: string, body: ShipmentInput | ShipmentInput[], options: CallOptions = {}) {
    return this.ctx.http.request<Shipment | Shipment[]>({
      method: 'POST',
      path: '/shipment-groups/{groupUuid}/shipments',
      pathParams: { groupUuid },
      json: body,
      meta: WITH_TOKEN,
      signal: options.signal,
    });
  }

  /** `DELETE /shipments/{shipmentUuid}/shipment-group`: takes a shipment out of its group. */
  async removeShipment(shipmentUuid: string, options: CallOptions = {}): Promise<void> {
    await this.ctx.http.request({
      method: 'DELETE',
      path: '/shipments/{shipmentUuid}/shipment-group',
      pathParams: { shipmentUuid },
      meta: WITH_TOKEN,
      signal: options.signal,
    });
  }

  /** `GET /shipment-groups/clients/{clientUuid}`, optionally only groups of one shipment type. */
  listByClient(clientUuid: string, filter: { type?: ShipmentType } = {}, options: CallOptions = {}) {
    return this.ctx.http.request<ShipmentGroup[]>({
      method: 'GET',
      path: '/shipment-groups/clients/{clientUuid}',
      pathParams: { clientUuid },
      query: { type: filter.type },
      meta: WITH_TOKEN,
      signal: options.signal,
    });
  }

  /** `GET /clients/{clientUuid}/shipment-groups/from/{from}/to/{to}`: groups created within `[from, to]` (`YYYY-MM-DD`). */
  listByClientAndDates(clientUuid: string, range: { from: string; to: string }, options: CallOptions = {}) {
    return this.ctx.http.request<ShipmentGroup[]>({
      method: 'GET',
      path: '/clients/{clientUuid}/shipment-groups/from/{from}/to/{to}',
      pathParams: { clientUuid, from: range.from, to: range.to },
      meta: WITH_TOKEN,
      signal: options.signal,
    });
  }

  /** `GET /clients/{clientUuid}/shipment-groups/name/{name}` (with `/from/{from}/to/{to}` when `range` is given). */
  listByClientAndName(
    clientUuid: string,
    name: string,
    range?: { from: string; to: string },
    options: CallOptions = {},
  ) {
    return this.ctx.http.request<ShipmentGroup[]>({
      method: 'GET',
      path: range
        ? '/clients/{clientUuid}/shipment-groups/name/{name}/from/{from}/to/{to}'
        : '/clients/{clientUuid}/shipment-groups/name/{name}',
      pathParams: { clientUuid, name, ...(range ? { from: range.from, to: range.to } : {}) },
      meta: WITH_TOKEN,
      signal: options.signal,
    });
  }

  /** `GET /shipments/shipment-group/{shipmentUuid}`: the group a shipment belongs to. */
  getByShipment(shipmentUuid: string, options: CallOptions = {}): Promise<ShipmentGroup> {
    return this.ctx.http.request<ShipmentGroup>({
      method: 'GET',
      path: '/shipments/shipment-group/{shipmentUuid}',
      pathParams: { shipmentUuid },
      meta: WITH_TOKEN,
      signal: options.signal,
    });
  }

  /** `GET /shipment-groups/{groupUuid}/shipments`. */
  listShipments(groupUuid: string, query: GroupShipmentsQuery = {}, options: CallOptions = {}): Promise<Shipment[]> {
    return this.ctx.http.request<Shipment[]>({
      method: 'GET',
      path: '/shipment-groups/{groupUuid}/shipments',
      pathParams: { groupUuid },
      query: toGroupQuery(query),
      meta: WITH_TOKEN,
      signal: options.signal,
    });
  }

  /** `GET /shipment-groups/{groupUuid}/shipments-count`. */
  countShipments(
    groupUuid: string,
    filter: Pick<GroupShipmentsQuery, 'status'> = {},
    options: CallOptions = {},
  ): Promise<GroupShipmentsCount> {
    return this.ctx.http.request<GroupShipmentsCount>({
      method: 'GET',
      path: '/shipment-groups/{groupUuid}/shipments-count',
      pathParams: { groupUuid },
      query: toGroupQuery(filter),
      meta: WITH_TOKEN,
      signal: options.signal,
    });
  }

  /** Walks every page of a group's shipments. */
  async *iterateShipments(
    groupUuid: string,
    query: Omit<GroupShipmentsQuery, 'page'> = {},
    options: CallOptions = {},
  ): AsyncGenerator<Shipment> {
    const size = query.size ?? 100;
    for (let page = 1; ; page += 1) {
      const shipments = await this.listShipments(groupUuid, { ...query, size, page }, options);
      yield* shipments;
      if (shipments.length < size) return;
    }
  }
}

function toGroupQuery(query: GroupShipmentsQuery) {
  return {
    status: Array.isArray(query.status) ? query.status.join(',') : query.status,
    size: query.size,
    page: query.page,
    sort: query.sort?.join(','),
    order: query.order,
    statusesGroup: query.statusesGroup,
  };
}
