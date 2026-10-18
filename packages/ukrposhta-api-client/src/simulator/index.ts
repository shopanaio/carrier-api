// code and comments in English
// Test-only entry point: depends on @shopana/carrier-testing.
import { SimClock, SimStore, combineSimulators, createSimulator, httpError, json } from '@shopana/carrier-testing';
import type { SimContext } from '@shopana/carrier-testing';
import { ukrposhtaBaseUrls } from '../config';
import type { UkrposhtaStatusEvent } from '../public/types/tracking';
import { ukrposhtaClassifierContract } from './classifierContract';
import { createUkrposhtaEcomSimulator } from './ecom';
import { ukrposhtaTrackingContract } from './trackingContract';

export { ukrposhtaTrackingContract } from './trackingContract';
export { ukrposhtaClassifierContract } from './classifierContract';
export { ukrposhtaEcomContract } from './ecomContract';
export { createUkrposhtaEcomSimulator, shipmentLifecycle } from './ecom';

export interface UkrposhtaSimulatorOptions {
  clock?: SimClock;
  state?: SimStore;
}

const UNAUTHORIZED = { code: 'UPE05001', message: 'Wrong token' };

function requireBearer(ctx: SimContext) {
  return ctx.headers.authorization?.startsWith('Bearer ') ? undefined : { status: 401, body: UNAUTHORIZED };
}

function bases(path: (b: ReturnType<typeof ukrposhtaBaseUrls>) => string): string[] {
  return [path(ukrposhtaBaseUrls('production')), path(ukrposhtaBaseUrls('sandbox'))];
}

/** Seed data of one tracked shipment: events as the status-tracking service returns them. */
export interface SeedEvent {
  event: number | string;
  eventReason_id?: number;
  eventName?: string;
  /** Defaults to the simulator clock, advancing one hour per event. */
  date?: string;
  index?: string;
  name?: string;
}

/** Simulator of the status-tracking service (`/status-tracking/0.0.1`). */
export function createUkrposhtaTrackingSimulator(options: UkrposhtaSimulatorOptions = {}) {
  const clock = options.clock ?? new SimClock();
  const state = options.state ?? new SimStore();
  const tracked = state.collection<UkrposhtaStatusEvent[]>('tracked');

  const eventsOf = (barcode: string) => {
    const events = tracked.get(barcode);
    if (!events) throw httpError(404, { code: 'UPE02002', message: `Shipment ${barcode} not found` });
    return events;
  };
  const last = (barcode: string) => eventsOf(barcode)[eventsOf(barcode).length - 1];
  const withNotFound = (barcodes: string[], pick: (events: UkrposhtaStatusEvent[]) => UkrposhtaStatusEvent[]) => {
    const found: Record<string, UkrposhtaStatusEvent[]> = {};
    const notFound: string[] = [];
    for (const barcode of barcodes) {
      const events = tracked.get(barcode);
      if (events) found[barcode] = pick(events);
      else notFound.push(barcode);
    }
    return json({ found, notFound });
  };
  const flat = (barcodes: string[], pick: (events: UkrposhtaStatusEvent[]) => UkrposhtaStatusEvent[]) =>
    json(barcodes.flatMap(barcode => (tracked.get(barcode) ? pick(tracked.get(barcode)!) : [])));
  const lastOnly = (events: UkrposhtaStatusEvent[]) => [events[events.length - 1]];
  const all = (events: UkrposhtaStatusEvent[]) => events;

  const route = (barcode: string, lang: 'EN' | 'UA') => {
    eventsOf(barcode);
    return json(
      lang === 'EN' ? { from: 'UKRAINE Kyiv', to: 'UKRAINE Lviv' } : { from: 'УКРАЇНА м.Київ', to: 'УКРАЇНА м.Львів' },
    );
  };

  const sim = createSimulator({
    contract: ukrposhtaTrackingContract,
    baseUrl: bases(b => b.statusTracking),
    clock,
    state,
    auth: requireBearer,
    invalidRequest: issues => ({
      status: 400,
      body: { code: 'UPE01002', message: issues[0]?.message ?? 'Input data validation error' },
    }),
    handlers: {
      getStatuses: ctx => json(eventsOf(String(ctx.query.barcode))),
      getLastStatus: ctx => json(last(String(ctx.query.barcode))),
      getStatusesBatch: ctx => flat(ctx.body as string[], all),
      getStatusesBatchWithNotFound: ctx => withNotFound(ctx.body as string[], all),
      getLastStatusesBatch: ctx => flat(ctx.body as string[], lastOnly),
      getLastStatusesBatchWithNotFound: ctx => withNotFound(ctx.body as string[], lastOnly),
      getLastStatusByPhone: ctx => json(last(String(ctx.query.barcode))),
      getStatusesByPhoneBatch: ctx =>
        json(
          (ctx.body as Array<{ barcode: string }>).flatMap(item =>
            tracked.get(item.barcode) ? [last(item.barcode)] : [],
          ),
        ),
      getRoute: ctx => route(String(ctx.params.barcode), 'UA'),
      getRouteInLang: ctx => route(String(ctx.params.barcode), String(ctx.params.lang).toUpperCase() as 'EN' | 'UA'),
    },
  });

  /** Registers a shipment with its events, oldest first. */
  const seed = (barcode: string, events: Array<number | string | SeedEvent>) => {
    const rows = events.map((item, index): UkrposhtaStatusEvent => {
      const e: SeedEvent = typeof item === 'object' ? item : { event: item };
      clock.advance(3_600_000);
      return {
        barcode,
        step: index + 1,
        date: e.date ?? clock.toISOString().slice(0, 19),
        index: e.index ?? '01001',
        name: e.name ?? 'KYIV 1',
        event: e.event,
        eventName: e.eventName ?? `Event ${e.event}`,
        country: 'Ukraine',
        eventReason: null,
        eventReason_id: e.eventReason_id ?? 1,
        mailType: 1048576,
        indexOrder: index + 1,
      };
    });
    tracked.upsert(barcode, rows);
    return rows;
  };

  return Object.assign(sim, { seed });
}

function distanceKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const rad = (degrees: number) => (degrees * Math.PI) / 180;
  const a =
    Math.sin(rad(lat2 - lat1) / 2) ** 2 +
    Math.cos(rad(lat1)) * Math.cos(rad(lat2)) * Math.sin(rad(lng2 - lng1) / 2) ** 2;
  return 6371 * 2 * Math.asin(Math.sqrt(a));
}

/** Simulator of the address classifier (`/address-classifier-ws`). Seed rows with `seed`. */
export function createUkrposhtaClassifierSimulator(options: UkrposhtaSimulatorOptions = {}) {
  const clock = options.clock ?? new SimClock();
  const state = options.state ?? new SimStore();
  const postOffices = state.collection<Record<string, string>>('classifier-postoffices');
  const cities = state.collection<Record<string, string>>('classifier-cities');
  const regions = state.collection<Record<string, string>>('classifier-regions');
  const courier = state.collection<{ postindex: string }>('classifier-courier');

  // Mimics the service: no hits → empty body, one hit → a bare object, several → an array.
  const entries = (rows: Array<Record<string, string>>) =>
    json(rows.length === 0 ? {} : { Entries: { Entry: rows.length === 1 ? rows[0] : rows } });
  const q = (ctx: SimContext, key: string): string | undefined => {
    const value = ctx.query[key];
    return typeof value === 'string' ? value : undefined;
  };
  const hasFilter = (ctx: SimContext) => Object.keys(ctx.query).length > 0;

  const sim = createSimulator({
    contract: ukrposhtaClassifierContract,
    baseUrl: bases(b => b.addressClassifier),
    clock,
    state,
    auth: requireBearer,
    handlers: {
      getRegions: ctx => {
        const name = q(ctx, 'region_name');
        return entries(regions.filter(r => !name || r.REGION_UA.startsWith(name)));
      },
      getCities: ctx => {
        if (!hasFilter(ctx)) return entries([]);
        const name = q(ctx, 'city_ua');
        const region = q(ctx, 'region_id');
        return entries(
          cities.filter(c => (!name || c.CITY_UA.startsWith(name)) && (!region || c.REGION_ID === region)),
        );
      },
      getPostOffices: ctx => {
        if (!hasFilter(ctx)) return entries([]);
        const pi = q(ctx, 'pi');
        const pc = q(ctx, 'pc');
        const city = q(ctx, 'poCityId');
        return entries(
          postOffices.filter(
            o => (!pi || o.POSTINDEX === pi) && (!pc || o.POSTCODE === pc) && (!city || o.POCITY_ID === city),
          ),
        );
      },
      getNearestPostOffices: ctx => {
        const lat = Number(q(ctx, 'lat'));
        const lng = Number(q(ctx, 'long'));
        const maxKm = Number(q(ctx, 'maxdistance'));
        const near = postOffices
          .list()
          .map(office => ({ office, km: distanceKm(lat, lng, Number(office.LATTITUDE), Number(office.LONGITUDE)) }))
          .filter(item => Number.isFinite(item.km) && item.km <= maxKm)
          .sort((a, b) => a.km - b.km);
        return entries(
          near.map(({ office, km }) => ({
            CITYNAME: office.CITY_UA ?? '',
            DISTANCE: String(Math.round(km)),
            POSTCODE: office.POSTCODE ?? '',
            LONGITUDE: office.LONGITUDE ?? '',
            ADDRESS: office.ADDRESS ?? '',
            POSTINDEX: office.POSTINDEX ?? '',
            ID: office.ID ?? '',
            LATITUDE: office.LATTITUDE ?? '',
            POSTFILIALNAME: office.PO_SHORT ?? '',
          })),
        );
      },
      getCityDetailsByPostcode: ctx => {
        const postcode = q(ctx, 'postcode');
        return entries(
          cities
            .filter(city => city.POSTCODE === postcode)
            .map(city => ({
              REGION_ID: city.REGION_ID ?? '',
              POSTCODE: city.POSTCODE ?? '',
              DISTRICT_ID: city.DISTRICT_ID ?? '',
              CITY_ID: city.CITY_ID ?? '',
              REGION_NAME: city.REGION_UA ?? '',
              DISTRICT_NAME: city.DISTRICT_UA ?? '',
              CITY_NAME: city.CITY_UA ?? '',
              CITYTYPE_NAME: 'м.',
            })),
        );
      },
      isCourierArea: ctx => {
        const postindex = String(ctx.query.postindex);
        return entries([{ IS_COURIERAREA: courier.has(postindex) ? '1' : '0', postindex }]);
      },
    },
  });

  return Object.assign(sim, {
    seedRegion: (row: Record<string, string>) => regions.upsert(row.REGION_ID, row),
    seedCity: (row: Record<string, string>) => cities.upsert(row.CITY_ID, row),
    seedPostOffice: (row: Record<string, string>) => postOffices.upsert(row.ID, row),
    seedCourierArea: (postindex: string) => courier.upsert(postindex, { postindex }),
  });
}

