import {
  createStatusMapper,
  currencyDecimals,
  defineAdapter,
  fromCm,
  fromKg,
  hasCapability,
  isFinalTrackingStatus,
  isTrackingStatus,
  latestStatus,
  money,
  moneyToNumber,
  toCm,
  toKg,
  volumetricWeightKg,
} from '../src';
import type { CarrierAdapter, TrackingResult } from '../src';

describe('units', () => {
  it('converts weights and dimensions to canonical kg/cm and back', () => {
    expect(toKg({ value: 2, unit: 'lb' })).toBe(0.907185);
    expect(toKg({ value: 500, unit: 'g' })).toBe(0.5);
    expect(toKg({ value: 16, unit: 'oz' })).toBe(0.453592);
    expect(fromKg(1, 'lb')).toBe(2.204623);
    expect(toCm({ length: 10, width: 5, height: 1, unit: 'in' })).toEqual({ length: 25.4, width: 12.7, height: 2.54 });
    expect(toCm({ length: 1, width: 0.5, height: 100, unit: 'm' })).toEqual({ length: 100, width: 50, height: 10000 });
    expect(fromCm(25.4, 'in')).toBe(10);
    expect(volumetricWeightKg({ length: 50, width: 40, height: 30, unit: 'cm' })).toBe(12);
    expect(volumetricWeightKg({ length: 500, width: 400, height: 300, unit: 'mm' }, 4000)).toBe(15);
  });
});

describe('money', () => {
  it('normalises decimal strings and numbers', () => {
    expect(money(12.345, 'UAH')).toEqual({ amount: '12.35', currency: 'UAH' });
    expect(money(' 10,50 ', 'UAH')).toEqual({ amount: '10.5', currency: 'UAH' });
    expect(moneyToNumber(money('99.90', 'EUR'))).toBe(99.9);
  });

  it('rejects invalid amounts and currencies', () => {
    expect(() => money('abc', 'UAH')).toThrow('Invalid money amount');
    expect(() => money(Number.NaN, 'UAH')).toThrow('Invalid money amount');
    expect(() => money(1, 'uah')).toThrow('Invalid ISO 4217 currency');
  });
});

describe('status mapping', () => {
  const map = createStatusMapper({ '10100': 'pre_transit', '41000': 'delivered', '2*': 'in_transit', '217*': 'available_for_pickup' });

  it('maps exact codes, longest prefixes, and falls back to unknown', () => {
    expect(map('10100')).toBe('pre_transit');
    expect(map(41000)).toBe('delivered');
    expect(map('20700')).toBe('in_transit');
    expect(map('21700')).toBe('available_for_pickup');
    expect(map('99999')).toBe('unknown');
    expect(createStatusMapper({}, 'exception')('x')).toBe('exception');
    expect(map.table['10100']).toBe('pre_transit');
  });

  it('knows the normalized set and final statuses', () => {
    expect(isTrackingStatus('delivered')).toBe(true);
    expect(isTrackingStatus('lost')).toBe(false);
    expect(isFinalTrackingStatus('returned')).toBe(true);
    expect(isFinalTrackingStatus('in_transit')).toBe(false);
  });

  it('picks the latest event status', () => {
    expect(latestStatus([])).toBe('unknown');
    expect(
      latestStatus([
        { status: 'delivered', occurredAt: '2026-10-03T10:00:00Z' },
        { status: 'pre_transit', occurredAt: '2026-10-01T10:00:00Z' },
      ]),
    ).toBe('delivered');
  });
});

