import { describe, expect, it } from 'vitest';

import { handleReferenceTool } from '../../src/tools/reference.js';
import type { ToolContext } from '../../src/types/mcp.js';

const context: ToolContext = {
  client: {
    reference: {} as any,
    tracking: {} as any,
    address: {} as any,
    waybill: {} as any,
  },
  config: {
    apiKey: 'test',
    baseUrl: 'https://example.com',
    logLevel: 'info',
    timeout: 1000,
  },
};

describe('reference tools', () => {
  it('returns payment methods payload', async () => {
    const result = await handleReferenceTool('reference_get_payment_methods', {}, context);
    expect(result.content[0]?.type).toBe('text');
    expect(result.content[0]?.text).toContain('paymentMethods');
  });
});
