/**
 * A tiny fake carrier wired end to end the way real carrier packages are meant to be:
 * contract → simulator handlers → raw client (carrier-core services) → adapter (carrier-contracts).
 * Envelope and token flow mimic Meest: `{ status, info, result }`, `POST /auth` → `token` header.
 */
import {
  CarrierError,
  CarrierErrorCategory,
  createClient,
  createHttpClient,
  tokenAuth,
} from '@shopana/carrier-core';
import type { ClientContext, HttpTransport, RetryOptions } from '@shopana/carrier-core';
import { createStatusMapper, defineAdapter, latestStatus, money, toKg } from '@shopana/carrier-contracts';
import type { CreateShipmentInput, TrackingEvent } from '@shopana/carrier-contracts';
import { binary, createSimulator, defineContract, httpError, json, Lifecycle, minimalPdf, SimClock, SimStore } from '../../src';
import type { SimContext } from '../../src';

export const BASE_URL = 'https://api.demo.test/v1';

const envelope = (result: Record<string, unknown>) => ({
  type: 'object',
  required: ['status', 'result'],
  properties: { status: { const: 'OK' }, info: {}, result },
});

// Every error the demo carrier returns (400/401/404/429) uses the same envelope.
const errorEnvelope = {
  type: 'object',
  required: ['status', 'info'],
  properties: { status: { const: 'Error' }, info: { type: 'object', required: ['message'] }, result: { type: 'null' } },
};

export const demoContract = defineContract({
  name: 'demo',
  baseUrl: BASE_URL,
  components: {
    schemas: {
      Party: {
        type: 'object',
        required: ['name', 'phone', 'branchId'],
        additionalProperties: false,
        properties: { name: { type: 'string', minLength: 1 }, phone: { type: 'string', pattern: '^\\+380\\d{9}$' }, branchId: { type: 'string' } },
      },
      Shipment: {
        type: 'object',
        required: ['id', 'barcode', 'status'],
        properties: { id: { type: 'string', format: 'uuid' }, barcode: { type: 'string' }, status: { type: 'string' }, cost: { type: 'number' } },
      },
    },
  },
  operations: [
    {
      id: 'auth',
      method: 'POST',
      path: '/auth',
      requestBody: { kind: 'json', required: true, schema: { type: 'object', required: ['username', 'password'], properties: { username: { type: 'string' }, password: { type: 'string' } } } },
      responses: { '200': { schema: envelope({ type: 'object', required: ['token', 'refreshToken', 'expiresIn'] }) }, default: { schema: errorEnvelope } },
    },
    {
      id: 'refreshToken',
      method: 'POST',
      path: '/refreshToken',
      requestBody: { kind: 'json', required: true, schema: { type: 'object', required: ['refreshToken'] } },
    },
    {
      id: 'createShipment',
      method: 'POST',
      path: '/shipments',
      requestBody: {
        kind: 'json',
        required: true,
        schema: {
          type: 'object',
          required: ['sender', 'receiver', 'weight'],
          additionalProperties: false,
          properties: {
            sender: { $ref: '#/components/schemas/Party' },
            receiver: { $ref: '#/components/schemas/Party' },
            weight: { type: 'number', exclusiveMinimum: 0, maximum: 30 },
            cod: { type: 'number', minimum: 0 },
          },
        },
      },
      responses: { '200': { schema: envelope({ $ref: '#/components/schemas/Shipment' }) }, default: { schema: errorEnvelope } },
    },
    { id: 'getShipment', method: 'GET', path: '/shipments/{id}', params: { path: { type: 'object', properties: { id: { type: 'string', format: 'uuid' } } } } },
    { id: 'deleteShipment', method: 'DELETE', path: '/shipments/{id}' },
    {
      id: 'label',
      method: 'GET',
      path: '/shipments/{id}/label',
      params: { query: { type: 'object', properties: { size: { enum: ['A4', 'A5', '100x100'] } } } },
    },
    { id: 'tracking', method: 'GET', path: '/tracking/{barcode}' },
    {
      id: 'calculate',
      method: 'POST',
      path: '/calculate',
      requestBody: { kind: 'json', required: true, schema: { type: 'object', required: ['weight'], properties: { weight: { type: 'number' }, cod: { type: 'number' } } } },
    },
    {
      id: 'branches',
      method: 'GET',
      path: '/branches',
      params: { query: { type: 'object', required: ['city'], properties: { city: { type: 'string' }, limit: { type: 'integer', minimum: 1 } } } },
    },
  ],
});

