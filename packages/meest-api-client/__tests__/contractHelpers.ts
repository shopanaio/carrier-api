import { createMeestContractClient } from '../src';
import type { MeestContractConfig } from '../src';
import { FakeClock, mockTransport } from './mock';
import type { Call, Reply } from './mock';

export const BASE = 'https://api.meest.com/v3.0/openAPI';

export const ok = (result: unknown): Reply => ({
  data: { status: 'OK', info: { fieldName: '', message: '', messageDetails: '' }, result },
});
export const fail = (status: number, fieldName: string, message: string): Reply => ({
  status,
  data: { status: 'Error', info: { fieldName, message, messageDetails: '' }, result: null },
});

export interface Harness {
  /** Answers for everything except /auth and /refreshToken, which the harness serves. */
  handler?: (call: Call, index: number) => Reply | Promise<Reply>;
  ttlSec?: number;
  client?: Partial<MeestContractConfig>;
}

export function makeContract(options: Harness = {}) {
  const clock = new FakeClock();
  let tokenSeq = 0;
  const validRefresh = new Set<string>();
  const mock = mockTransport(BASE, async (call, index) => {
    if (call.path === '/auth') {
      const body = call.body as { username: string; password: string };
      if (body.username !== 'user' || body.password !== 'pass') return fail(401, 'password', 'Wrong login or password');
      tokenSeq += 1;
      validRefresh.add(`ref-${tokenSeq}`);
      return ok({ token: `tok-${tokenSeq}`, refresh_token: `ref-${tokenSeq}`, expiresIn: options.ttlSec ?? 86_400 });
    }
    if (call.path === '/refreshToken') {
      const { refreshToken } = call.body as { refreshToken: string };
      if (!validRefresh.delete(refreshToken)) return fail(401, 'refreshToken', 'Refresh token is invalid');
      tokenSeq += 1;
      validRefresh.add(`ref-${tokenSeq}`);
      return ok({ token: `tok-${tokenSeq}`, refresh_token: `ref-${tokenSeq}`, expiresIn: options.ttlSec ?? 86_400 });
    }
    return options.handler ? options.handler(call, index) : ok([]);
  });
  const client = createMeestContractClient({
    username: 'user',
    password: 'pass',
    transport: mock.transport,
    clock,
    sleep: clock.sleep,
    ...options.client,
  });
  const apiCalls = () => mock.calls.filter(c => c.path !== '/auth' && c.path !== '/refreshToken');
  return {
    ...mock,
    client,
    clock,
    apiCalls,
    tokenCalls: (path: '/auth' | '/refreshToken') => mock.calls.filter(c => c.path === path),
  };
}

export const rejection = async (p: Promise<unknown>) => {
  try {
    await p;
  } catch (e) {
    return e as Error & Record<string, unknown>;
  }
  throw new Error('expected rejection');
};
