// code and comments in English
import type { BinaryData, HttpMethod, HttpRequest, HttpResponse, HttpTransport } from '@shopana/carrier-core';
import { abortReason, attemptSignal, sleep as realSleep } from '@shopana/carrier-core';
import type { ApiContract, OperationContract } from './contract';
import { SimClock } from './clock';
import type { SimResponse } from './responses';
import { SimHttpError, SimulatorError } from './responses';
import { SimStore } from './store';
import type { ValidationIssue } from './validation';
import { ContractValidator } from './validation';

export type SimQuery = Record<string, string | string[]>;

/** Everything a handler sees about one incoming request. */
export interface SimContext<TState = SimStore> {
  operation: OperationContract;
  method: HttpMethod;
  /** Path relative to the base URL, without query. */
  path: string;
  /** Path parameters, coerced to the contract's types. */
  params: Record<string, unknown>;
  /** Query parameters, coerced to the contract's types. */
  query: Record<string, unknown>;
  /** Lower-cased header names. */
  headers: Record<string, string>;
  /** JSON value, form record, text string or bytes, depending on the request body kind. */
  body: unknown;
  request: HttpRequest;
  state: TState;
  clock: SimClock;
}

export type SimHandler<TState = SimStore> = (ctx: SimContext<TState>) => SimResponse | Promise<SimResponse>;

export interface SimRateLimit<TState = SimStore> {
  limit: number;
  windowMs: number;
  /** Bucket key (per user/token). Default: one bucket for everything. */
  key?: (ctx: SimContext<TState>) => string;
  /** Carrier-specific 429 body. */
  response?: (retryAfterSec: number) => SimResponse;
}

export interface SimulatorOptions<TState = SimStore> {
  contract: ApiContract;
  handlers: Partial<Record<string, SimHandler<TState>>>;
  /** Base URL(s) this simulator answers for. Default: `contract.baseUrl`. */
  baseUrl?: string | string[];
  /** Return a response to reject the request before validation (missing/invalid credentials). */
  auth?: (ctx: SimContext<TState>) => SimResponse | undefined | Promise<SimResponse | undefined>;
  /** Carrier-shaped answer to a request that breaks the contract (Ukrposhta `UPE01002`, Meest `status: Error`). */
  invalidRequest?: (issues: ValidationIssue[], ctx: SimContext<TState>) => SimResponse;
  rateLimit?: SimRateLimit<TState>;
  /** Share state between simulators of one carrier. Default: a fresh SimStore. */
  state?: TState;
  clock?: SimClock;
  /** Throw (fail the test) on routes missing from the contract. Default true; false answers 404. */
  strictRoutes?: boolean;
  /**
   * Throw when a route answers with a status its `responses` do not declare (no `default` entry).
   * Default true; `false` lets undeclared statuses pass unchecked. Routes without `responses` are never checked.
   */
  strictResponses?: boolean;
  /** Real-time sleep used for fault `delayMs`. Default setTimeout; pass `clock.sleep` to make delays virtual. */
  sleep?: (ms: number, signal?: AbortSignal) => Promise<void>;
}

export interface SimCall {
  operationId?: string;
  method: HttpMethod;
  url: string;
  path: string;
  query: SimQuery;
  headers: Record<string, string>;
  body: unknown;
  status?: number;
  /** Why the simulator answered as it did when the handler was not reached. */
  outcome: 'handled' | 'fault' | 'unauthorized' | 'invalid' | 'rate_limited' | 'not_found' | 'network_error';
  issues?: ValidationIssue[];
}

export interface FaultSpec {
  /** Operation id, or a route like `POST /statuses`. Omit to match any request. */
  operation?: string;
  /** How many matching requests fail. Default 1; `Infinity` until cleared. */
  times?: number;
  status?: number;
  headers?: Record<string, string>;
  body?: unknown;
  /** Delay before answering (or before failing). */
  delayMs?: number;
  /** Throw like a dropped connection instead of answering. */
  networkError?: boolean | Error;
  /** Never answer; resolves only when the request is aborted (for timeout tests). */
  hang?: boolean;
}

