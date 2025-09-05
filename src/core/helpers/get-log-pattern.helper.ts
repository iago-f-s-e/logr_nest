import type { ErrorPattern, LogPattern, TriggerIn } from '../../types';

type LogPatternParams = {
  trigger: TriggerIn;
  message: string;
  error?: any;
  params?: any[];
};

export function getLogPattern({
  trigger,
  message,
  error,
  params = [],
}: LogPatternParams): LogPattern | ErrorPattern {
  const logPattern: LogPattern = {
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

  if (!error) {
    return logPattern;
  }

  const errorPattern: ErrorPattern = {
    ...logPattern,
    error: {
      kind: trigger.kind ?? 'Missing kind',
      message: error.message,
      stack: error.stack,
      name: error.name ?? 'Missing name',
    },
  };

  return errorPattern;
}
