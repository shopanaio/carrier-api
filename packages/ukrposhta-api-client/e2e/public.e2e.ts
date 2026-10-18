import { createUkrposhtaClassifierClient, createUkrposhtaTrackingClient } from '../src';
import { describeIf, env, transport } from './env';

describeIf(env.trackingBearer && env.knownBarcode)('Ukrposhta: status tracking', () => {
  const client = createUkrposhtaTrackingClient({
    transport,
    bearer: env.trackingBearer!,
    ...(env.trackingBaseUrl ? { baseUrl: env.trackingBaseUrl } : {}),
  });

  it('reads the statuses of a known barcode', async () => {
    const events = await client.tracking.getStatuses(env.knownBarcode!);
    expect(events.length).toBeGreaterThan(0);
    expect(events[0]!.barcode).toBe(env.knownBarcode);
  });
});

describeIf(env.bearer)('Ukrposhta: address classifier', () => {
  const client = createUkrposhtaClassifierClient({
    transport,
    bearer: env.bearer!,
    ...(env.classifierBaseUrl ? { baseUrl: env.classifierBaseUrl } : {}),
  });

  it('finds the post office 01001', async () => {
    const offices = await client.classifier.getPostOffices({ postIndex: '01001' });
    expect(offices.map(office => office.POSTINDEX)).toContain('01001');
  });
});
