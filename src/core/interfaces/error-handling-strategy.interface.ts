import { ErrorContext } from '../../types';

export interface ErrorHandlingResult {
  shouldThrow: boolean;
  returnValue?: any;
  errorToThrow?: any;
}

export interface ErrorHandlingStrategy {
  handle(context: ErrorContext): ErrorHandlingResult;
}
