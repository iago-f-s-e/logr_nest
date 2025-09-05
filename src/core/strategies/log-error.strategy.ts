import { LogLevel } from '../enums';
import {
  ErrorHandlingContext,
  ErrorHandlingResult,
  ErrorHandlingStrategy,
  LoggerService,
} from '../interfaces';
import { BaseStrategy } from './base.strategy';

export class LogErrorStrategy
  extends BaseStrategy
  implements ErrorHandlingStrategy
{
  constructor(private logger: LoggerService) {
    super();
  }

  handle(context: ErrorHandlingContext): ErrorHandlingResult {
    this.logError(context);

    if (context.options.returnOnException) {
      const args = context.args || [];
      return {
        shouldThrow: false,
        returnValue: context.options.returnOnException.call(
          context.target,
          context.error,
          context.target,
          ...args,
        ),
      };
    }

    if (context.options.customErrorInstance) {
      return {
        shouldThrow: true,
        errorToThrow: this.buildCustomError(context),
      };
    }

    return {
      shouldThrow: context.options.bubbleException ?? false,
      errorToThrow: context.error,
    };
  }

  private logError(context: ErrorHandlingContext): void {
    this.logger.trigger = this.buildTrigger(context);

    const title = this.buildTitle(context);

    this.logger.error(
      context.error,
      title,
      context.options.level || LogLevel.ERROR,
      ...this.buildParams(context),
    );
  }
}
