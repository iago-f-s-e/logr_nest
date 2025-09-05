import winston from 'winston';

export class JsonFormatter {
  static create() {
    return winston.format.combine(
      winston.format.timestamp(),
      winston.format.errors({ stack: true }),
      winston.format.json(),
    );
  }

  private constructor() {
    throw new Error(
      'JsonFormatter is a static class and cannot be instantiated',
    );
  }
}
