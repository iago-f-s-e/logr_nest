import type { LogPattern, TriggerIn } from '../../types';
import { LogLevel } from '../enums';

export function getLogPattern(
  trigger: TriggerIn,
  message: string,
  level: LogLevel,
  ...params: any[]
): LogPattern {
  return {
    level,
    message,
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
  };
}