export interface Fault extends FaultSpec {
  remaining: number;
  hits: number;
}

/** A contract-driven fake carrier API that plugs into a client as its `HttpTransport`. */
export class Simulator<TState = SimStore> {
  readonly contract: ApiContract;
  readonly state: TState;
  readonly clock: SimClock;
  readonly calls: SimCall[] = [];
  readonly baseUrls: string[];
  private readonly validator: ContractValidator;
  private readonly routes: Array<{ operation: OperationContract; regex: RegExp; names: string[] }>;
  private readonly faults: Fault[] = [];
  private readonly windows = new Map<string, { start: number; count: number }>();

  constructor(private readonly options: SimulatorOptions<TState>) {
    this.contract = options.contract;
    this.state = options.state ?? (new SimStore() as unknown as TState);
    this.clock = options.clock ?? new SimClock();
    const base = options.baseUrl ?? options.contract.baseUrl;
    if (base === undefined || base.length === 0)
      throw new SimulatorError(`Simulator for ${options.contract.name} needs a baseUrl`);
    this.baseUrls = (Array.isArray(base) ? base : [base]).map(trimTrailingSlash);
    this.validator = new ContractValidator(options.contract);
    this.routes = options.contract.operations
      .map(operation => ({ operation, ...compileTemplate(operation.path) }))
      // Static segments win over parameters: `/shipments/barcode/{b}` before `/shipments/{id}/{x}`.
      .sort((a, b) => specificity(b.operation.path) - specificity(a.operation.path));
  }

  /**
   * The transport to hand to the client under test. Like carrier-core's fetch transport it enforces
   * `request.timeoutMs` per attempt (in real time, also with a virtual SimClock), so a `hang`, a `delayMs`
   * or a slow handler fails with a `TimeoutError`.
   */
  readonly transport: HttpTransport = (<T>(request: HttpRequest) =>
    this.handleWithTimeout(request) as Promise<HttpResponse<T>>) as HttpTransport;

  /** Queue a failure for matching requests. Faults are consumed in the order they were added. */
  fail(spec: FaultSpec): Fault {
    const fault: Fault = { ...spec, remaining: spec.times ?? 1, hits: 0 };
    this.faults.push(fault);
    return fault;
  }

  clearFaults(): void {
    this.faults.length = 0;
  }

  callsTo(operationId: string): SimCall[] {
    return this.calls.filter(call => call.operationId === operationId);
  }

  /** Whether this simulator serves `url` (used by `combineSimulators`). */
  serves(url: string): string | undefined {
    return this.baseUrls
      .filter(base => url === base || url.startsWith(`${base}/`) || url.startsWith(`${base}?`))
      .sort((a, b) => b.length - a.length)[0];
  }

  reset(): void {
    this.calls.length = 0;
    this.clearFaults();
    this.windows.clear();
    const state = this.state as unknown as { reset?: () => void };
    state.reset?.();
  }

  private async handleWithTimeout(request: HttpRequest): Promise<HttpResponse<unknown>> {
    if (!request.timeoutMs) return this.handle(request);
    const attempt = attemptSignal(request.signal, request.timeoutMs);
    const signal = attempt.signal as AbortSignal;
    const handled = this.handle({ ...request, signal });
    // The answer may settle after the timeout won the race; nobody waits for it then.
    handled.catch(() => undefined);
    let onAbort: (() => void) | undefined;
    const aborted = new Promise<never>((_, reject) => {
      onAbort = () => reject(abortReason(signal));
      if (signal.aborted) onAbort();
      else signal.addEventListener('abort', onAbort, { once: true });
    });
    try {
      return await Promise.race([handled, aborted]);
    } finally {
      if (onAbort) signal.removeEventListener('abort', onAbort);
      attempt.cleanup();
    }
  }

