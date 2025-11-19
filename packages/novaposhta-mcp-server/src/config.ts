export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface ServerConfig {
  apiKey?: string;
  baseUrl: string;
  logLevel: LogLevel;
  timeout: number;
}

export function loadConfig(overrides: Partial<ServerConfig> = {}): ServerConfig {
  const envApiKey = process.env.NOVA_POSHTA_API_KEY || process.env.NP_API_KEY;
  const apiKey = overrides.apiKey ?? envApiKey;

  return {
    apiKey,
    baseUrl: overrides.baseUrl ?? process.env.NOVA_POSHTA_BASE_URL ?? 'https://api.novaposhta.ua/v2.0/json/',
    logLevel: overrides.logLevel ?? (process.env.LOG_LEVEL as LogLevel) ?? 'info',
    timeout: overrides.timeout ?? Number.parseInt(process.env.TIMEOUT ?? '30000', 10),
  };
}
