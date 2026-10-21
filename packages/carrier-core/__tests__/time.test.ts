import { sleep, systemClock, assertPositiveNumber } from '../src';

describe('sleep', () => {
  it('resolves after the delay', async () => {
    const start = Date.now();
    await sleep(5);
    expect(Date.now() - start).toBeGreaterThanOrEqual(4);
    expect(Math.abs(systemClock.now() - Date.now())).toBeLessThan(50);
  });

  it('rejects when aborted before or during the wait', async () => {
    const pre = new AbortController();
    pre.abort(new Error('pre'));
    await expect(sleep(1000, pre.signal)).rejects.toThrow('pre');

    const during = new AbortController();
    const pending = sleep(1000, during.signal);
    during.abort();
    await expect(pending).rejects.toMatchObject({ name: 'AbortError' });
  });

  it('validates positive numbers', () => {
    expect(() => assertPositiveNumber(-1, 'x')).toThrow('x must be a finite positive number');
  });
});
