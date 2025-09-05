/**
 * Configuration options for the logging system
 */
export interface LoggingOptions {
  level?: string;
  silent?: boolean;
  exitOnError?: boolean;
  format?: any;
  transports?: any[];
  defaultMeta?: Record<string, any>;
}
