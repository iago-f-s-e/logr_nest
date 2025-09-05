import winston from 'winston';
import { ErrorPattern } from '../../types';

export class PrettyFormatter {
  static create(colorize = true) {
    const formats = [
      winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }),
      winston.format.errors({ stack: true }),
    ];

    if (colorize) {
      formats.push(winston.format.colorize({ all: true }));
    }

    formats.push(
      winston.format.printf((data) => {
        const { timestamp, level, message, ...meta } =
          data as unknown as ErrorPattern;

        let output = `${timestamp} [${level}]: ${message}`;

        if (meta.trigger) {
          output += `\n[cid:${meta.trigger.trace.correlation_id}][causation:${meta.trigger.trace.causation_id}][id:${meta.trigger.trace.id}]`;
          output += `\n[${meta.trigger.class_name}.${meta.trigger.method_name}]`;
          output += `\n${JSON.stringify(meta.trigger.params)}`;
        }

        if (meta.error) {
          output += `\n${meta.error.name}: ${meta.error.message}`;
          output += `\n${meta.error.stack || meta.error.message || meta.error}`;
        }

        return output;
      }),
    );

    return winston.format.combine(...formats);
  }

  private constructor() {
    throw new Error(
      'PrettyFormatter is a static class and cannot be instantiated',
    );
  }
}
