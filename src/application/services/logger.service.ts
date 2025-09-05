import { Injectable, Scope } from '@nestjs/common';
import { LogLevel } from '../../core';
import { getLogPattern } from '../../core/helpers';
import {
  LoggerService as ILoggerService,
  type Logger,
} from '../../core/interfaces';
import { AsyncTraceStorage } from '../../infrastructure/context/async-trace-storage.service';
import { LoggerFactory } from '../../infrastructure/factories/logger.factory';
import { ErrorPattern, TriggerIn } from '../../types';

@Injectable({ scope: Scope.TRANSIENT })
export class LoggerService implements ILoggerService {
  private _trigger: TriggerIn = {};

  constructor(
    private readonly logger: Logger = LoggerFactory.createWinston(),
  ) {}

  public log(
    title: string,
    level: LogLevel,
    error: any | null,
    ...params: any[]
  ): void {
    const logPattern = getLogPattern({
      trigger: this.trigger,
      message: title,
      params,
      error,
    });

    switch (level) {
      case LogLevel.INFO:
        this.logger.info(logPattern);
        break;
      case LogLevel.WARN:
        this.logger.warn(logPattern);
        break;
      case LogLevel.ERROR:
        this.logger.error(logPattern as ErrorPattern);
        break;
      case LogLevel.DEBUG:
        this.logger.debug(logPattern);
        break;
    }
  }

  public error(error: any, title?: string, ...params: any[]): void {
    this.log(
      title?.trim().length ? title.trim() : error.message,
      LogLevel.ERROR,
      error,
      ...params,
    );
  }

  public info(message: string, ...params: any[]): void {
    this.log(message, LogLevel.INFO, null, ...params);
  }

  public warn(message: string, ...params: any[]): void {
    this.log(message, LogLevel.WARN, null, ...params);
  }

  public debug(message: string, ...params: any[]): void {
    this.log(message, LogLevel.DEBUG, null, ...params);
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
