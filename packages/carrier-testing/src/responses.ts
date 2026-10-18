// code and comments in English

/** What a handler returns. `body` is JSON-serialisable; `binary` is for PDFs and other files. */
export interface SimResponse {
  status?: number;
  headers?: Record<string, string>;
  body?: unknown;
  binary?: { contentType: string; data: Uint8Array };
}

export function json(body: unknown, status = 200, headers: Record<string, string> = {}): SimResponse {
  return { status, headers, body };
}

export function binary(contentType: string, data: Uint8Array, status = 200): SimResponse {
  return { status, binary: { contentType, data } };
}

export function noContent(): SimResponse {
  return { status: 204 };
}

/** Throw from a handler to answer with an error response (e.g. 404 when an entity does not exist). */
export class SimHttpError extends Error {
  constructor(
    readonly response: SimResponse,
    message?: string,
  ) {
    super(message ?? `Simulated HTTP ${response.status ?? 500}`);
    this.name = 'SimHttpError';
  }
}

export function httpError(status: number, body?: unknown, headers?: Record<string, string>): SimHttpError {
  return new SimHttpError({ status, body, ...(headers ? { headers } : {}) });
}

/** Thrown when the simulator itself is misused or a handler breaks the contract. Fails the test on purpose. */
export class SimulatorError extends Error {
  /** Tells carrier-core to rethrow it as is: never retried, never wrapped as a network error. */
  readonly fatal = true;

  constructor(message: string, options?: { cause?: unknown }) {
    super(message);
    this.name = 'SimulatorError';
    if (options && 'cause' in options) (this as { cause?: unknown }).cause = options.cause;
  }
}

/** Smallest valid one-page PDF, for label/sticker endpoints. */
export function minimalPdf(text = 'label'): Uint8Array {
  const safe = text.replace(/[()\\]/g, '');
  const content = `BT /F1 12 Tf 20 100 Td (${safe}) Tj ET`;
  const objects = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 283 283] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>',
    `<< /Length ${content.length} >>\nstream\n${content}\nendstream`,
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
  ];
  let pdf = '%PDF-1.4\n';
  const offsets: number[] = [];
  objects.forEach((body, index) => {
    offsets.push(pdf.length);
    pdf += `${index + 1} 0 obj\n${body}\nendobj\n`;
  });
  const xref = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  for (const offset of offsets) pdf += `${String(offset).padStart(10, '0')} 00000 n \n`;
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`;
  return new TextEncoder().encode(pdf);
}

export function isPdf(data: Uint8Array): boolean {
  return data.length > 4 && data[0] === 0x25 && data[1] === 0x50 && data[2] === 0x44 && data[3] === 0x46;
}