export type DemoStatus = 'CREATED' | 'REGISTERED' | 'IN_TRANSIT' | 'AT_BRANCH' | 'DELIVERED' | 'CANCELLED';

export const demoLifecycle = new Lifecycle<DemoStatus>({
  CREATED: ['REGISTERED', 'CANCELLED'],
  REGISTERED: ['IN_TRANSIT'],
  IN_TRANSIT: ['AT_BRANCH'],
  AT_BRANCH: ['DELIVERED'],
  DELIVERED: [],
  CANCELLED: [],
});

const EVENT_CODES: Record<DemoStatus, string> = {
  CREATED: '100',
  REGISTERED: '200',
  IN_TRANSIT: '300',
  AT_BRANCH: '400',
  DELIVERED: '500',
  CANCELLED: '900',
};

interface ShipmentRow {
  id: string;
  barcode: string;
  status: DemoStatus;
  cost: number;
  weight: number;
  events: Array<{ code: string; at: string }>;
}

const fail = (status: number, fieldName: string | null, message: string) =>
  httpError(status, { status: 'Error', info: { fieldName, message, messageDetails: null }, result: null });

export function createDemoSimulator(options: { clock?: SimClock; tokenTtlSec?: number } = {}) {
  const clock = options.clock ?? new SimClock();
  const state = new SimStore();
  const shipments = state.collection<ShipmentRow>('shipments');
  const tokens = state.collection<{ expiresAt: number }>('tokens');
  const refreshTokens = state.collection<{ user: string }>('refreshTokens');
  const ttl = options.tokenTtlSec ?? 86_400;

  const issue = (ctx: SimContext) => {
    const token = ctx.state.ids.sequence('token', { prefix: 'tok-' });
    const refreshToken = ctx.state.ids.sequence('refresh', { prefix: 'ref-' });
    tokens.insert(token, { expiresAt: ctx.clock.now() + ttl * 1000 });
    refreshTokens.insert(refreshToken, { user: 'demo' });
    return json({ status: 'OK', info: null, result: { token, refreshToken, expiresIn: ttl } });
  };

  const requireShipment = (id: string) => shipments.require(id, () => fail(404, 'id', `Shipment ${id} not found`));

  const sim = createSimulator({
    contract: demoContract,
    state,
    clock,
    rateLimit: { limit: 100, windowMs: 60_000, key: ctx => ctx.headers.token ?? 'anonymous' },
    auth: ctx => {
      if (ctx.operation.id === 'auth' || ctx.operation.id === 'refreshToken' || ctx.operation.id === 'branches') return undefined;
      const token = tokens.get(ctx.headers.token ?? '');
      if (!token || token.expiresAt <= ctx.clock.now()) {
        return { status: 401, body: { status: 'Error', info: { fieldName: 'token', message: 'Token expired or invalid', messageDetails: null }, result: null } };
      }
      return undefined;
    },
    invalidRequest: issues => ({
      status: 400,
      body: { status: 'Error', info: { fieldName: issues[0]!.field ?? null, message: issues[0]!.message, messageDetails: issues.map(i => i.message) }, result: null },
    }),
    handlers: {
      auth: ctx => {
        const { username, password } = ctx.body as { username: string; password: string };
        if (username !== 'demo' || password !== 'secret') throw fail(401, 'password', 'Invalid credentials');
        return issue(ctx);
      },
      refreshToken: ctx => {
        const { refreshToken } = ctx.body as { refreshToken: string };
        if (!refreshTokens.delete(refreshToken)) throw fail(401, 'refreshToken', 'Refresh token invalid');
        return issue(ctx);
      },
      createShipment: ctx => {
        const body = ctx.body as { weight: number; cod?: number };
        const row: ShipmentRow = {
          id: ctx.state.ids.uuid('shipment'),
          barcode: ctx.state.ids.sequence('barcode', { prefix: '05', pad: 11 }),
          status: 'CREATED',
          cost: 50 + Math.ceil(body.weight) * 10,
          weight: body.weight,
          events: [{ code: EVENT_CODES.CREATED, at: ctx.clock.toISOString() }],
        };
        shipments.insert(row.id, row);
        return json({ status: 'OK', info: null, result: { id: row.id, barcode: row.barcode, status: row.status, cost: row.cost } });
      },
      getShipment: ctx => {
        const row = requireShipment(String(ctx.params.id));
        return json({ status: 'OK', info: null, result: { id: row.id, barcode: row.barcode, status: row.status, cost: row.cost } });
      },
      deleteShipment: ctx => {
        const row = requireShipment(String(ctx.params.id));
        if (row.status !== 'CREATED') throw fail(409, 'status', `Cannot delete shipment in status ${row.status}`);
        shipments.update(row.id, { status: 'CANCELLED' });
        return json({ status: 'OK', info: null, result: null });
      },
      label: ctx => binary('application/pdf', minimalPdf(requireShipment(String(ctx.params.id)).barcode)),
      tracking: ctx => {
        const row = shipments.find(s => s.barcode === ctx.params.barcode);
        if (!row) throw fail(404, 'barcode', 'Not found');
        return json({ status: 'OK', info: null, result: row.events.map(e => ({ eventCode: e.code, eventDate: e.at })) });
      },
      calculate: ctx => {
        const body = ctx.body as { weight: number; cod?: number };
        return json({ status: 'OK', info: null, result: { cost: 50 + Math.ceil(body.weight) * 10, codFee: body.cod ? Math.round(body.cod * 0.02 * 100) / 100 : 0 } });
      },
      branches: ctx => {
        const all = [
          { id: 'b-1', num: '1', city: 'Kyiv', address: 'Khreshchatyk 1' },
          { id: 'b-2', num: '2', city: 'Kyiv', address: 'Saksahanskoho 10' },
          { id: 'b-3', num: '1', city: 'Lviv', address: 'Rynok 1' },
        ];
        const hits = all.filter(b => b.city === ctx.query.city).slice(0, (ctx.query.limit as number | undefined) ?? 50);
        return json({ status: 'OK', info: null, result: hits });
      },
    },
  });

  /** Walks a shipment to `target`, appending one event per intermediate status. */
  const advance = (id: string, target: DemoStatus) => {
    const row = shipments.require(id);
    for (const status of demoLifecycle.path(row.status, target)) {
      clock.advance(3_600_000);
      row.events.push({ code: EVENT_CODES[status], at: clock.toISOString() });
      row.status = status;
    }
  };

  return Object.assign(sim, { advance, shipments });
}