/** Tracking and classifier simulators behind one transport, sharing a store and clock. */
export function createUkrposhtaPublicSimulator(options: UkrposhtaSimulatorOptions = {}) {
  const clock = options.clock ?? new SimClock();
  const state = options.state ?? new SimStore();
  const tracking = createUkrposhtaTrackingSimulator({ clock, state });
  const classifier = createUkrposhtaClassifierSimulator({ clock, state });
  return { clock, state, tracking, classifier, transport: combineSimulators(tracking, classifier) };
}

/**
 * The whole Ukrposhta API behind one transport: eCom and forms, status tracking, address classifier.
 * They share one store and clock, so `advance` on a shipment shows up in status tracking.
 */
export function createUkrposhtaSimulator(options: UkrposhtaSimulatorOptions = {}) {
  const clock = options.clock ?? new SimClock();
  const state = options.state ?? new SimStore();
  const tracking = createUkrposhtaTrackingSimulator({ clock, state });
  const classifier = createUkrposhtaClassifierSimulator({ clock, state });
  const ecom = createUkrposhtaEcomSimulator({ clock, state });
  return {
    clock,
    state,
    ecom,
    tracking,
    classifier,
    transport: combineSimulators(ecom, tracking, classifier),
    /** Moves a shipment (uuid or barcode) through its lifecycle, one tracking event per step. */
    advance: ecom.advance,
    advanceCourierOrder: ecom.advanceCourierOrder,
  };
}
