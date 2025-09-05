import winston from 'winston';
import { Logger } from '../../core/interfaces';
import { ErrorPattern, LogPattern } from '../../types';
import { JsonFormatter, PrettyFormatter } from '../formatters';
import {
  DEFAULT_WINSTON_CONFIG,
  WinstonConfig,
} from './winston-config.interface';

/** @implements {Logger} */
export class LoggerWinston implements Logger {
  private winstonLogger: winston.Logger;
  private config: WinstonConfig;

  constructor(config?: WinstonConfig) {
    this.config = { ...DEFAULT_WINSTON_CONFIG, ...config };
    this.winstonLogger = this.createWinstonLogger();
  }

  private createWinstonLogger(): winston.Logger {
    const format = this.config.json
      ? JsonFormatter.create()
      : PrettyFormatter.create(this.config.colorize);

    const transports: winston.transport[] = [
      new winston.transports.Console({
        level: this.config.level,
        silent: this.config.silent,
        format,
      }),
    ];

    return winston.createLogger({
      level: this.config.level,
      format,
      transports,
      exitOnError: this.config.exitOnError,
      silent: this.config.silent,
      defaultMeta: this.config.defaultMeta,
    });
  }

  public info(log: LogPattern): void {
    this.winstonLogger.info(log);
  }

  public warn(log: LogPattern): void {
    this.winstonLogger.warn(log);
  }

  public error(error: ErrorPattern): void {
    this.winstonLogger.error(error);
  }

  public debug(log: LogPattern): void {
    this.winstonLogger.debug(log);
  }
}
