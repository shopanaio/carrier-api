// code and comments in English
// Contract of the Demo Post API used by the simulator. Keep raw carrier specs in contracts/.
import { defineContract } from '@shopana/carrier-testing';

export const demoPostContract = defineContract({
  name: 'demo-post',
  baseUrl: 'https://api.demo-post.example/v1',
  components: {
    schemas: {
      Error: {
        type: 'object',
        required: ['code', 'message'],
        properties: {
          code: {
            type: 'string',
          },
          message: {
            type: 'string',
          },
          field: {
            type: 'string',
          },
        },
      },
    },
  },
  operations: [
    {
      id: 'getTracking',
      method: 'GET',
      path: '/tracking/{trackingNumber}',
      params: {
        path: {
          type: 'object',
          properties: {
            trackingNumber: {
              type: 'string',
              minLength: 1,
            },
          },
        },
      },
      responses: {
        '200': {
          schema: {
            type: 'array',
            items: {
              type: 'object',
              required: ['code', 'date'],
              properties: {
                code: {
                  type: 'string',
                },
                description: {
                  type: 'string',
                },
                date: {
                  type: 'string',
                  format: 'date-time',
                },
              },
            },
          },
        },
        '400': {
          schema: {
            $ref: '#/components/schemas/Error',
          },
        },
        '401': {
          schema: {
            $ref: '#/components/schemas/Error',
          },
        },
        '404': {
          schema: {
            $ref: '#/components/schemas/Error',
          },
        },
      },
    },
  ],
});
