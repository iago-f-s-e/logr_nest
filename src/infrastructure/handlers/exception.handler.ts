import {
  ErrorHandlingContext,
  ErrorHandlingStrategy,
} from '../../core/interfaces';
import { CatchExceptionOptions } from '../../types';

export class ExceptionHandler {
  constructor(
    private strategy: ErrorHandlingStrategy,
    private options: CatchExceptionOptions,
  ) {}

  public wrapMethod(
    originalMethod: (...args: any[]) => any,
  ): (...args: any[]) => any {
    if (this.options.isSync) {
      return this.createSyncHandler(originalMethod);
    }
    return this.createAsyncHandler(originalMethod);
  }

  private createSyncHandler(
    originalMethod: (...args: any[]) => any,
  ): (...args: any[]) => any {
    const handler = this;
    return function (this: any, ...args: any[]): any {
      try {
        return originalMethod.apply(this, args);
      } catch (error) {
        return handler.handleError(error, this, originalMethod.name, args);
      }
    };
  }

  private createAsyncHandler(
    originalMethod: (...args: any[]) => any,
  ): (...args: any[]) => Promise<any> {
    const handler = this;
    return async function (this: any, ...args: any[]): Promise<any> {
      try {
        return await originalMethod.apply(this, args);
      } catch (error) {
        return await handler.handleError(
          error,
          this,
          originalMethod.name,
          args,
        );
      }
    };
  }

  private handleError(
    error: any,
    target: any,
    methodName: string,
    args: any[],
  ): any {
    const context: ErrorHandlingContext = {
      error,
      target,
      methodName,
      args,
      options: this.options,
    };

    const result = this.strategy.handle(context);

    if (result.shouldThrow) {
      throw result.errorToThrow || error;
    }

    return result.returnValue;
  }
}
