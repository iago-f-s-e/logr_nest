import { CatchExceptionOptions } from '../../types';

export interface ErrorHandlingContext {
  error: any;
  target: any;
  methodName: string;
  args: any[];
  options: CatchExceptionOptions;
}

export interface ErrorHandlingResult {
  shouldThrow: boolean;
  returnValue?: any;
  errorToThrow?: any;
}

export interface ErrorHandlingStrategy {
  handle(context: ErrorHandlingContext): ErrorHandlingResult;
}
