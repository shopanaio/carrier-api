import * as pactum from 'pactum';

beforeAll(() => {
  pactum.request.setBaseUrl('https://api.novaposhta.ua/v2.0/json/');
  pactum.request.setDefaultTimeout(10000);
  pactum.settings.setLogLevel('DEBUG');
});

afterAll(() => {});

export const getApiKey = (): string => {
  return process.env.NOVA_POSHTA_API_KEY || '';
};
