import { createHttpClient } from '@shopana/carrier-core';
import { createSimulator, defineContract, json } from '../src';

const contract = defineContract({
  name: 'timeouts',
  baseUrl: 'https://api.test',
  operations: [
    { id: 'get', method: 'GET', path: '/a' },
    { id: 'item', method: 'GET', path: '/items/{id}' },
  ],
});

const client = (transport: ReturnType<typeof createSimulator>['transport']) =>
  createHttpClient({ carrier: 'timeouts', baseUrl: 'https://api.test', transport, retry: false });

describe('per-attempt timeoutMs in the simulator', () => {
  it('times out a hung fault like the fetch transport would', async () => {
    const sim = createSimulator({ contract, handlers: { get: () => json({}) } });
    sim.fail({ operation: 'get', hang: true });
    await expect(client(sim.transport).request({ method: 'GET', path: '/a', timeoutMs: 20 })).rejects.toMatchObject({
      code: 'TIMEOUT',
      retryable: true,
    });
  });

  it('times out a slow handler that ignores the signal', async () => {
    const sim = createSimulator({
      contract,
      handlers: { get: () => new Promise(resolve => setTimeout(() => resolve(json({})), 200)) },
    });
    await expect(client(sim.transport).request({ method: 'GET', path: '/a', timeoutMs: 20 })).rejects.toMatchObject({
      code: 'TIMEOUT',
    });
  });

  it('answers normally within timeoutMs', async () => {
    const sim = createSimulator({ contract, handlers: { get: () => json({ ok: true }) } });
    expect(await client(sim.transport).request({ method: 'GET', path: '/a', timeoutMs: 1_000 })).toEqual({ ok: true });
  });

  it('stops a fault delay right away when the request was already aborted', async () => {
    const sim = createSimulator({ contract, handlers: { get: () => json({}) } });
    sim.fail({ operation: 'get', delayMs: 10_000 });
    const controller = new AbortController();
    controller.abort();
    const started = Date.now();
    await expect(
      client(sim.transport).request({ method: 'GET', path: '/a', signal: controller.signal }),
    ).rejects.toMatchObject({ code: 'ABORTED' });
    expect(Date.now() - started).toBeLessThan(1_000);
  });
});

describe('malformed percent-encoding in a path', () => {
  it('reaches the handler as is instead of throwing URIError', async () => {
    const sim = createSimulator({ contract, handlers: { item: ctx => json({ id: ctx.params.id }) } });
    expect(await client(sim.transport).request({ method: 'GET', path: '/items/%E0%A4%A' })).toEqual({ id: '%E0%A4%A' });
  });
});
