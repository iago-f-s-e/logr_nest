import { ErrorHandlingType, LogLevel } from '../core';

/**
 * Configuration options for the CatchException decorator
 */
export interface CatchExceptionOptions {
  /**
   * @description The level of logging to be used (optional).
   *
   * @type {LogLevel}
   */
  level?: LogLevel;

  /**
   * @description The kind of logging event (e.g., 'Application', 'Domain', 'Infra') (optional).
   *
   * @type {string}
   */
  kind?: string;

  /**
   * @description Defines whether the method is synchronous (optional).
   *
   * @type {boolean}
   */
  isSync?: boolean;

  /**
   * @description If set to true, the parameters that have been passed to the method will not be recorded, keeping sensitive data private. (optional).
   *
   * @type {boolean}
   */
  hideParams?: boolean;

  /**
   * @description It allows you to use a function to process and transform the parameters before they are recorded, adapting them to the desired format. (optional).
   *
   * @type {Function}
   * @param {any[]} ...params = All parameters in the same order as they were declared in method or function
   * @returns {any} - The new parameters to be logged.
   */
  pipeParams?: (...params: any[]) => any;

  /**
   * @description Allows you to specify a custom error instance to be thrown, useful for customizing the exception that is logged. (optional).
   *
   * @overview does not work if "returnOnException" is provided
   *
   * @type {any or function}
   */
  customErrorInstance?:
    | any
    | ((exception: any, context?: any, ...params: any[]) => any);

  /**
   * @description If set to true, the original exception will be thrown after logging, allowing the exception to continue its propagation. (optional).
   *
   * @overview does not work if "returnOnException" is provided
   *
   * @type {boolean}
   */
  bubbleException?: boolean;

  errorTitle?:
    | string
    | ((exception: any, context?: any, ...params: any[]) => string);

  /**
   * @description It offers the ability to provide a custom function to handle the logged exception and return new information or values after the exception has been logged. (optional).
   *
   * @overview if provided, the "bubbleException", "customErrorInstance" and "onException" options will be invalidated
   *
   * @type {Function}
   * @param {any} exception - The exception object.
   * @param {any} context - The context associated with the exception.
   * @param {any[]} ...params = All parameters in the same order as they were declared in method or function
   * @returns {any | Promise<any>} - The new information to be returned.
   */
  returnOnException?: (
    exception: any,
    context?: any,
    ...params: any[]
  ) => any | Promise<any>;

  /**
   * @description If set to LOG, the exception will be logged. If set to REGISTER, the exception will be logged in the service to be logged in higher layers. (optional).
   *
   * @type {ErrorHandlingType}
   */
  typeErrorHandling?: ErrorHandlingType;
}
