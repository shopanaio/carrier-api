import type { CallToolResult } from '@modelcontextprotocol/sdk/types.js';

export function createTextResult(
  message: string,
  structuredContent?: Record<string, unknown>,
): CallToolResult {
  return {
    content: [
      {
        type: 'text',
        text: message,
      },
    ],
    ...(structuredContent ? { structuredContent } : {}),
  };
}

export function formatAsJson(input: unknown): string {
  return JSON.stringify(input, null, 2);
}