// ---------- raw client (carrier package `src/contract`) ----------

export interface DemoConfig {
  username: string;
  password: string;
}

type DemoContext = ClientContext<DemoConfig>;

const unwrapEnvelope = (data: unknown, httpStatus: number) => {
  const env = data as { status?: string; info?: { fieldName?: string | null; message?: string }; result?: unknown };
  if (env?.status === 'OK') return env.result;
  return new CarrierError({
    carrier: 'demo',
    code: `${httpStatus}${env?.info?.fieldName ? `:${env.info.fieldName}` : ''}`,
    message: env?.info?.message ?? `HTTP ${httpStatus}`,
    category:
      httpStatus === 401 ? CarrierErrorCategory.Authentication : httpStatus === 404 ? CarrierErrorCategory.NotFound : httpStatus >= 500 ? CarrierErrorCategory.Server : CarrierErrorCategory.Validation,
    httpStatus,
    ...(env?.info?.fieldName ? { field: env.info.fieldName } : {}),
    raw: data,
  });
};

export class ShipmentsService {
  readonly namespace = 'shipments' as const;
  private ctx!: DemoContext;
  attach(ctx: DemoContext) {
    this.ctx = ctx;
  }
  create(body: { sender: object; receiver: object; weight: number; cod?: number }) {
    return this.ctx.http.request<{ id: string; barcode: string; status: string; cost: number }>({ method: 'POST', path: '/shipments', json: body });
  }
  get(id: string) {
    return this.ctx.http.request<{ id: string; barcode: string; status: string; cost: number }>({ method: 'GET', path: '/shipments/{id}', pathParams: { id } });
  }
  delete(id: string) {
    return this.ctx.http.request<null>({ method: 'DELETE', path: '/shipments/{id}', pathParams: { id } });
  }
  label(id: string, size?: 'A4' | 'A5' | '100x100') {
    return this.ctx.http.request<{ contentType: string; data: Uint8Array }>({ method: 'GET', path: '/shipments/{id}/label', pathParams: { id }, query: { size }, responseType: 'binary' });
  }
  calculate(body: { weight: number; cod?: number }) {
    return this.ctx.http.request<{ cost: number; codFee: number }>({ method: 'POST', path: '/calculate', json: body, idempotent: true });
  }
}

