import {
  MeestError,
  AuthenticationError,
  AuthorizationError,
  ValidationError,
  TransportError,
  UnexpectedResponseError,
  toMeestError,
  assertOk,
} from '../src/errors';
import type { MeestResponse } from '../src/types/base';

describe('errors', () => {
  describe('MeestError', () => {
    it('should create error with code and message', () => {
      const error = new MeestError('VALIDATION_ERROR', 'Invalid input');
      expect(error.name).toBe('MeestError');
      expect(error.code).toBe('VALIDATION_ERROR');
      expect(error.message).toBe('Invalid input');
      expect(error.context).toBeUndefined();
    });

    it('should create error with context', () => {
      const context = {
        request: { method: 'POST' as const, url: 'https://api.test.com/users' },
        responseStatus: 400,
      };
      const error = new MeestError('VALIDATION_ERROR', 'Invalid input', context);
      expect(error.context).toEqual(context);
    });

    it('should be instanceof Error', () => {
      const error = new MeestError('TRANSPORT_ERROR', 'Network failed');
      expect(error).toBeInstanceOf(Error);
    });

    it('should be instanceof MeestError', () => {
      const error = new MeestError('TRANSPORT_ERROR', 'Network failed');
      expect(error).toBeInstanceOf(MeestError);
    });
  });

  describe('AuthenticationError', () => {
    it('should create authentication error', () => {
      const error = new AuthenticationError('Invalid credentials');
      expect(error.name).toBe('AuthenticationError');
      expect(error.code).toBe('AUTHENTICATION_ERROR');
      expect(error.message).toBe('Invalid credentials');
    });

    it('should be instanceof MeestError', () => {
      const error = new AuthenticationError('Invalid credentials');
      expect(error).toBeInstanceOf(MeestError);
      expect(error).toBeInstanceOf(AuthenticationError);
    });

    it('should include context', () => {
      const context = { responseStatus: 401 };
      const error = new AuthenticationError('Token expired', context);
      expect(error.context).toEqual(context);
    });
  });

  describe('AuthorizationError', () => {
    it('should create authorization error', () => {
      const error = new AuthorizationError('Access denied');
      expect(error.name).toBe('AuthorizationError');
      expect(error.code).toBe('AUTHORIZATION_ERROR');
      expect(error.message).toBe('Access denied');
    });

    it('should be instanceof MeestError', () => {
      const error = new AuthorizationError('Access denied');
      expect(error).toBeInstanceOf(MeestError);
      expect(error).toBeInstanceOf(AuthorizationError);
    });
  });

  describe('ValidationError', () => {
    it('should create validation error', () => {
      const error = new ValidationError('Invalid field');
      expect(error.name).toBe('ValidationError');
      expect(error.code).toBe('VALIDATION_ERROR');
      expect(error.message).toBe('Invalid field');
    });

    it('should include field name in context', () => {
      const context = { fieldName: 'email', info: 'Invalid email format' };
      const error = new ValidationError('Validation failed', context);
      expect(error.context?.fieldName).toBe('email');
      expect(error.context?.info).toBe('Invalid email format');
    });
  });

  describe('TransportError', () => {
    it('should create transport error', () => {
      const error = new TransportError('Network timeout');
      expect(error.name).toBe('TransportError');
      expect(error.code).toBe('TRANSPORT_ERROR');
      expect(error.message).toBe('Network timeout');
    });

    it('should be instanceof MeestError', () => {
      const error = new TransportError('Network timeout');
      expect(error).toBeInstanceOf(MeestError);
      expect(error).toBeInstanceOf(TransportError);
    });
  });

  describe('UnexpectedResponseError', () => {
    it('should create unexpected response error', () => {
      const error = new UnexpectedResponseError('Invalid response format');
      expect(error.name).toBe('UnexpectedResponseError');
      expect(error.code).toBe('UNEXPECTED_RESPONSE');
      expect(error.message).toBe('Invalid response format');
    });

    it('should be instanceof MeestError', () => {
      const error = new UnexpectedResponseError('Invalid response format');
      expect(error).toBeInstanceOf(MeestError);
      expect(error).toBeInstanceOf(UnexpectedResponseError);
    });
  });

  describe('toMeestError', () => {
    it('should return MeestError as-is', () => {
      const original = new ValidationError('Test error');
      const result = toMeestError(original);
      expect(result).toBe(original);
    });

    it('should convert Error to TransportError', () => {
      const original = new Error('Network failed');
      const result = toMeestError(original);
      expect(result).toBeInstanceOf(TransportError);
      expect(result.message).toBe('Network failed');
    });

    it('should convert unknown error to TransportError', () => {
      const result = toMeestError('string error');
      expect(result).toBeInstanceOf(TransportError);
      expect(result.message).toBe('Unknown transport error');
    });

    it('should convert null to TransportError', () => {
      const result = toMeestError(null);
      expect(result).toBeInstanceOf(TransportError);
      expect(result.message).toBe('Unknown transport error');
    });

    it('should include context in converted error', () => {
      const context = { responseStatus: 500 };
      const original = new Error('Server error');
      const result = toMeestError(original, context);
      expect(result.context).toEqual(context);
    });
  });

  describe('assertOk', () => {
    it('should return result when status is OK', () => {
      const response: MeestResponse<{ id: string }> = {
        status: 'OK',
        result: { id: '123' },
      };
      const result = assertOk(response);
      expect(result).toEqual({ id: '123' });
    });

    it('should throw ValidationError when status is Error', () => {
      const response: MeestResponse<any> = {
        status: 'Error',
        message: 'Validation failed',
        result: null as any,
      };
      expect(() => assertOk(response)).toThrow(ValidationError);
    });

    it('should include message from response', () => {
      const response: MeestResponse<any> = {
        status: 'Error',
        message: 'Invalid parcel data',
        result: null as any,
      };
      try {
        assertOk(response);
        fail('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationError);
        expect((error as ValidationError).message).toBe('Invalid parcel data');
      }
    });

    it('should use info if message is not available', () => {
      const response: MeestResponse<any> = {
        status: 'Error',
        info: 'Additional info',
        result: null as any,
      };
      try {
        assertOk(response);
        fail('Should have thrown');
      } catch (error) {
        expect((error as ValidationError).message).toBe('Additional info');
      }
    });

    it('should use default message if neither message nor info available', () => {
      const response: MeestResponse<any> = {
        status: 'Error',
        result: null as any,
      };
      try {
        assertOk(response);
        fail('Should have thrown');
      } catch (error) {
        expect((error as ValidationError).message).toBe('Meest API reported an error');
      }
    });

    it('should include fieldName in error context', () => {
      const response: MeestResponse<any> = {
        status: 'Error',
        message: 'Invalid field',
        fieldName: 'email',
        result: null as any,
      };
      try {
        assertOk(response);
        fail('Should have thrown');
      } catch (error) {
        expect((error as ValidationError).context?.fieldName).toBe('email');
      }
    });

    it('should include messageDetails in error context as info', () => {
      const response: MeestResponse<any> = {
        status: 'Error',
        message: 'Validation failed',
        messageDetails: 'Email format is invalid',
        result: null as any,
      };
      try {
        assertOk(response);
        fail('Should have thrown');
      } catch (error) {
        expect((error as ValidationError).context?.info).toBe('Email format is invalid');
      }
    });

    it('should include request context when provided', () => {
      const response: MeestResponse<any> = {
        status: 'Error',
        message: 'Validation failed',
        result: null as any,
      };
      const context = {
        request: { method: 'POST' as const, url: 'https://api.test.com/parcel', path: '/parcel' },
        responseStatus: 400,
      };
      try {
        assertOk(response, context);
        fail('Should have thrown');
      } catch (error) {
        expect((error as ValidationError).context?.request).toEqual(context.request);
        expect((error as ValidationError).context?.responseStatus).toBe(400);
      }
    });

    it('should handle array results', () => {
      const response: MeestResponse<Array<{ id: string }>> = {
        status: 'OK',
        result: [{ id: '1' }, { id: '2' }],
      };
      const result = assertOk(response);
      expect(result).toEqual([{ id: '1' }, { id: '2' }]);
    });

    it('should handle empty array results', () => {
      const response: MeestResponse<any[]> = {
        status: 'OK',
        result: [],
      };
      const result = assertOk(response);
      expect(result).toEqual([]);
    });
  });
});
