// code and comments in English
// Contract of the status-tracking service (Status tracking API of 10.03.2025). Keep raw specs in contracts/.
import { defineContract } from '@shopana/carrier-testing';
import { ukrposhtaBaseUrls } from '../config';

const error = { $ref: '#/components/schemas/Error' };
const errors = { '400': { schema: error }, '401': { schema: error }, '404': { schema: error } };
const barcodeList = {
  kind: 'json' as const,
  required: true,
  schema: { type: 'array', minItems: 1, items: { type: 'string' } },
};
const lang = { lang: { type: 'string', enum: ['en', 'ua', 'EN', 'UA'] } };

export const ukrposhtaTrackingContract = defineContract({
  name: 'ukrposhta-status-tracking',
  baseUrl: ukrposhtaBaseUrls('production').statusTracking,
  components: {
    schemas: {
      Error: {
        type: 'object',
        required: ['message'],
        properties: { code: { type: 'string' }, message: { type: 'string' } },
      },
      Status: {
        type: 'object',
        required: ['barcode', 'step', 'date', 'event'],
        properties: {
          barcode: { type: 'string' },
          step: { type: 'integer' },
          date: { type: 'string' },
          index: { type: ['string', 'null'] },
          name: { type: ['string', 'null'] },
          event: { type: ['integer', 'string'] },
          eventName: { type: ['string', 'null'] },
          country: { type: ['string', 'null'] },
          eventReason: { type: ['string', 'null'] },
          eventReason_id: { type: ['integer', 'null'] },
          mailType: { type: ['integer', 'null'] },
          indexOrder: { type: ['integer', 'null'] },
        },
      },
      StatusList: { type: 'array', items: { $ref: '#/components/schemas/Status' } },
      WithNotFound: {
        type: 'object',
        required: ['found', 'notFound'],
        properties: {
          found: { type: 'object', additionalProperties: { $ref: '#/components/schemas/StatusList' } },
          notFound: { type: 'array', items: { type: 'string' } },
        },
      },
    },
  },
  operations: [
    {
      id: 'getStatuses',
      method: 'GET',
      path: '/statuses',
      params: {
        query: {
          type: 'object',
          required: ['barcode'],
          properties: { barcode: { type: 'string', minLength: 1 }, ...lang },
        },
      },
      responses: { '200': { schema: { $ref: '#/components/schemas/StatusList' } }, ...errors },
    },
    {
      id: 'getLastStatus',
      method: 'GET',
      path: '/statuses/last',
      params: {
        query: {
          type: 'object',
          required: ['barcode'],
          properties: { barcode: { type: 'string', minLength: 1 }, ...lang },
        },
      },
      responses: { '200': { schema: { $ref: '#/components/schemas/Status' } }, ...errors },
    },
    {
      id: 'getStatusesBatch',
      method: 'POST',
      path: '/statuses',
      params: { query: { type: 'object', properties: lang } },
      requestBody: { ...barcodeList, schema: { ...barcodeList.schema, maxItems: 50 } },
      responses: { '200': { schema: { $ref: '#/components/schemas/StatusList' } }, ...errors },
    },
    {
      id: 'getStatusesBatchWithNotFound',
      method: 'POST',
      path: '/statuses/with-not-found',
      params: { query: { type: 'object', properties: lang } },
      requestBody: { ...barcodeList, schema: { ...barcodeList.schema, maxItems: 50 } },
      responses: { '200': { schema: { $ref: '#/components/schemas/WithNotFound' } }, ...errors },
    },
    {
      id: 'getLastStatusesBatch',
      method: 'POST',
      path: '/statuses/last',
      params: { query: { type: 'object', properties: lang } },
      requestBody: { ...barcodeList, schema: { ...barcodeList.schema, maxItems: 100 } },
      responses: { '200': { schema: { $ref: '#/components/schemas/StatusList' } }, ...errors },
    },
    {
      id: 'getLastStatusesBatchWithNotFound',
      method: 'POST',
      path: '/statuses/last/with-not-found',
      params: { query: { type: 'object', properties: lang } },
      requestBody: { ...barcodeList, schema: { ...barcodeList.schema, maxItems: 100 } },
      responses: { '200': { schema: { $ref: '#/components/schemas/WithNotFound' } }, ...errors },
    },
    {
      id: 'getLastStatusByPhone',
      method: 'GET',
      path: '/extra-statuses/last',
      params: {
        query: {
          type: 'object',
          required: ['barcode', 'recipientPhoneNumber'],
          properties: {
            barcode: { type: 'string', minLength: 1 },
            recipientPhoneNumber: { type: 'string', minLength: 1 },
          },
        },
      },
      responses: { '200': { schema: { $ref: '#/components/schemas/Status' } }, ...errors },
    },
    {
      id: 'getStatusesByPhoneBatch',
      method: 'POST',
      path: '/extra-statuses/last',
      requestBody: {
        kind: 'json',
        required: true,
        schema: {
          type: 'array',
          minItems: 1,
          items: {
            type: 'object',
            required: ['barcode', 'recipientPhoneNumber'],
            properties: { barcode: { type: 'string' }, recipientPhoneNumber: { type: 'string' } },
          },
        },
      },
      responses: { '200': { schema: { $ref: '#/components/schemas/StatusList' } }, ...errors },
    },
    {
      id: 'getRoute',
      method: 'GET',
      path: '/barcodes/{barcode}/route',
      params: { path: { type: 'object', properties: { barcode: { type: 'string' } } } },
      responses: {
        '200': {
          schema: {
            type: 'object',
            required: ['from', 'to'],
            properties: { from: { type: 'string' }, to: { type: 'string' } },
          },
        },
        ...errors,
      },
    },
    {
      id: 'getRouteInLang',
      method: 'GET',
      path: '/barcodes/{barcode}/route/in-lang/{lang}',
      params: {
        path: {
          type: 'object',
          properties: { barcode: { type: 'string' }, lang: { type: 'string', enum: ['EN', 'UA'] } },
        },
      },
      responses: {
        '200': {
          schema: {
            type: 'object',
            required: ['from', 'to'],
            properties: { from: { type: 'string' }, to: { type: 'string' } },
          },
        },
        ...errors,
      },
    },
  ],
});
