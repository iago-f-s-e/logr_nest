import { TriggerIn } from '../../types';
import { getLogParams } from '../helpers';
import {
  ErrorHandlingContext,
  ErrorHandlingResult,
  ErrorHandlingStrategy,
} from '../interfaces';

export abstract class BaseStrategy implements ErrorHandlingStrategy {
  public abstract handle(context: ErrorHandlingContext): ErrorHandlingResult;

  protected buildTrigger(context: ErrorHandlingContext): TriggerIn {
    return {
      kind: context.options.kind || context.target?.__kind,
      className: context.target.constructor.name,
      methodName: context.methodName,
    };
  }

  protected buildTitle(context: ErrorHandlingContext): string {
    if (!context.options.errorTitle) {
      return context.error.message;
    }

    return typeof context.options.errorTitle === 'function'
      ? context.options.errorTitle.call(
          context.target,
          context.error,
          context.target,
          ...context.args,
        )
      : context.options.errorTitle;
  }

  protected buildCustomError(context: ErrorHandlingContext): any {
    if (typeof context.options.customErrorInstance === 'function') {
      return context.options.customErrorInstance.call(
        context.target,
        context.error,
        context.target,
        ...context.args,
      );
    }

    return context.options.customErrorInstance;
  }

  protected buildParams(context: ErrorHandlingContext): any[] {
    return getLogParams(context.args, context.options);
  }
}
