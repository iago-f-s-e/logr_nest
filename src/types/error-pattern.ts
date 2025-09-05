import { LogPattern } from './log-pattern';
import { TriggerIn } from './trigger';

/**
 * Data Transfer Object for error patterns
 */
export interface ErrorPattern extends LogPattern {
  /**
   * Represents information about an error.
   *
   * @property {string} stack - The error stack trace.
   * @property {string} name - The name of the error.
   * @property {string} message - The error message.
   * @property {string} kind - The kind of error (e.g., 'Application', 'Domain', 'Infra').
   */
  error: {
    /**
     * The error stack trace.
     *
     * @type {string}
     */
    stack: string;

    /**
     * The name of the error.
     *
     * @type {string}
     */
    name: string;

    /**
     * The error message.
     *
     * @type {string}
     */
    message: string;

    /**
     * The kind of error (e.g., 'Application', 'Domain', 'Infra').
     *
     * @type {string}
     */
    kind: string;
  };
}

export interface RegisteredError {
  error: any;
  trigger: TriggerIn;
  title: string;
  params: any[];
}