export class TrackingService {
  readonly namespace = 'tracking' as const;
  private ctx!: DemoContext;
  attach(ctx: DemoContext) {
    this.ctx = ctx;
  }
  byBarcode(barcode: string) {
    return this.ctx.http.request<Array<{ eventCode: string; eventDate: string }>>({ method: 'GET', path: '/tracking/{barcode}', pathParams: { barcode } });
  }
}

export class BranchesService {
  readonly namespace = 'branches' as const;
  private ctx!: DemoContext;
  attach(ctx: DemoContext) {
    this.ctx = ctx;
  }
  list(city: string, limit?: number) {
    return this.ctx.http.request<Array<{ id: string; num: string; city: string; address: string }>>({ method: 'GET', path: '/branches', query: { city, limit } });
  }
}

export function createDemoClient(options: { transport: HttpTransport; config?: DemoConfig; clock?: SimClock; retry?: RetryOptions | false }) {
  const config = options.config ?? { username: 'demo', password: 'secret' };
  const unwrap = (response: { status: number; data: unknown }) => {
    if (response.data && typeof response.data === 'object' && 'contentType' in (response.data as object)) return response.data;
    const result = unwrapEnvelope(response.data, response.status);
    if (result instanceof CarrierError) throw result;
    return result;
  };
  const mapError = (response: { status: number; data: unknown }) => {
    const error = unwrapEnvelope(response.data, response.status);
    return error instanceof CarrierError ? error : undefined;
  };
  // Token endpoints go through a client without auth, so a 401 there never recurses into login.
  const raw = createHttpClient({ carrier: 'demo', baseUrl: BASE_URL, transport: options.transport, retry: false, unwrap, mapError });
  const auth = tokenAuth({
    header: 'token',
    clock: options.clock,
    key: `demo:${config.username}`,
    login: async () => {
      const r = await raw.request<{ token: string; refreshToken: string; expiresIn: number }>({ method: 'POST', path: '/auth', json: { username: config.username, password: config.password } });
      return { accessToken: r.token, refreshToken: r.refreshToken, expiresInSec: r.expiresIn };
    },
    refresh: async refreshToken => {
      const r = await raw.request<{ token: string; refreshToken: string; expiresIn: number }>({ method: 'POST', path: '/refreshToken', json: { refreshToken } });
      return { accessToken: r.token, refreshToken: r.refreshToken, expiresInSec: r.expiresIn };
    },
  });
  const http = createHttpClient({
    carrier: 'demo',
    baseUrl: BASE_URL,
    transport: options.transport,
    auth,
    retry: options.retry ?? { sleep: options.clock?.sleep, clock: options.clock, jitter: 'none', baseDelayMs: 100 },
    unwrap,
    mapError,
  });
  return createClient<DemoContext>({ http, config }).use(new ShipmentsService()).use(new TrackingService()).use(new BranchesService());
}

