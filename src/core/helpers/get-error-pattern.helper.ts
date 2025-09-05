import type { ErrorPattern, TriggerIn } from '../../types';
import { LogLevel } from '../enums';

export function getErrorPattern(
  error: any,
  trigger: TriggerIn,
  level: LogLevel,
  ...params: any[]
): ErrorPattern {
  return {
    level,
    message: error.message,
    timestamp: new Date().toISOString(),
    trigger: {
      class_name: trigger.className ?? 'Missing className',
      method_name: trigger.methodName ?? 'Missing method name',
      params: params,
      trace: {
        correlation_id: trigger.correlationId,
        causation_id: trigger.causationId,
        id: trigger.id,
      },
    },
    error: {
      kind: trigger.kind ?? 'Missing kind',
      message: error.message,
      stack: error.stack,
      name: error.name,
    },
  };
}
