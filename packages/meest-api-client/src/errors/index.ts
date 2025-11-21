// code and comments in English
import type { MeestResponse } from '../types/base';
import type { HttpRequest } from '../http/transport';

export type MeestErrorCode =
  | 'AUTHENTICATION_ERROR'
  | 'AUTHORIZATION_ERROR'
  | 'VALIDATION_ERROR'
  | 'TRANSPORT_ERROR'
  | 'UNEXPECTED_RESPONSE';

export interface ErrorContext {
  request?: Pick<HttpRequest, 'method' | 'url'> & { path?: string };
  responseStatus?: number;
  fieldName?: string;
  info?: string;
}

export class MeestError extends Error {
  readonly code: MeestErrorCode;
  readonly context?: ErrorContext;

  constructor(code: MeestErrorCode, message: string, context?: ErrorContext) {
    super(message);
    this.name = 'MeestError';
    this.code = code;
    this.context = context;
  }
}

export class AuthenticationError extends MeestError {
  constructor(message: string, context?: ErrorContext) {
    super('AUTHENTICATION_ERROR', message, context);
    this.name = 'AuthenticationError';
  }
}

export class AuthorizationError extends MeestError {
  constructor(message: string, context?: ErrorContext) {
    super('AUTHORIZATION_ERROR', message, context);
    this.name = 'AuthorizationError';
  }
}

export class ValidationError extends MeestError {
  constructor(message: string, context?: ErrorContext) {
    super('VALIDATION_ERROR', message, context);
    this.name = 'ValidationError';
  }
}

export class TransportError extends MeestError {
  constructor(message: string, context?: ErrorContext) {
    super('TRANSPORT_ERROR', message, context);
    this.name = 'TransportError';
  }
}

export class UnexpectedResponseError extends MeestError {
  constructor(message: string, context?: ErrorContext) {
    super('UNEXPECTED_RESPONSE', message, context);
    this.name = 'UnexpectedResponseError';
  }
}

export function toMeestError(err: unknown, context?: ErrorContext): MeestError {
  if (err instanceof MeestError) {
    return err;
  }
  if (err instanceof Error) {
    return new TransportError(err.message, context);
  }
  return new TransportError('Unknown transport error', context);
}

export function assertOk<T>(response: MeestResponse<T>, context?: ErrorContext): T {
  if (response.status === 'OK') {
    return response.result;
  }

  const message = response.message || response.info || 'Meest API reported an error';
  throw new ValidationError(message, {
    ...context,
    fieldName: response.fieldName,
    info: response.messageDetails || response.info,
  });
}
