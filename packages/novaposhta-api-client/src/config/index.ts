/**
 * Configuration management for Nova Poshta client
 */

import { Language } from '../types/enums';

// Main client configuration interface
export interface NovaPoshtaClientConfig {
  /** Nova Poshta API key */
  apiKey: string;
  /** Preferred language (optional) */
  language?: Language;
}

// Required configuration (minimal setup)
export interface RequiredConfig {
  apiKey: string;
}

// Default configuration values
export const DEFAULT_CLIENT_CONFIG: Omit<NovaPoshtaClientConfig, 'apiKey'> = {};

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

  // transport configuration removed: external transport is now injected

  //

  /** Build final configuration */
  build(): NovaPoshtaClientConfig {
    if (!this.config.apiKey) {
      throw new Error('API key is required');
    }

    return {
      ...DEFAULT_CLIENT_CONFIG,
      ...this.config,
    } as NovaPoshtaClientConfig;
  }
}

// Configuration factory functions
export function createConfig(apiKey: string): ConfigBuilder {
  return new ConfigBuilder(apiKey);
}

export function createTestConfig(apiKey: string = 'test-key'): NovaPoshtaClientConfig {
  return createConfig(apiKey)
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

  // No transport validation: transport is external

  if (errors.length > 0) {
    throw new Error(`Configuration validation failed:\n${errors.join('\n')}`);
  }
}

// Environment variable configuration loader
export function loadConfigFromEnv(apiKey?: string): Partial<NovaPoshtaClientConfig> {
  const env = process.env;

  return {
    apiKey: apiKey || env['NOVA_POSHTA_API_KEY'],
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
  };
}