  private async handle(request: HttpRequest): Promise<HttpResponse<unknown>> {
    const parsed = this.parse(request);
    const call: SimCall = {
      method: request.method,
      url: request.url,
      path: parsed.path,
      query: parsed.query,
      headers: parsed.headers,
      body: parsed.body,
      outcome: 'handled',
    };
    this.calls.push(call);

    const route = this.match(request.method, parsed.path);
    if (route) call.operationId = route.operation.id;

    const fault = this.takeFault(route?.operation, request.method, parsed.path);
    if (fault) return this.applyFault(fault, request, call);

    if (!route) {
      call.outcome = 'not_found';
      if (this.options.strictRoutes !== false) {
        throw new SimulatorError(
          `${this.contract.name}: no operation for ${request.method} ${parsed.path} in the contract`,
        );
      }
      return this.finish(call, request, {
        status: 404,
        body: { message: `No route ${request.method} ${parsed.path}` },
      });
    }

    const ctx: SimContext<TState> = {
      operation: route.operation,
      method: request.method,
      path: parsed.path,
      params: route.params,
      query: { ...parsed.query },
      headers: parsed.headers,
      body: parsed.body,
      request,
      state: this.state,
      clock: this.clock,
    };

    try {
      const denied = await this.options.auth?.(ctx);
      if (denied) {
        call.outcome = 'unauthorized';
        return this.respond(call, request, route.operation, denied);
      }

      const limited = this.checkRateLimit(ctx);
      if (limited) {
        call.outcome = 'rate_limited';
        // The built-in 429 body is generic; only a carrier-shaped `rateLimit.response` must match the contract.
        return this.respond(call, request, route.operation, limited, this.options.rateLimit?.response !== undefined);
      }

      const issues = this.validateRequest(ctx);
      if (issues.length) {
        call.outcome = 'invalid';
        call.issues = issues;
        if (this.options.invalidRequest) {
          return this.respond(call, request, route.operation, this.options.invalidRequest(issues, ctx));
        }
        return this.finish(call, request, {
          status: 400,
          body: { error: 'ValidationError', issues: issues.map(i => i.message) },
        });
      }

      const handler = this.options.handlers[route.operation.id];
      if (!handler) throw new SimulatorError(`${this.contract.name}: no handler for operation ${route.operation.id}`);

      let response: SimResponse;
      try {
        response = await handler(ctx);
      } catch (error) {
        if (error instanceof SimHttpError) return this.respond(call, request, route.operation, error.response);
        throw error;
      }
      return this.respond(call, request, route.operation, response);
    } catch (error) {
      if (error instanceof SimHttpError) return this.respond(call, request, route.operation, error.response);
      if (error instanceof SimulatorError) throw error;
      // The client gave up (abort or timeout) while a handler waited on `ctx.request.signal`: pass it on.
      if (request.signal?.aborted && (error === request.signal.reason || isAbortError(error))) throw error;
      // A bug in a handler, `auth` or `invalidRequest` must fail the test, not look like a network error.
      throw new SimulatorError(`${this.contract.name}: ${route.operation.id} threw ${describeError(error)}`, {
        cause: error,
      });
    }
  }

