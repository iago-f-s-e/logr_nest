import { TriggerIn } from '../../types';
import { LogLevel } from '../enums';

/**
 * Represents a logger service.
 *
 * @property {(error: any, ...params: any[]) => void} error - Logs an error.
 */
export interface LoggerService {
  /**
   * Logs a message.
   *
   * @param {string} title - The title of the log.
   * @param {LogLevel} level - The level of the log.
   * @param {any} error - The error object to be logged.
   * @param {any[]} [params] - Additional parameters associated with the log (optional).
   * @returns {void}
   */
  log(
    title: string,
    level: LogLevel,
    error: any | null,
    ...params: any[]
  ): void;

  /**
   * Logs an error.
   *
   * @param {any} error - The error object to be logged.
   * @param {string} title - The title of the error.
   * @param {any[]} [params] - Additional parameters associated with the error (optional).
   * @returns {void}
   */
  error(error: any, title?: string, ...params: any[]): void;

  /**
   * Logs an info.
   *
   * @param {string} title - The title of the log.
   * @param {any[]} [params] - Additional parameters associated with the log (optional).
   * @returns {void}
   */
  info(title: string, ...params: any[]): void;

  /**
   * Logs a warning.
   *
   * @param {string} title - The title of the log.
   * @param {any[]} [params] - Additional parameters associated with the log (optional).
   * @returns {void}
   */
  warn(title: string, ...params: any[]): void;

  /**
   * Logs a debug.
   *
   * @param {string} title - The title of the log.
   * @param {any[]} [params] - Additional parameters associated with the log (optional).
   * @returns {void}
   */
  debug(title: string, ...params: any[]): void;

  set trigger(trigger: TriggerIn);
}
