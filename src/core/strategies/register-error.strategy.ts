import { AsyncTraceStorage } from '../../infrastructure/context';
import {
  ErrorHandlingContext,
  ErrorHandlingResult,
  ErrorHandlingStrategy,
} from '../interfaces';
import { BaseStrategy } from './base.strategy';

export class RegisterErrorStrategy
  extends BaseStrategy
  implements ErrorHandlingStrategy
{
  public handle(context: ErrorHandlingContext): ErrorHandlingResult {
    const registeredError = {
      error: context.error,
      trigger: this.buildTrigger(context),
      title: this.buildTitle(context),
      params: this.buildParams(context),
    };

    AsyncTraceStorage.registeredError = registeredError;

    let errorToThrow = context.error;
    if (context.options.customErrorInstance) {
      errorToThrow = this.buildCustomError(context);
    }

    return {
      shouldThrow: true,
      errorToThrow,
    };
  }
}
