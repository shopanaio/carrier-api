/**
 * Validation utilities and validator class
 */

import { z, ZodError, ZodSchema } from 'zod';
import type { NovaPoshtaError, ValidationError } from '../types/errors';
import { ErrorCategory, ErrorSeverity } from '../types/errors';
import { schemas } from './schemas';

// Validation result type
export type ValidationResult<T> =
  | { success: true; data: T }
  | { success: false; errors: ValidationError[] };

// Validator configuration
export interface ValidatorConfig {
  /** Enable strict validation (fail on unknown properties) */
  readonly strict: boolean;
  /** Enable transformation of data during validation */
  readonly transform: boolean;
  /** Custom error messages */
  readonly customMessages?: Record<string, string>;
  /** Enable detailed error context */
  readonly includeContext: boolean;
}

// Default validator configuration
export const DEFAULT_VALIDATOR_CONFIG: ValidatorConfig = {
  strict: true,
  transform: true,
  includeContext: true,
};

// Main validator class
export class NovaPoshtaValidator {
  constructor(private readonly config: ValidatorConfig = DEFAULT_VALIDATOR_CONFIG) {}

  /**
   * Validate data against a schema
   */
  validate<T>(schema: ZodSchema<T>, data: unknown, context?: string): ValidationResult<T> {
    try {
      const parseOptions = {
        errorMap: this.createErrorMap(context),
      };

      // Apply strict mode only if schema supports it (ZodObject)
      let schemaToUse = schema;
      if (this.config.strict && 'strict' in schema && typeof (schema as any).strict === 'function') {
        schemaToUse = (schema as any).strict();
      }

      const result = schemaToUse.parse(data, parseOptions);

      return { success: true, data: result };
    } catch (error) {
      if (error instanceof ZodError) {
        const validationErrors = this.convertZodErrors(error, context);
        return { success: false, errors: validationErrors };
      }

      // Unexpected error
      const validationError: ValidationError = {
        code: 'VALIDATION_UNEXPECTED_ERROR',
        message: error instanceof Error ? error.message : 'Unexpected validation error',
        category: ErrorCategory.Validation,
        severity: ErrorSeverity.High,
        timestamp: new Date(),
        retryable: false,
        context: context ? { validationContext: context } : undefined,
      };

      return { success: false, errors: [validationError] };
    }
  }

  /**
   * Validate and throw on error
   */
  validateOrThrow<T>(schema: ZodSchema<T>, data: unknown, context?: string): T {
    const result = this.validate(schema, data, context);
    if (!result.success) {
      const firstError = result.errors[0];
      if (firstError) {
        throw new ValidationException(firstError.message, result.errors);
      }
      throw new Error('Validation failed');
    }
    return result.data;
  }

  /**
   * Safe validation that returns null on error
   */
  validateSafe<T>(schema: ZodSchema<T>, data: unknown): T | null {
    try {
      return schema.parse(data);
    } catch {
      return null;
    }
  }

  /**
   * Validate waybill creation request
   */
  validateCreateWaybillRequest(data: unknown): ValidationResult<any> {
    return this.validate(schemas.createWaybillRequest, data, 'createWaybillRequest');
  }

  /**
   * Validate waybill with options creation request
   */
  validateCreateWaybillWithOptionsRequest(data: unknown): ValidationResult<any> {
    return this.validate(schemas.createWaybillWithOptionsRequest, data, 'createWaybillWithOptionsRequest');
  }

  /**
   * Validate postomat waybill creation request
   */
  validateCreatePoshtomatWaybillRequest(data: unknown): ValidationResult<any> {
    return this.validate(schemas.createPoshtomatWaybillRequest, data, 'createPoshtomatWaybillRequest');
  }

  /**
   * Validate tracking request
   */
  validateTrackDocumentsRequest(data: unknown): ValidationResult<any> {
    return this.validate(schemas.trackDocumentsRequest, data, 'trackDocumentsRequest');
  }

  /**
   * Validate price calculation request
   */
  validatePriceCalculationRequest(data: unknown): ValidationResult<any> {
    return this.validate(schemas.priceCalculationRequest, data, 'priceCalculationRequest');
  }