  private parse(request: HttpRequest) {
    const base = this.serves(request.url);
    if (!base) throw new SimulatorError(`${this.contract.name}: ${request.url} is outside ${this.baseUrls.join(', ')}`);
    const rest = request.url.slice(base.length);
    const queryIndex = rest.indexOf('?');
    const rawPath = queryIndex === -1 ? rest : rest.slice(0, queryIndex);
    const query: SimQuery = {};
    if (queryIndex !== -1) {
      new URLSearchParams(rest.slice(queryIndex + 1)).forEach((value, key) => addQuery(query, key, value));
    }
    for (const [key, raw] of Object.entries(request.query ?? {})) {
      for (const value of Array.isArray(raw) ? raw : [raw]) {
        if (value !== undefined && value !== null) addQuery(query, key, String(value));
      }
    }
    const headers: Record<string, string> = {};
    for (const [key, value] of Object.entries(request.headers ?? {})) headers[key.toLowerCase()] = value;
    let body: unknown;
    try {
      body = copyBody(request.body);
    } catch (error) {
      throw new SimulatorError(
        `${this.contract.name}: request body is not JSON-serialisable: ${describeError(error)}`,
        { cause: error },
      );
    }
    return { path: rawPath === '' ? '/' : rawPath, query, headers, body };
  }

  private match(method: HttpMethod, path: string) {
    for (const route of this.routes) {
      if (route.operation.method !== method) continue;
      const m = route.regex.exec(path);
      if (!m) continue;
      const params: Record<string, unknown> = {};
      route.names.forEach((name, i) => {
        params[name] = safeDecode(m[i + 1]);
      });
      return { operation: route.operation, params };
    }
    return undefined;
  }

  private takeFault(operation: OperationContract | undefined, method: HttpMethod, path: string): Fault | undefined {
    const fault = this.faults.find(f => f.remaining > 0 && matchesFault(f, operation, method, path));
    if (!fault) return undefined;
    fault.remaining -= 1;
    fault.hits += 1;
    return fault;
  }

  private async applyFault(fault: Fault, request: HttpRequest, call: SimCall): Promise<HttpResponse<unknown>> {
    call.outcome = isNetworkFault(fault) ? 'network_error' : 'fault';
    if (fault.hang) {
      await new Promise<never>((_, reject) => {
        const signal = request.signal;
        if (!signal) return; // never settles: the client has no way out, like a black-holed connection
        const onAbort = () =>
          reject(signal.reason ?? Object.assign(new Error('The operation was aborted'), { name: 'AbortError' }));
        if (signal.aborted) onAbort();
        else signal.addEventListener('abort', onAbort, { once: true });
      });
    }
    if (fault.delayMs) await (this.options.sleep ?? realSleep)(fault.delayMs, request.signal);
    if (isNetworkFault(fault)) {
      throw fault.networkError instanceof Error
        ? fault.networkError
        : new TypeError('fetch failed (simulated network error)');
    }
    return this.finish(call, request, {
      status: fault.status ?? 500,
      headers: fault.headers,
      body: fault.body ?? { message: 'Simulated failure' },
    });
  }

  private checkRateLimit(ctx: SimContext<TState>): SimResponse | undefined {
    const limit = this.options.rateLimit;
    if (!limit) return undefined;
    const key = limit.key?.(ctx) ?? '*';
    const now = this.clock.now();
    let window = this.windows.get(key);
    if (!window || now - window.start >= limit.windowMs) {
      window = { start: now, count: 0 };
      this.windows.set(key, window);
    }
    window.count += 1;
    if (window.count <= limit.limit) return undefined;
    const retryAfterSec = Math.max(1, Math.ceil((window.start + limit.windowMs - now) / 1000));
    const response = limit.response?.(retryAfterSec) ?? { status: 429, body: { message: 'Too Many Requests' } };
    return {
      ...response,
      status: response.status ?? 429,
      headers: { 'retry-after': String(retryAfterSec), ...(response.headers ?? {}) },
    };
  }

