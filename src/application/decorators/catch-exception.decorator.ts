import {
  LogErrorStrategy,
  RegisterErrorStrategy,
  SuppressErrorStrategy,
} from '../../core';
import {
  DEFAULT_ERROR_HANDLING_TYPE,
  ErrorHandlingType,
  LogLevel,
} from '../../core/enums';
import {
  ErrorHandlingStrategy,
  LoggerService as ILoggerService,
} from '../../core/interfaces';
import { ExceptionHandler } from '../../infrastructure/handlers';
import { CatchExceptionOptions } from '../../types';
import { LoggerService } from '../services';

const defaultOptions: CatchExceptionOptions = {
  level: LogLevel.ERROR,
  typeErrorHandling: DEFAULT_ERROR_HANDLING_TYPE,
  bubbleException: true,
  isSync: false,
  hideParams: false,
};

export function CatchException(
  optionsOrBuilder?: CatchExceptionOptions,
  logger: ILoggerService = new LoggerService(),
) {
  return (
    _target: any,
    _methodName: string,
    descriptor: PropertyDescriptor,
  ): PropertyDescriptor => {
    const originalMethod = descriptor.value;

    const options = {
      ...defaultOptions,
      ...(optionsOrBuilder ?? {}),
    };

    let strategy: ErrorHandlingStrategy;
    switch (options.typeErrorHandling) {
      case ErrorHandlingType.REGISTER:
        strategy = new RegisterErrorStrategy();
        break;
      case ErrorHandlingType.SUPPRESS:
        strategy = new SuppressErrorStrategy();
        break;
      default:
        strategy = new LogErrorStrategy(logger);
        break;
    }

    const handler = new ExceptionHandler(strategy, options);
    descriptor.value = handler.wrapMethod(originalMethod);

    persistsMetadata(descriptor.value, originalMethod);

    return descriptor;
  };
}

export function persistsMetadata(method: any, originalMethod: any): void {
  const metadataKeys: string[] = Reflect.getOwnMetadataKeys(originalMethod);

  for (const metadataKey of metadataKeys) {
    const metadataValue = Reflect.getOwnMetadata(metadataKey, originalMethod);

    Reflect.defineMetadata(metadataKey, metadataValue, method);
  }
}