// ---------- adapter (carrier package `src/adapter`) ----------

export const demoStatusMap = createStatusMapper({ '100': 'pre_transit', '200': 'pre_transit', '300': 'in_transit', '400': 'available_for_pickup', '500': 'delivered', '900': 'cancelled' });

export function createDemoAdapter(client: ReturnType<typeof createDemoClient>) {
  const party = (p: CreateShipmentInput['sender']) => ({
    name: p.contact.name ?? '',
    phone: p.contact.phone ?? '',
    branchId: p.point.type === 'location' ? p.point.locationId : '',
  });

  return defineAdapter({
    carrier: 'demo',
    capabilities: ['shipments', 'labels', 'tracking', 'cancel', 'rates', 'locations'],
    trackingPolicy: { pollingAllowed: true, maxPerCall: 1, minIntervalSec: 600 },
    async createShipment(input) {
      const weight = input.parcels.reduce((sum, p) => sum + toKg(p.weight), 0);
      const cod = input.options?.cashOnDelivery ? Number(input.options.cashOnDelivery.amount.amount) : undefined;
      const r = await client.shipments.create({ sender: party(input.sender), receiver: party(input.recipient), weight, ...(cod !== undefined ? { cod } : {}) });
      return { id: r.id, trackingNumber: r.barcode, carrier: 'demo', status: 'pre_transit', price: money(r.cost, 'UAH'), raw: r };
    },
    async getLabel(request) {
      const pdf = await client.shipments.label(request.shipmentId, request.size as 'A4' | undefined);
      return { format: 'PDF', encoding: 'binary', data: pdf.data, contentType: pdf.contentType };
    },
    async track(numbers) {
      return Promise.all(
        numbers.map(async trackingNumber => {
          try {
            const raw = await client.tracking.byBarcode(trackingNumber);
            const events: TrackingEvent[] = raw.map(e => ({ status: demoStatusMap(e.eventCode), rawCode: e.eventCode, occurredAt: e.eventDate }));
            return { trackingNumber, carrier: 'demo', status: latestStatus(events), events, found: true };
          } catch (error) {
            if (error instanceof CarrierError && error.category === CarrierErrorCategory.NotFound) {
              return { trackingNumber, carrier: 'demo', status: 'unknown' as const, events: [], found: false };
            }
            throw error;
          }
        }),
      );
    },
    async cancelShipment(id) {
      await client.shipments.delete(id);
    },
    async getRates(request) {
      const weight = request.parcels.reduce((sum, p) => sum + toKg(p.weight), 0);
      const r = await client.shipments.calculate({ weight });
      return [{ carrier: 'demo', service: 'branch-branch', total: money(r.cost, 'UAH') }];
    },
    async findLocations(query) {
      const branches = await client.branches.list(query.city ?? '', query.limit);
      return branches.map(b => ({ id: b.id, carrier: 'demo', type: 'branch' as const, name: `Branch №${b.num}`, number: b.num, address: { country: 'UA', city: b.city, lines: [b.address] } }));
    },
  });
}

export const sampleShipment: CreateShipmentInput = {
  sender: { contact: { name: 'Shop', phone: '+380501112233' }, point: { type: 'location', locationId: 'b-1' } },
  recipient: { contact: { name: 'Olena', phone: '+380671234567' }, point: { type: 'location', locationId: 'b-3' } },
  parcels: [{ weight: { value: 1.2, unit: 'kg' } }],
};
