// code and comments in English
import type { Middleware } from '../http/pipeline';

/**
 * Overall deadline for one logical call, retries and rate-limit waits included.
 * The per-attempt limit is `HttpRequest.timeoutMs`, enforced by the transport.
 */
export function timeout(ms: number): Middleware {
  return async (request, next) => {
    const controller = new AbortController();
    const parent = request.signal;
    const onParentAbort = () => controller.abort(parent?.reason);
    if (parent?.aborted) onParentAbort();
    else parent?.addEventListener('abort', onParentAbort, { once: true });

    let timer: ReturnType<typeof setTimeout> | undefined;
    const deadline = new Promise<never>((_, reject) => {
      timer = setTimeout(() => {
        const error = new Error(`Request timed out after ${ms} ms`);
        error.name = 'TimeoutError';
        controller.abort(error);
        reject(error);
      }, ms);
    });

    try {
      return await Promise.race([next({ ...request, signal: controller.signal }), deadline]);
    } finally {
      clearTimeout(timer);
      parent?.removeEventListener('abort', onParentAbort);
    }
  };
}
