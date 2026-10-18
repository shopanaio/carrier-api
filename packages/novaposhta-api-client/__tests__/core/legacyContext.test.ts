import { createClient, AddressService, createNovaPoshtaClient } from '../../src';

const baseUrl = 'https://api.novaposhta.ua/v2.0/json/';

describe('0.x client construction', () => {
  it('sends the API key, system and URL through a function-style transport', async () => {
    const transport = jest.fn().mockResolvedValue({ status: 200, data: { success: true, data: [] } });
    const client = createClient({ transport, baseUrl, apiKey: 'key', system: 'DevCentre' }).use(new AddressService());

    await client.address.getCities({});

    expect(transport).toHaveBeenCalledTimes(1);
    expect(transport.mock.calls[0][0].url).toBe(baseUrl);
    expect(transport.mock.calls[0][0].body).toMatchObject({ apiKey: 'key', system: 'DevCentre' });
  });

  it('returns the body of a non-2xx response and does not retry it', async () => {
    const body = { success: false, data: [], errors: ['Server error'], errorCodes: ['1'] };
    const transport = jest.fn().mockResolvedValue({ status: 500, data: body });
    const client = createClient({ transport, baseUrl, rateLimitRetry: { delayMs: 0 } }).use(new AddressService());

    await expect(client.address.getCities({})).resolves.toMatchObject({ success: false, errors: ['Server error'] });
    expect(transport).toHaveBeenCalledTimes(1);
  });

  it('keeps the new construction working next to the old one', () => {
    expect(createNovaPoshtaClient({ apiKey: 'key' }).address).toBeDefined();
  });
});
