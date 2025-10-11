/**
 * Configuration management for Nova Poshta client
 */

import type { TransportConfig } from '../http/transport';
import { DEFAULT_TRANSPORT_CONFIG } from '../http/transport';
import { Language } from '../types/enums';

// Main client configuration interface
export interface NovaPoshtaClientConfig {
  /** Nova Poshta API key */
  apiKey: string;
  /** Preferred language for responses */
  language: Language;
  /** HTTP transport configuration */
  transport: Partial<TransportConfig>;
  /** Enable validation of requests and responses */
  enableValidation: boolean;
  /** Enable caching for reference data */
  enableCaching: boolean;
  /** Cache TTL in milliseconds */
  cacheTtl: number;
  /** Enable metrics collection */
  enableMetrics: boolean;
  /** Enable detailed logging */
  enableLogging: boolean;
  /** Custom user agent string */
  userAgent?: string;
  /** Client information for tracking */
  clientInfo?: {
    name: string;
    version: string;
  };
}

// Required configuration (minimal setup)
export interface RequiredConfig {
  apiKey: string;
}

// Default configuration values
export const DEFAULT_CLIENT_CONFIG: Omit<NovaPoshtaClientConfig, 'apiKey'> = {
  language: Language.Ukrainian,
  transport: {},
  enableValidation: true,
  enableCaching: true,
  cacheTtl: 3600000, // 1 hour
  enableMetrics: false,
  enableLogging: false,
};

// Configuration builder class
export class ConfigBuilder {
  private config: Partial<NovaPoshtaClientConfig> = {};

  constructor(apiKey: string) {
    (this.config as any).apiKey = apiKey;
  }

  /** Set preferred language */
  language(language: Language): this {
    (this.config as any).language = language;
    return this;
  }

  /** Configure transport settings */
  transport(config: Partial<TransportConfig>): this {
    (this.config as any).transport = { ...this.config.transport, ...config };
    return this;
  }

  /** Enable/disable validation */
  validation(enabled: boolean): this {
    (this.config as any).enableValidation = enabled;
    return this;
  }

  /** Enable/disable caching */
  caching(enabled: boolean, ttl?: number): this {
    (this.config as any).enableCaching = enabled;
    if (ttl !== undefined) {
      (this.config as any).cacheTtl = ttl;
    }
    return this;
  }

  /** Enable/disable metrics collection */
  metrics(enabled: boolean): this {
    (this.config as any).enableMetrics = enabled;
    return this;
  }

  /** Enable/disable logging */
  logging(enabled: boolean): this {
    (this.config as any).enableLogging = enabled;
    return this;
  }

  /** Set custom user agent */
  userAgent(userAgent: string): this {
    (this.config as any).userAgent = userAgent;
    return this;
  }

  /** Set client information */
  clientInfo(name: string, version: string): this {
    (this.config as any).clientInfo = { name, version };
    return this;
  }

  /** Build final configuration */
  build(): NovaPoshtaClientConfig {
    if (!this.config.apiKey) {
      throw new Error('API key is required');
    }

    return {
      ...DEFAULT_CLIENT_CONFIG,
      ...this.config,
      transport: {
        ...DEFAULT_TRANSPORT_CONFIG,
        ...this.config.transport,
      },
    } as NovaPoshtaClientConfig;
  }
}

// Configuration factory functions
export function createConfig(apiKey: string): ConfigBuilder {
  return new ConfigBuilder(apiKey);
}

export function createTestConfig(apiKey: string = 'test-key'): NovaPoshtaClientConfig {
  return createConfig(apiKey)
    .validation(false)
    .caching(false)
    .logging(false)
    .metrics(false)
    .transport({ timeout: 5000, maxRetries: 0 })
    .build();
}

// Configuration validation
export function validateConfig(config: NovaPoshtaClientConfig): void {
  const errors: string[] = [];

  // Validate API key
  if (!config.apiKey || typeof config.apiKey !== 'string') {
    errors.push('API key must be a non-empty string');
  }

  if (config.apiKey && config.apiKey.length < 32) {
    errors.push('API key appears to be invalid (too short)');
  }

  // Validate language
  if (!Object.values(Language).includes(config.language)) {
    errors.push(`Invalid language: ${config.language}`);
  }

  // Validate transport config
  if (config.transport.timeout && config.transport.timeout < 1000) {
    errors.push('Timeout must be at least 1000ms');
  }

  if (config.transport.maxRetries && config.transport.maxRetries < 0) {
    errors.push('Max retries cannot be negative');
  }

  if (config.transport.rateLimit && config.transport.rateLimit < 1) {
    errors.push('Rate limit must be at least 1 request per second');
  }

  // Validate cache TTL
  if (config.cacheTtl < 0) {
    errors.push('Cache TTL cannot be negative');
  }

  if (errors.length > 0) {
    throw new Error(`Configuration validation failed:\n${errors.join('\n')}`);
  }
}

// Environment variable configuration loader
export function loadConfigFromEnv(apiKey?: string): Partial<NovaPoshtaClientConfig> {
  const env = process.env;

  const timeout = env['NOVA_POSHTA_TIMEOUT'] ? parseInt(env['NOVA_POSHTA_TIMEOUT'], 10) : undefined;
  const maxRetries = env['NOVA_POSHTA_MAX_RETRIES'] ? parseInt(env['NOVA_POSHTA_MAX_RETRIES'], 10) : undefined;
  const rateLimit = env['NOVA_POSHTA_RATE_LIMIT'] ? parseInt(env['NOVA_POSHTA_RATE_LIMIT'], 10) : undefined;

  return {
    apiKey: apiKey || env['NOVA_POSHTA_API_KEY'],
    language: (env['NOVA_POSHTA_LANGUAGE'] as Language) || Language.Ukrainian,
    enableValidation: env['NOVA_POSHTA_ENABLE_VALIDATION'] !== 'false',
    enableCaching: env['NOVA_POSHTA_ENABLE_CACHING'] !== 'false',
    cacheTtl: env['NOVA_POSHTA_CACHE_TTL'] ? parseInt(env['NOVA_POSHTA_CACHE_TTL'], 10) : 3600000,
    enableMetrics: env['NOVA_POSHTA_ENABLE_METRICS'] === 'true',
    enableLogging: env['NOVA_POSHTA_ENABLE_LOGGING'] === 'true',
    userAgent: env['NOVA_POSHTA_USER_AGENT'],
    transport: {
      ...(timeout !== undefined && { timeout }),
      ...(maxRetries !== undefined && { maxRetries }),
      ...(rateLimit !== undefined && { rateLimit }),
    },
  };
}

// Configuration merger utility
export function mergeConfigs(
  base: Partial<NovaPoshtaClientConfig>,
  override: Partial<NovaPoshtaClientConfig>,
): Partial<NovaPoshtaClientConfig> {
  return {
    ...base,
    ...override,
    transport: {
      ...base.transport,
      ...override.transport,
    },
    clientInfo: override.clientInfo || base.clientInfo,
  };
}
