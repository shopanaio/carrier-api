/**
 * Helper to skip tests that require a real API key
 */
export const skipIfNoApiKey = () => {
  const hasApiKey = !!process.env.NP_API_KEY;
  return hasApiKey ? describe : describe.skip;
};

/**
 * Helper to conditionally run test if API key is present
 */
export const itWithApiKey = (name: string, fn: jest.ProvidesCallback, timeout?: number) => {
  const hasApiKey = !!process.env.NP_API_KEY;
  if (hasApiKey) {
    return it(name, fn, timeout);
  } else {
    return it.skip(name, fn, timeout);
  }
};