describe('adapters', () => {
  const track = async (numbers: string[]): Promise<TrackingResult[]> =>
    numbers.map(trackingNumber => ({ trackingNumber, carrier: 'demo', status: 'unknown', events: [], found: false }));

  it('defineAdapter builds a typed adapter and validates declared capabilities', async () => {
    const adapter: CarrierAdapter<'tracking'> = defineAdapter({ carrier: 'demo', capabilities: ['tracking'], track, trackingPolicy: { pollingAllowed: true, maxPerCall: 100 } });
    expect(adapter.capabilities.has('tracking')).toBe(true);
    expect(await adapter.track(['1'])).toHaveLength(1);

    expect(() => defineAdapter({ carrier: 'broken', capabilities: ['labels'] } as never)).toThrow('declares "labels" but has no getLabel()');
  });

  it('hasCapability narrows by declaration and methods', () => {
    const adapter = defineAdapter({ carrier: 'demo', capabilities: ['tracking'], track }) as CarrierAdapter;
    expect(hasCapability(adapter, 'tracking')).toBe(true);
    expect(hasCapability(adapter, 'labels')).toBe(false);
    const lying = { carrier: 'x', capabilities: new Set(['labels'] as const) };
    expect(hasCapability(lying as never, 'labels')).toBe(false);
  });
});

describe('money minor units and defineAdapter guards', () => {
  it('rounds numbers to the currency minor units', () => {
    expect(money(1.2345, 'KWD').amount).toBe('1.235');
    expect(money(1234.5, 'JPY').amount).toBe('1235');
    expect(money(10.5, 'UAH').amount).toBe('10.5');
    expect(money(10.499, 'UAH').amount).toBe('10.5');
    expect(money(-0.001, 'USD').amount).toBe('0');
    expect(money(25, 'EUR').amount).toBe('25');
    expect(() => money(1e21, 'USD')).toThrow(TypeError);
    expect(currencyDecimals('BHD')).toBe(3);
    expect(currencyDecimals('UAH')).toBe(2);
  });

  it('names an unknown capability instead of crashing', () => {
    expect(() => defineAdapter({ carrier: 'x', capabilities: ['teleport' as never] } as never)).toThrow('declares unknown capability "teleport"');
    expect(hasCapability({ carrier: 'x', capabilities: new Set(['teleport' as never]) }, 'teleport' as never)).toBe(false);
    expect(hasCapability({ carrier: 'x', capabilities: new Set(['toString' as never]) }, 'toString' as never)).toBe(false);
    expect(() => defineAdapter({ carrier: 'x', capabilities: ['toString' as never] } as never)).toThrow('unknown capability');
  });
});

describe('review fixes', () => {
  it('rounds half away from zero for numbers and strings alike', () => {
    expect(money(1.005, 'UAH').amount).toBe('1.01');
    expect(money('1.005', 'UAH').amount).toBe('1.01');
    expect(money(-1.5, 'JPY').amount).toBe('-2');
    expect(money('-1.5', 'JPY').amount).toBe('-2');
    expect(money(-1.005, 'UAH').amount).toBe('-1.01');
    expect(money(2.675, 'USD').amount).toBe('2.68');
    expect(money('9.999', 'UAH').amount).toBe('10');
    expect(money('-0.004', 'UAH').amount).toBe('0');
    expect(money('007.50', 'EUR').amount).toBe('7.5');
    expect(money('0.0004', 'KWD').amount).toBe('0');
    expect(money(0.1 + 0.2, 'EUR').amount).toBe('0.3');
    expect(money('10.50', 'UAH')).toEqual(money(10.5, 'UAH'));
    expect(money(1e-7, 'USD').amount).toBe('0');
    expect(money(9e20, 'CLF').amount).toBe('900000000000000000000');
  });

  it('defineAdapter accepts class instances and keeps prototype methods', async () => {
    class DemoAdapter {
      readonly carrier = 'demo';
      readonly capabilities = ['tracking'] as const;
      #prefix = 'T:';
      async track(numbers: string[]) {
        return numbers.map(n => ({ trackingNumber: this.#prefix + n })) as never;
      }
    }
    const adapter = defineAdapter(new DemoAdapter() as never) as unknown as CarrierAdapter<'tracking'>;
    expect(adapter.capabilities.has('tracking')).toBe(true);
    expect(await adapter.track(['1'])).toEqual([{ trackingNumber: 'T:1' }]);
    expect(hasCapability(adapter as CarrierAdapter, 'tracking')).toBe(true);

    class Missing {
      readonly carrier = 'm';
      readonly capabilities = ['labels'];
    }
    expect(() => defineAdapter(new Missing() as never)).toThrow('has no getLabel()');
  });
});
