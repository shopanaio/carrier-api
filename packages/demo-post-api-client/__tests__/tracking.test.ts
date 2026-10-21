import { runAdapterConformance, SimClock } from '@shopana/carrier-testing';
import { createDemoPostAdapter } from '../src/adapter';
import { createDemoPostContractClient, TrackingService } from '../src/contract';
import { createDemoPostSimulator } from '../src/simulator';

function setup() {
  const clock = new SimClock();
  const sim = createDemoPostSimulator({ clock });
  const client = createDemoPostContractClient({
    transport: sim.transport,
    apiKey: 'test-key',
    retry: { sleep: clock.sleep, clock },
  }).use(new TrackingService());
  return { sim, client, adapter: createDemoPostAdapter(client) };
}

describe('Demo Post tracking', () => {
  it('reads events through the contract client', async () => {
    const { sim, client } = setup();
    sim.seed('TN1', ['CREATED', 'IN_TRANSIT']);
    const events = await client.tracking.getEvents('TN1');
    expect(events.map(e => e.code)).toEqual(['CREATED', 'IN_TRANSIT']);
    expect(sim.calls[0]!.headers.authorization).toBe('Bearer test-key');
  });

  it('maps unknown numbers and retries 5xx', async () => {
    const { sim, adapter } = setup();
    sim.seed('TN1', ['CREATED', 'DELIVERED']);
    sim.fail({ operation: 'getTracking', status: 503 });
    const [found, missing] = await adapter.track(['TN1', 'NOPE']);
    expect(found).toMatchObject({ status: 'delivered', found: true });
    expect(missing).toMatchObject({ status: 'unknown', found: false });
  });
});

runAdapterConformance('Demo Post', () => {
  const { sim, adapter } = setup();
  sim.seed('TN1', ['CREATED']);
  return { adapter, scenario: { unknownTrackingNumber: 'NOPE' } };
});
