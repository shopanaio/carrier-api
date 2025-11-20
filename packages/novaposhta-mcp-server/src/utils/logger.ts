import type { LogLevel } from '../config.js';

const LEVEL_PRIORITY: Record<LogLevel, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
};

export class Logger {
  constructor(private readonly level: LogLevel = 'info') {}

  debug(message: string, extra?: unknown) {
    this.log('debug', message, extra);
  }

  info(message: string, extra?: unknown) {
    this.log('info', message, extra);
  }

  warn(message: string, extra?: unknown) {
    this.log('warn', message, extra);
  }

  error(message: string, extra?: unknown) {
    this.log('error', message, extra);
  }

  private log(level: LogLevel, message: string, extra?: unknown) {
    if (LEVEL_PRIORITY[level] < LEVEL_PRIORITY[this.level]) {
      return;
    }

    const payload = extra !== undefined ? { message, extra } : { message };
    // eslint-disable-next-line no-console
    console.error(JSON.stringify({ level, timestamp: new Date().toISOString(), ...payload }));
  }
}
