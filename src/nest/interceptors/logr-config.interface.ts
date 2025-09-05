export interface LogrInterceptorConfig {
  logRequestStart?: boolean;
  logRequestEnd?: boolean;
  logUnhandledErrors?: boolean;
  excludePaths?: string[];
}
