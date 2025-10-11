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
  /** HTTP transport configuration */
  transport: Partial<TransportConfig>;
}

// Required configuration (minimal setup)
export interface RequiredConfig {
  apiKey: string;
}

// Default configuration values
export const DEFAULT_CLIENT_CONFIG: Omit<NovaPoshtaClientConfig, 'apiKey'> = {
  transport: {},
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

  //

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
    .transport({ timeout: 5000 })
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

  // Validate transport config
  if (config.transport.timeout && config.transport.timeout < 1000) {
    errors.push('Timeout must be at least 1000ms');
  }

  if (errors.length > 0) {
    throw new Error(`Configuration validation failed:\n${errors.join('\n')}`);
  }
}

// Environment variable configuration loader
export function loadConfigFromEnv(apiKey?: string): Partial<NovaPoshtaClientConfig> {
  const env = process.env;

  const timeout = env['NOVA_POSHTA_TIMEOUT'] ? parseInt(env['NOVA_POSHTA_TIMEOUT'], 10) : undefined;

  return {
    apiKey: apiKey || env['NOVA_POSHTA_API_KEY'],
    transport: {
      ...(timeout !== undefined && { timeout }),
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
  };
}
