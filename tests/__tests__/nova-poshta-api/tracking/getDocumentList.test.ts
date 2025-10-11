import { spec } from 'pactum';
import { getApiKey } from '../../../setup/pactum.setup';

describe('TrackingService - getDocumentList', () => {
  it('should get list of documents for a date range', async () => {
    await spec()
      .post('/')
      .withJson({
        apiKey: getApiKey(),
        modelName: 'InternetDocument',
        calledMethod: 'getDocumentList',
        methodProperties: {
          DateTimeFrom: '01.01.2024',
          DateTimeTo: '31.01.2024',
          Page: '1',
          GetFullList: '0',
        },
      })
      .expectStatus(200)
      .expectJsonMatch({
        success: true,
      })
      .inspect()
      .toss();
  });

  it('should get full document list', async () => {
    await spec()
      .post('/')
      .withJson({
        apiKey: getApiKey(),
        modelName: 'InternetDocument',
        calledMethod: 'getDocumentList',
        methodProperties: {
          DateTimeFrom: '01.01.2024',
          DateTimeTo: '31.01.2024',
          GetFullList: '1',
        },
      })
      .expectStatus(200)
      .expectJsonMatch({
        success: true,
      })
      .inspect()
      .toss();
  });

  it('should get documents by specific date', async () => {
    await spec()
      .post('/')
      .withJson({
        apiKey: getApiKey(),
        modelName: 'InternetDocument',
        calledMethod: 'getDocumentList',
        methodProperties: {
          DateTime: '15.01.2024',
          Page: '1',
        },
      })
      .expectStatus(200)
      .expectJsonMatch({
        success: true,
      })
      .inspect()
      .toss();
  });
});
