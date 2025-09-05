import { ErrorPattern, LogPattern } from '../../types';

/**
 * Represents a logger.
 *
 * @property {(error: ErrorPattern) => void} error - Logs an error.
 * @property {(log: LogPattern) => void} info - Logs an info.
 * @property {(log: LogPattern) => void} warn - Logs a warning.
 * @property {(log: LogPattern) => void} debug - Logs a debug.
 */
export interface Logger {
  /**
   * Logs an info.
   *
   * @param {LogPattern} log - The log pattern to be logged.
   * @returns {void}
   */
  info(log: LogPattern): void;

  /**
   * Logs an warn.
   *
   * @param {LogPattern} log - The log pattern to be logged.
   * @returns {void}
   */
  warn(log: LogPattern): void;
  /**
   * Logs an error.
   *
   * @param {ErrorPattern} error - The error pattern to be logged.
   * @returns {void}
   */
  error(error: ErrorPattern): void;

  /**
   * Logs a debug.
   *
   * @param {LogPattern} log - The log pattern to be logged.
   * @returns {void}
   */
  debug(log: LogPattern): void;
}