  private validateRequest(ctx: SimContext<TState>): ValidationIssue[] {
    const op = ctx.operation;
    const issues: ValidationIssue[] = [];
    if (op.params?.path !== undefined)
      issues.push(...this.validator.validate(`${op.id}:path`, op.params.path, ctx.params, 'path', true));
    if (op.params?.query !== undefined)
      issues.push(...this.validator.validate(`${op.id}:query`, op.params.query, ctx.query, 'query', true));
    if (op.params?.headers !== undefined)
      issues.push(...this.validator.validate(`${op.id}:headers`, op.params.headers, ctx.headers, 'headers', true));

    const spec = op.requestBody;
    const body = ctx.request.body;
    if (spec) {
      if (!body) {
        if (spec.required) issues.push({ location: 'body', pointer: '/', message: 'body is required' });
      } else if (body.kind !== spec.kind) {
        issues.push({ location: 'body', pointer: '/', message: `body must be ${spec.kind}, got ${body.kind}` });
      } else if (spec.schema !== undefined && (body.kind === 'json' || body.kind === 'form')) {
        issues.push(...this.validator.validate(`${op.id}:body`, spec.schema, ctx.body, 'body', body.kind === 'form'));
      }
    }
    return issues;
  }

  /**
   * Every carrier-shaped answer for a contract route (handler, SimHttpError, `auth`, `invalidRequest`,
   * `rateLimit.response`) is checked against the contract. Injected faults are not.
   */
  private respond(
    call: SimCall,
    request: HttpRequest,
    operation: OperationContract,
    response: SimResponse,
    validate = true,
  ): HttpResponse<unknown> {
    if (validate) this.validateResponse(operation, response);
    return this.finish(call, request, response);
  }

  private validateResponse(operation: OperationContract, response: SimResponse): void {
    const status = response.status ?? 200;
    const spec = pickResponseSpec(operation, status);
    if (operation.responses && !spec && this.options.strictResponses !== false) {
      throw new SimulatorError(
        `${this.contract.name}: ${operation.id} answered ${status}, which the contract does not declare ` +
          `(declared: ${Object.keys(operation.responses).join(', ')}). Add it to responses or a "default" entry.`,
      );
    }
    if (spec?.schema === undefined || response.binary !== undefined) return;
    const issues = this.validator.validate(
      `${operation.id}:response:${status}`,
      spec.schema,
      structuredCloneSafe(response.body),
      'response',
    );
    if (issues.length) {
      throw new SimulatorError(
        `${this.contract.name}: handler for ${operation.id} returned a ${status} body that breaks the contract:\n${issues
          .map(i => `  - ${i.message}`)
          .join('\n')}`,
      );
    }
  }

  private finish(call: SimCall, request: HttpRequest, response: SimResponse): HttpResponse<unknown> {
    const status = response.status ?? 200;
    call.status = status;
    const headers: Record<string, string> = {};
    for (const [key, value] of Object.entries(response.headers ?? {})) headers[key.toLowerCase()] = value;

    let bytes: Uint8Array | undefined;
    let text: string;
    if (response.binary) {
      headers['content-type'] ??= response.binary.contentType;
      bytes = response.binary.data;
      text = new TextDecoder().decode(bytes);
    } else {
      if (response.body !== undefined && !headers['content-type']) {
        headers['content-type'] = typeof response.body === 'string' ? 'text/plain' : 'application/json';
      }
      // Serialise like a real wire would: no shared references, no undefined fields.
      text =
        response.body === undefined
          ? ''
          : typeof response.body === 'string'
            ? response.body
            : JSON.stringify(response.body);
    }
    return { status, headers, data: decodeLikeFetch(status, headers, text, bytes, request.responseType) };
  }
}

export function createSimulator<TState = SimStore>(options: SimulatorOptions<TState>): Simulator<TState> {
  return new Simulator(options);
}

/** One transport for several simulators of a carrier (eCom, forms, tracking...), routed by base URL. */
export function combineSimulators(...simulators: Array<Simulator<any>>): HttpTransport {
  return (<T>(request: HttpRequest) => {
    let best: { sim: Simulator<any>; length: number } | undefined;
    for (const sim of simulators) {
      const base = sim.serves(request.url);
      if (base && (!best || base.length > best.length)) best = { sim, length: base.length };
    }
    if (!best) return Promise.reject(new SimulatorError(`No simulator serves ${request.url}`));
    return best.sim.transport<T>(request);
  }) as HttpTransport;
}

