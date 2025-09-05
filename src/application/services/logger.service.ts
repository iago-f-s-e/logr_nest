import { Injectable } from '@nestjs/common';
import { LogLevel } from '../../core';
import { getErrorPattern, getLogPattern } from '../../core/helpers';
import {
  LoggerService as ILoggerService,
  type Logger,
} from '../../core/interfaces';
import { AsyncTraceStorage } from '../../infrastructure/context/async-trace-storage.service';
import { LoggerFactory } from '../../infrastructure/factories/logger.factory';
import { TriggerIn } from '../../types';

@Injectable()
export class LoggerService implements ILoggerService {
  private _trigger: TriggerIn = {};

  constructor(
    private readonly logger: Logger = LoggerFactory.createWinston(),
  ) {}

  public error(
    error: any,
    title: string,
    level: LogLevel,
    ...params: any[]
  ): void {
    const errorPattern = getErrorPattern(error, this.trigger, level, ...params);
    const errorTitle = title.trim().length
      ? title.trim()
      : errorPattern.error.message;

    this.logger.error(errorPattern, errorTitle);
  }

  public info(message: string, ...params: any[]): void {
    const logPattern = getLogPattern(
      this.trigger,
      message,
      LogLevel.INFO,
      ...params,
    );
    this.logger.info(logPattern);
  }

  public warn(message: string, ...params: any[]): void {
    const logPattern = getLogPattern(
      this.trigger,
      message,
      LogLevel.WARN,
      ...params,
    );
    this.logger.warn(logPattern);
  }

  public debug(message: string, ...params: any[]): void {
    const logPattern = getLogPattern(
      this.trigger,
      message,
      LogLevel.DEBUG,
      ...params,
    );
    this.logger.debug(logPattern);
  }

  public get trigger(): TriggerIn {
    return {
      kind: this._trigger.kind,
      methodName: this._trigger.methodName,
      className: this._trigger.className ?? 'MissingClassName',
      id: this._trigger.id,
      causationId: AsyncTraceStorage.causationId,
      correlationId: AsyncTraceStorage.correlationId,
    };
  }

  public set trigger(trigger: TriggerIn) {
    this._trigger = trigger;
  }
}
