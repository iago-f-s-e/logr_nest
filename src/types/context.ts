import { LogLevel } from '../core';
import { CatchExceptionOptions } from './catch-exception-options';
import { TriggerIn } from './trigger';

export interface ErrorContext {
  level: LogLevel;
  error: any;
  trigger: TriggerIn;
  params: any[];
  title: string;
  options: CatchExceptionOptions;
}

export interface LogContext {
  readonly correlationId: string;
  readonly causationId: string;
  registeredError?: ErrorContext;
}