  /**
   * Validate delivery date request
   */
  validateDeliveryDateRequest(data: unknown): ValidationResult<any> {
    return this.validate(schemas.deliveryDateRequest, data, 'deliveryDateRequest');
  }

  /**
   * Validate Nova Poshta response
   */
  validateNovaPoshtaResponse(data: unknown): ValidationResult<any> {
    return this.validate(schemas.novaPoshtaResponse, data, 'novaPoshtaResponse');
  }

  /**
   * Validate client configuration
   */
  validateClientConfig(data: unknown): ValidationResult<any> {
    return this.validate(schemas.clientConfig, data, 'clientConfig');
  }

  /**
   * Create custom error map for better error messages
   */
  private createErrorMap(context?: string): z.ZodErrorMap {
    return (issue, ctx) => {
      const customMessage = this.config.customMessages?.[issue.code];
      if (customMessage) {
        return { message: customMessage };
      }

      switch (issue.code) {
        case z.ZodIssueCode.invalid_type:
          return {
            message: `Expected ${issue.expected}, received ${issue.received}`,
          };
        case z.ZodIssueCode.invalid_string:
          if (issue.validation === 'regex') {
            return {
              message: `Invalid format for field "${issue.path.join('.')}"`,
            };
          }
          break;
        case z.ZodIssueCode.too_small:
          if (issue.type === 'string') {
            return {
              message: `Field "${issue.path.join('.')}" must be at least ${issue.minimum} characters long`,
            };
          }
          if (issue.type === 'number') {
            return {
              message: `Field "${issue.path.join('.')}" must be at least ${issue.minimum}`,
            };
          }
          if (issue.type === 'array') {
            return {
              message: `Field "${issue.path.join('.')}" must contain at least ${issue.minimum} items`,
            };
          }
          break;
        case z.ZodIssueCode.too_big:
          if (issue.type === 'string') {
            return {
              message: `Field "${issue.path.join('.')}" must be at most ${issue.maximum} characters long`,
            };
          }
          if (issue.type === 'number') {
            return {
              message: `Field "${issue.path.join('.')}" must be at most ${issue.maximum}`,
            };
          }
          if (issue.type === 'array') {
            return {
              message: `Field "${issue.path.join('.')}" must contain at most ${issue.maximum} items`,
            };
          }
          break;
        case z.ZodIssueCode.invalid_enum_value:
          return {
            message: `Invalid value for field "${issue.path.join('.')}". Allowed values: ${issue.options.join(', ')}`,
          };
        case z.ZodIssueCode.custom:
          if (context) {
            return {
              message: `Validation failed for ${context}: ${issue.message || 'Custom validation error'}`,
            };
          }
          break;
      }

      return { message: ctx.defaultError };
    };
  }

  /**
   * Convert Zod errors to Nova Poshta validation errors
   */
  private convertZodErrors(zodError: ZodError, context?: string): ValidationError[] {
    return zodError.errors.map((issue) => {
      const field = issue.path.length > 0 ? issue.path.join('.') : undefined;

      return {
        code: `VALIDATION_${issue.code.toUpperCase()}`,
        message: issue.message,
        category: ErrorCategory.Validation,
        severity: this.getErrorSeverity(issue.code),
        timestamp: new Date(),
        retryable: false,
        field,
        value: this.config.includeContext ? this.getFieldValue(zodError.format(), issue.path) : undefined,
        constraint: this.getConstraintInfo(issue),
        context: context ? { validationContext: context, zodIssue: issue } : undefined,
      } as ValidationError;
    });
  }

  /**
   * Get error severity based on Zod issue code
   */
  private getErrorSeverity(code: z.ZodIssueCode): ErrorSeverity {
    switch (code) {
      case z.ZodIssueCode.invalid_type:
      case z.ZodIssueCode.invalid_enum_value:
        return ErrorSeverity.High;
      case z.ZodIssueCode.too_small:
      case z.ZodIssueCode.too_big:
      case z.ZodIssueCode.invalid_string:
        return ErrorSeverity.Medium;
      case z.ZodIssueCode.custom:
      case z.ZodIssueCode.invalid_arguments:
        return ErrorSeverity.Medium;
      default:
        return ErrorSeverity.Low;
    }
  }

