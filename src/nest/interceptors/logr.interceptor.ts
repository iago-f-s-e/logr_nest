import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Inject,
  Provider,
} from '@nestjs/common';
import { v7 } from 'uuid';
import { Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { LoggerService } from '../../application/services';
import { AsyncTraceStorage } from '../../infrastructure/context';
import { LogrInterceptorConfig } from './logr-config.interface';

@Injectable()
export class LogrInterceptor implements NestInterceptor {
  constructor(
    private readonly logger: LoggerService,
    @Inject('LOGR_INTERCEPTOR_CONFIG')
    private readonly config: LogrInterceptorConfig = {},
  ) {}

  static forRoot(config: LogrInterceptorConfig = {}): Provider {
    return {
      provide: 'LOGR_INTERCEPTOR_CONFIG',
      useValue: {
        logRequestStart: true,
        logRequestEnd: true,
        logUnhandledErrors: true,
        includeHeaders: false,
        includeBody: false,
        excludePaths: ['/health', '/metrics'],
        ...config,
      },
    };
  }

  public intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<any> {
    const request = context.switchToHttp().getRequest();

    if (this.config.excludePaths?.includes(request.url)) {
      return next.handle();
    }

    this.logger.trigger = {
      className: context.getClass().name,
      methodName: context.getHandler().name,
      kind: 'Presentation',
    };

    const trace = {
      correlationId: request.headers['x-correlation-id'] || v7(),
      causationId: request.headers['x-causation-id'] || v7(),
      id: request.headers['x-request-id'] || v7(),
    };

    return AsyncTraceStorage.run(trace, () => {
      if (this.config.logRequestStart) {
        this.logRequestStart(context);
      }

      return next.handle().pipe(
        tap((_response) => {
          if (this.config.logRequestEnd) {
            this.logRequestEnd(context);
          }
        }),
        catchError((error) => {
          this.handleError(error);
          throw error;
        }),
      );
    });
  }

  private handleError(error: Error) {
    const registeredError = AsyncTraceStorage.registeredError;

    if (registeredError) {
      this.logger.log(
        registeredError.title,
        registeredError.level,
        registeredError.error,
        registeredError.params,
      );
    } else if (this.config.logUnhandledErrors) {
      this.logger.error(error);
    }

    AsyncTraceStorage.clearRegisteredError();
  }

  private logRequestStart(context: ExecutionContext): void {
    this.logger.debug(
      `Request started: ${this.logger.trigger.className}.${this.logger.trigger.methodName}`,
      context.switchToHttp().getRequest(),
    );
  }

  private logRequestEnd(context: ExecutionContext): void {
    this.logger.debug(
      `Request completed: ${this.logger.trigger.className}.${this.logger.trigger.methodName}`,
      context.switchToHttp().getResponse(),
    );
  }
}
