import { defineAdapter, money } from '../src';
import type { TrackingResult } from '../src';

describe('defineAdapter with a class instance', () => {
  it('keeps prototype getters and methods named like Object.prototype members', async () => {
    class Adapter {
      readonly carrier = 'demo';
      readonly capabilities = ['tracking'] as const;
      calls = 0;
      get trackingPolicy() {
        return { maxPerCall: 5 };
      }
      async track(_numbers: string[]): Promise<TrackingResult[]> {
        this.calls += 1;
        return [];
      }
      toString() {
        return 'demo adapter';
      }
    }
    const instance = new Adapter();
    const adapter = defineAdapter(instance);
    expect(adapter.trackingPolicy).toEqual({ maxPerCall: 5 });
    expect(String(adapter)).toBe('demo adapter');
    await adapter.track(['1']);
    expect(instance.calls).toBe(1);
  });
});

describe('money from large numbers', () => {
  it('keeps every digit a double can hold', () => {
    expect(money(9007199254740992, 'UAH').amount).toBe('9007199254740992');
    expect(money(12345678901234.56, 'UAH').amount).toBe('12345678901234.56');
    expect(money(1e20, 'USD').amount).toBe('100000000000000000000');
    expect(money(1e-7, 'KWD').amount).toBe('0');
    expect(money(0.1 + 0.2, 'USD').amount).toBe('0.3');
  });
});