function compileTemplate(template: string): { regex: RegExp; names: string[] } {
  const names: string[] = [];
  const pattern = template
    .split(/(\{[^}]+\})/)
    .map(part => {
      const m = /^\{([^}]+)\}$/.exec(part);
      if (m) {
        names.push(m[1]);
        return '([^/]+)';
      }
      return part.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    })
    .join('');
  return { regex: new RegExp(`^${pattern}/?$`), names };
}

function specificity(path: string): number {
  const segments = path.split('/').filter(Boolean);
  return segments.reduce((score, s) => score + (s.startsWith('{') ? 1 : 3), 0);
}

function isNetworkFault(fault: FaultSpec): boolean {
  return fault.networkError instanceof Error || fault.networkError === true;
}

function matchesFault(
  fault: Fault,
  operation: OperationContract | undefined,
  method: HttpMethod,
  path: string,
): boolean {
  if (!fault.operation) return true;
  if (operation && fault.operation === operation.id) return true;
  const [faultMethod, faultPath] = fault.operation.split(' ');
  if (!faultPath) return false;
  if (faultMethod !== method) return false;
  if (faultPath === operation?.path) return true;
  return faultPath === path;
}

function pickResponseSpec(operation: OperationContract, status: number) {
  const responses = operation.responses;
  if (!responses) return undefined;
  return (
    responses[String(status)] ??
    responses[`${String(status)[0]}XX`] ??
    responses[`${String(status)[0]}xx`] ??
    responses.default
  );
}

function addQuery(query: SimQuery, key: string, value: string): void {
  const existing = query[key];
  if (existing === undefined) query[key] = value;
  else query[key] = Array.isArray(existing) ? [...existing, value] : [existing, value];
}

/**
 * What the carrier would receive: a JSON body goes through the wire (Date → ISO string, no shared
 * references with the client's objects), a form body is copied so Ajv coercion cannot touch the caller's record.
 */
function copyBody(body: HttpRequest['body']): unknown {
  if (!body) return undefined;
  if (body.kind === 'json') return body.value === undefined ? undefined : JSON.parse(JSON.stringify(body.value));
  if (body.kind === 'form') return { ...body.value };
  return body.value;
}

function isAbortError(error: unknown): boolean {
  const name = (error as { name?: unknown } | null | undefined)?.name;
  return name === 'AbortError' || name === 'TimeoutError';
}

function describeError(error: unknown): string {
  if (error instanceof Error) return `${error.name}: ${error.message}`;
  return String(error);
}

function trimTrailingSlash(url: string): string {
  return url.replace(/\/+$/, '');
}

function structuredCloneSafe(value: unknown): unknown {
  return value === undefined ? undefined : JSON.parse(JSON.stringify(value));
}

/**
 * Decodes the body exactly as carrier-core's fetch transport would, so a client that forgets
 * `responseType: 'binary'` for a PDF gets text here too, as it would in production.
 */
function decodeLikeFetch(
  status: number,
  headers: Record<string, string>,
  text: string,
  bytes: Uint8Array | undefined,
  responseType: HttpRequest['responseType'],
): unknown {
  const contentType = headers['content-type'] ?? '';
  if (responseType === 'binary') {
    if (status >= 400 && /\bjson\b/i.test(contentType)) return parseJsonOrText(text);
    const data: BinaryData = {
      contentType: contentType || 'application/octet-stream',
      data: bytes ?? new TextEncoder().encode(text),
    };
    return data;
  }
  if (responseType === 'text') return text;
  return parseJsonOrText(text);
}

function parseJsonOrText(text: string): unknown {
  if (text === '') return undefined;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

/** A malformed percent-encoding (`%E0%A4%A`) reaches the handler as is, like on a lenient server. */
function safeDecode(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}
