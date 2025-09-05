import { LoggingOptions } from '../../types';

export interface WinstonConfig extends LoggingOptions {
  datePattern?: string;
  maxSize?: string;
  maxFiles?: string;
  colorize?: boolean;
  prettyPrint?: boolean;
  json?: boolean;
}

export const DEFAULT_WINSTON_CONFIG: WinstonConfig = {
  level: 'debug',
  silent: false,
  exitOnError: false,
  colorize: true,
  json: process.env.NODE_ENV === 'production',
};