  /**
   * Get field value from formatted error
   */
  private getFieldValue(formatted: z.ZodFormattedError<any>, path: (string | number)[]): unknown {
    let current = formatted;
    for (const segment of path) {
      if (current && typeof current === 'object' && segment in current) {
        current = (current as any)[segment];
      } else {
        return undefined;
      }
    }
    return current;
  }

  /**
   * Get constraint information from Zod issue
   */
  private getConstraintInfo(issue: z.ZodIssue): string | undefined {
    switch (issue.code) {
      case z.ZodIssueCode.too_small:
        return `minimum: ${issue.minimum}`;
      case z.ZodIssueCode.too_big:
        return `maximum: ${issue.maximum}`;
      case z.ZodIssueCode.invalid_string:
        if (typeof issue.validation === 'string') {
          if (issue.validation === 'regex') {
            return `pattern: ${issue.validation}`;
          }
          return issue.validation;
        }
        // For complex validation objects, stringify them
        return `validation: ${JSON.stringify(issue.validation)}`;
      case z.ZodIssueCode.invalid_enum_value:
        return `allowedValues: ${issue.options.join(', ')}`;
      default:
        return undefined;
    }
  }
}

// Validation exception class
export class ValidationException extends Error {
  constructor(
    message: string,
    public readonly validationErrors: ValidationError[],
  ) {
    super(message);
    this.name = 'ValidationException';
  }

  /**
   * Get validation errors grouped by field
   */
  getErrorsByField(): Record<string, ValidationError[]> {
    const grouped: Record<string, ValidationError[]> = {};

    for (const error of this.validationErrors) {
      const field = error.field || 'general';
      if (!grouped[field]) {
        grouped[field] = [];
      }
      grouped[field]!.push(error);
    }

    return grouped;
  }

  /**
   * Get all error messages
   */
  getAllMessages(): string[] {
    return this.validationErrors.map(error => error.message);
  }

  /**
   * Check if validation has errors for specific field
   */
  hasFieldErrors(field: string): boolean {
    return this.validationErrors.some(error => error.field === field);
  }
}

// Singleton validator instance
export const validator = new NovaPoshtaValidator();

// Utility functions for common validations
export function isValidNovaPoshtaRef(value: unknown): boolean {
  return validator.validateSafe(schemas.novaPoshtaRef, value) !== null;
}

export function isValidPhoneNumber(value: unknown): boolean {
  return validator.validateSafe(schemas.phoneNumber, value) !== null;
}

export function isValidNovaPoshtaDate(value: unknown): boolean {
  return validator.validateSafe(schemas.novaPoshtaDate, value) !== null;
}

export function isValidWeight(value: unknown): boolean {
  return validator.validateSafe(schemas.weight, value) !== null;
}

export function isValidCost(value: unknown): boolean {
  return validator.validateSafe(schemas.cost, value) !== null;
}

// Type guards with validation
export function validateAndCast<T>(schema: ZodSchema<T>, value: unknown): T {
  return validator.validateOrThrow(schema, value);
}

// Validation decorators for methods (if using decorators)
export function ValidateParams(schema: ZodSchema) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = function (...args: any[]) {
      // Validate the first argument (assuming it's the request object)
      if (args.length > 0) {
        validator.validateOrThrow(schema, args[0], propertyKey);
      }
      return originalMethod.apply(this, args);
    };

    return descriptor;
  };
}

// Async validation for large objects
export async function validateAsync<T>(
  schema: ZodSchema<T>,
  data: unknown,
  context?: string
): Promise<ValidationResult<T>> {
  return new Promise((resolve) => {
    // Use setTimeout to make it async and avoid blocking
    setTimeout(() => {
      const result = validator.validate(schema, data, context);
      resolve(result);
    }, 0);
  });
}
