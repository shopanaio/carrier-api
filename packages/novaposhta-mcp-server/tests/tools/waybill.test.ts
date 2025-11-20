import { describe, expect, it, vi } from 'vitest';

import { getWaybillTools, handleWaybillTool } from '../../src/tools/waybill.js';
import type { ToolContext } from '../../src/types/mcp.js';

const context: ToolContext = {
  client: {
    waybill: {
      getPrice: vi.fn(),
      getDeliveryDate: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    tracking: {} as any,
    address: {} as any,
    reference: {} as any,
  },
  config: {
    apiKey: 'test',
    baseUrl: 'https://example.com',
    logLevel: 'info',
    timeout: 1000,
  },
};

describe('waybill tools', () => {
  it('exposes five waybill tools', () => {
    expect(getWaybillTools()).toHaveLength(5);
  });

  it('requires document refs for delete tool', async () => {
    const result = await handleWaybillTool('waybill_delete', { documentRefs: [] }, context);
    expect(result.isError).toBe(true);
  });
});
