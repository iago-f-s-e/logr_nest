import {
  ErrorHandlingContext,
  ErrorHandlingResult,
  ErrorHandlingStrategy,
} from '../interfaces';
import { BaseStrategy } from './base.strategy';

export class SuppressErrorStrategy
  extends BaseStrategy
  implements ErrorHandlingStrategy
{
  public handle(context: ErrorHandlingContext): ErrorHandlingResult {
    let returnValue: any;

    if (context.options.returnOnException) {
      const args = context.args || [];
      returnValue = context.options.returnOnException.call(
        context.target,
        context.error,
        context.target,
        ...args,
      );
    }

    return {
      shouldThrow: false,
      returnValue,
    };
  }
}
