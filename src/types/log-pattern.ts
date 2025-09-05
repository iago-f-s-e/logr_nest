import { LogLevel } from '../core';
import { TriggerOut } from './trigger';

export interface LogPattern {
  level: LogLevel;
  /**
   * The timestamp when the log was generated.
   *
   * @type {string}
   * @remarks This field represents the date and time when log was created, typically in ISO 8601 format.
   */
  timestamp: string;

  /**
   * The logger trigger associated with.
   *
   * @type {TriggerOut}
   */
  trigger: TriggerOut;

  /**
   * The message associated with.
   *
   * @type {TriggerOutDTO}
   */
  message?: string;
}
