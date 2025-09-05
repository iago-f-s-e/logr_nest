import { Logger } from '../../core';
import { LoggerWinston, WinstonConfig } from '../winston';

export class LoggerFactory {
  static createWinston(config?: WinstonConfig): Logger {
    return new LoggerWinston(config);
  }

  private constructor() {
    throw new Error(
      'LoggerFactory is a static class and cannot be instantiated',
    );
  }
}
