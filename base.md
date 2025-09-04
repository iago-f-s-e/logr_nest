## 🧠 **2. LogContext Simplificado**

```typescript
// src/core/entities/log-context.entity.ts
export interface LogContext {
  readonly correlationId: string;
  readonly causationId: string;
  registeredError?: RegisteredError;
}

export interface RegisteredError {
  error: any;
  trigger: TriggerInDTO;
  title: string;
  params: any[];
}
```

## 🔄 **3. AsyncLocalStorage**

```typescript
// src/infrastructure/context/async-trace-storage.service.ts
import { AsyncLocalStorage } from 'async_hooks';
import { LogContext, RegisteredError } from '../../core/entities';

export class AsyncTraceStorage {
  private static instance: AsyncTraceStorage;
  private als: AsyncLocalStorage<LogContext>;

  private constructor() {
    this.als = new AsyncLocalStorage<LogContext>();
  }

  private static getInstance(): AsyncTraceStorage {
    if (!this.instance) {
      this.instance = new AsyncTraceStorage();
    }
    return this.instance;
  }

  private static getStore(): LogContext | undefined {
    return this.getInstance().als.getStore();
  }

  public static run: AsyncLocalStorage<LogContext>['run'] = 
    this.getInstance().als.run.bind(this.getInstance().als);

  public static get outsideAsyncContext(): boolean {
    return this.getStore() === undefined;
  }

  // Getters/Setters para correlationId
  public static get correlationId(): string | undefined {
    return this.getStore()?.correlationId;
  }

  public static set correlationId(value: string | undefined) {
    const store = this.getStore();
    if (store && value) {
      (store as any).correlationId = value; // Mutação controlada
    }
  }

  // Getters/Setters para causationId
  public static get causationId(): string | undefined {
    return this.getStore()?.causationId;
  }

  public static set causationId(value: string | undefined) {
    const store = this.getStore();
    if (store && value) {
      (store as any).causationId = value;
    }
  }

  // Gestão de erro registrado
  public static set registeredError(dto: RegisteredError) {
    const store = this.getStore();
    if (!store) return;
    
    if (!store.registeredError) {
      (store as any).registeredError = dto;
    }
  }

  public static get registeredError(): RegisteredError | undefined {
    return this.getStore()?.registeredError;
  }

  public static clearRegisteredError(): void {
    const store = this.getStore();
    if (store) {
      delete (store as any).registeredError;
    }
  }

  // Helper para acessar trace IDs externamente
  public static getTraceIds() {
    const store = this.getStore();
    return {
      correlationId: store?.correlationId,
      causationId: store?.causationId
    };
  }
}
```

## 🎛️ **4. LoggingInterceptor Configurável**

```typescript
// src/application/interceptors/logging.interceptor.ts
export interface LoggingInterceptorConfig {
  logRequestStart?: boolean;
  logRequestEnd?: boolean;
  logUnhandledErrors?: boolean;
  includeHeaders?: boolean;
  includeBody?: boolean;
  excludePaths?: string[];
}

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor(
    private readonly logger: LoggerService,
    @Inject('LOGGING_INTERCEPTOR_CONFIG') 
    private readonly config: LoggingInterceptorConfig = {}
  ) {}

  static forRoot(config: LoggingInterceptorConfig = {}): Provider {
    return {
      provide: 'LOGGING_INTERCEPTOR_CONFIG',
      useValue: {
        logRequestStart: true,
        logRequestEnd: true,
        logUnhandledErrors: true,
        includeHeaders: false,
        includeBody: false,
        excludePaths: ['/health', '/metrics'],
        ...config
      }
    };
  }

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    
    // Skip paths excluídos
    if (this.config.excludePaths?.includes(request.url)) {
      return next.handle();
    }

    const logContext = this.createLogContext(request);
    
    return AsyncTraceStorage.run(logContext, () => {
      const startTime = Date.now();
      
      if (this.config.logRequestStart) {
        this.logRequestStart(context, request);
      }

      return next.handle().pipe(
        tap((response) => {
          if (this.config.logRequestEnd) {
            this.logRequestEnd(context, Date.now() - startTime);
          }
        }),
        catchError((error) => {
          this.handleError(context, error, Date.now() - startTime);
          throw error;
        })
      );
    });
  }

  private handleError(context: ExecutionContext, error: Error, duration: number) {
    // Verificar se é erro registrado (tratado)
    const registeredError = AsyncTraceStorage.registeredError;
    
    if (registeredError) {
      // Erro foi tratado pelo @CatchException
      this.logger.error('Handled exception occurred', registeredError.error, {
        trigger: registeredError.trigger,
        metadata: { 
          duration,
          handled: true,
          params: registeredError.params 
        }
      });
    } else if (this.config.logUnhandledErrors) {
      // Erro não tratado
      this.logger.error('Unhandled exception occurred', error, {
        trigger: {
          className: context.getClass().name,
          methodName: context.getHandler().name,
          kind: 'Controller'
        },
        metadata: { 
          duration,
          handled: false 
        }
      });
    }

    AsyncTraceStorage.clearRegisteredError();
  }
}

// Uso no módulo
@Module({
  providers: [
    LoggingInterceptor.forRoot({
      logRequestStart: true,
      logRequestEnd: true,
      excludePaths: ['/health']
    }),
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
  ],
})
export class LoggingModule {}
```

## 🏭 **5. LoggerService com Arquitetura em Camadas**

### **Interface Core**
```typescript
// src/core/interfaces/logger.interface.ts
export interface Logger {
  info(pattern: LogPatternDTO): void;
  warn(pattern: LogPatternDTO): void;
  error(pattern: ErrorPatternDTO, title?: string): void;
  debug(pattern: LogPatternDTO): void;
}

export interface LoggerService {
  error(error: any, title: string, ...params: any[]): void;
  info(message: string, ...params: any[]): void;
  warn(message: string, ...params: any[]): void;
  debug(message: string, ...params: any[]): void;
  trigger: TriggerInDTO;
}
```

### **LoggerFactory**
```typescript
// src/infrastructure/factories/logger.factory.ts
export class LoggerFactory {
  static createWinston(config?: WinstonConfig): Logger {
    return new LoggerWinston(config);
  }

  static createStdout(): Logger {
    return new LoggerStdout();
  }

  static createConsole(): Logger {
    return new LoggerConsole();
  }

  static createPino(config?: PinoConfig): Logger {
    return new LoggerPino(config);
  }
}
```

### **LoggerService**
```typescript
// src/application/services/logger.service.ts
import { Injectable } from '@nestjs/common';
import { Logger, LoggerService as ILoggerService } from '../../core/interfaces';
import { TriggerInDTO } from '../../core/entities';
import { getErrorPattern, getLogPattern } from '../../core/helpers';
import { AsyncTraceStorage } from '../../infrastructure/context/async-trace-storage.service';
import { LoggerFactory } from '../../infrastructure/factories/logger.factory';

@Injectable()
export class LoggerService implements ILoggerService {
  private _trigger: TriggerInDTO = {};

  constructor(
    private readonly logger: Logger = LoggerFactory.createWinston()
  ) {}

  public error(error: any, title: string, ...params: any[]): void {
    const errorPattern = getErrorPattern(error, this.trigger, ...params);
    const errorTitle = title.trim().length ? title.trim() : errorPattern.error.message;

    this.logger.error(errorPattern, errorTitle);
  }

  public info(message: string, ...params: any[]): void {
    const logPattern = getLogPattern(this.trigger, message, ...params);
    this.logger.info(logPattern);
  }

  public warn(message: string, ...params: any[]): void {
    const logPattern = getLogPattern(this.trigger, message, ...params);
    this.logger.warn(logPattern);
  }

  public debug(message: string, ...params: any[]): void {
    const logPattern = getLogPattern(this.trigger, message, ...params);
    this.logger.debug(logPattern);
  }

  public get trigger(): TriggerInDTO {
    return {
      kind: this._trigger.kind,
      methodName: this._trigger.methodName,
      className: this._trigger.className ?? 'MissingClassName',
      id: this._trigger.id,
      causationId: AsyncTraceStorage.causationId,
      correlationId: AsyncTraceStorage.correlationId
    };
  }

  public set trigger(trigger: TriggerInDTO) {
    this._trigger = trigger;
  }
}
```

## 🛠️ **6. CatchException com Builder + Factory + Strategy**

### **Strategy Pattern para Error Handling**
```typescript
// src/core/strategies/error-handling.strategy.ts
export interface ErrorHandlingStrategy {
  handle(context: ErrorContext): ErrorResult;
}

export interface ErrorContext {
  error: any;
  target: any;
  methodName: string;
  args: any[];
  options: CatchExceptionOptions;
}

export interface ErrorResult {
  shouldThrow: boolean;
  returnValue?: any;
  errorToThrow?: any;
}

export class RegisterErrorStrategy implements ErrorHandlingStrategy {
  handle(context: ErrorContext): ErrorResult {
    AsyncTraceStorage.registeredError = {
      error: context.error,
      trigger: this.buildTrigger(context),
      title: this.buildTitle(context),
      params: this.getLogParams(context)
    };

    return {
      shouldThrow: context.options.bubbleException ?? true,
      errorToThrow: context.error
    };
  }

  private buildTrigger(context: ErrorContext): TriggerInDTO {
    return {
      kind: context.options.kind || context.target?.__kind,
      className: context.target.constructor.name,
      methodName: context.methodName
    };
  }

  private buildTitle(context: ErrorContext): string {
    if (!context.options.errorTitle) return '';
    
    return typeof context.options.errorTitle === 'function'
      ? context.options.errorTitle.call(context.target, context.error, context.target, ...context.args)
      : context.options.errorTitle;
  }

  private getLogParams(context: ErrorContext): any[] {
    return getLogParams(context.args, context.options);
  }
}

export class LogAndThrowStrategy implements ErrorHandlingStrategy {
  constructor(private logger: LoggerService) {}

  handle(context: ErrorContext): ErrorResult {
    this.logError(context);

    if (context.options.returnOnException) {
      return {
        shouldThrow: false,
        returnValue: context.options.returnOnException.call(
          context.target, 
          context.error, 
          context.target, 
          ...context.args
        )
      };
    }

    if (context.options.customErrorInstance) {
      return {
        shouldThrow: true,
        errorToThrow: this.buildCustomError(context)
      };
    }

    return {
      shouldThrow: context.options.bubbleException ?? false,
      errorToThrow: context.error
    };
  }

  private logError(context: ErrorContext): void {
    // Implementação de log...
  }

  private buildCustomError(context: ErrorContext): any {
    // Implementação de custom error...
  }
}
```

### **Builder Pattern para Configuração**
```typescript
// src/core/builders/catch-exception.builder.ts
export class CatchExceptionBuilder {
  private options: CatchExceptionOptions = {};

  kind(kind: string): this {
    this.options.kind = kind;
    return this;
  }

  errorTitle(title: string | Function): this {
    this.options.errorTitle = title;
    return this;
  }

  returnOnException(fn: Function): this {
    this.options.returnOnException = fn;
    return this;
  }

  customError(errorClass: any): this {
    this.options.customErrorInstance = errorClass;
    return this;
  }

  bubbleException(bubble: boolean = true): this {
    this.options.bubbleException = bubble;
    return this;
  }

  registerError(): this {
    this.options.typeErrorHandling = 'REGISTER';
    return this;
  }

  sync(): this {
    this.options.isSync = true;
    return this;
  }

  build(): CatchExceptionOptions {
    return { ...this.options };
  }
}
```

### **Factory Simplificada**
```typescript
// src/core/factories/catch-exception.factory.ts
export class CatchExceptionFactory {
  constructor(
    private strategy: ErrorHandlingStrategy,
    private options: CatchExceptionOptions
  ) {}

  createHandler(originalMethod: Function): Function {
    if (this.options.isSync) {
      return this.createSyncHandler(originalMethod);
    }
    return this.createAsyncHandler(originalMethod);
  }

  private createSyncHandler(originalMethod: Function): Function {
    return function(this: any, ...args: any[]): any {
      try {
        return originalMethod.apply(this, args);
      } catch (error) {
        return this.handleError(error, this, originalMethod.name, args);
      }
    }.bind(this);
  }

  private createAsyncHandler(originalMethod: Function): Function {
    return async function(this: any, ...args: any[]): Promise<any> {
      try {
        return await originalMethod.apply(this, args);
      } catch (error) {
        return this.handleError(error, this, originalMethod.name, args);
      }
    }.bind(this);
  }

  private handleError(error: any, target: any, methodName: string, args: any[]): any {
    const context: ErrorContext = {
      error,
      target,
      methodName,
      args,
      options: this.options
    };

    const result = this.strategy.handle(context);

    if (result.shouldThrow) {
      throw result.errorToThrow || error;
    }

    return result.returnValue;
  }
}
```

### **Decorator Refatorado**
```typescript
// src/application/decorators/catch-exception.decorator.ts
export function CatchException(
  optionsOrBuilder?: CatchExceptionOptions | CatchExceptionBuilder,
  logger: LoggerService = new LoggerService()
) {
  return function (
    target: any,
    methodName: string,
    descriptor: PropertyDescriptor
  ): PropertyDescriptor {
    const originalMethod = descriptor.value;
    
    // Resolve options
    const options = optionsOrBuilder instanceof CatchExceptionBuilder 
      ? optionsOrBuilder.build()
      : optionsOrBuilder || {};

    // Select strategy based on options
    const strategy = options.typeErrorHandling === 'REGISTER' 
      ? new RegisterErrorStrategy()
      : new LogAndThrowStrategy(logger);

    // Create factory and handler
    const factory = new CatchExceptionFactory(strategy, options);
    descriptor.value = factory.createHandler(originalMethod);

    persistsMetadata(descriptor.value, originalMethod);
    return descriptor;
  };
}

// Uso com Builder
class UserService {
  @CatchException(
    new CatchExceptionBuilder()
      .kind('Domain')
      .errorTitle('Failed to get user')
      .returnOnException(() => null)
      .bubbleException(false)
      .build()
  )
  async getUser(id: string): Promise<User | null> {
    // implementação
  }

  @CatchException(
    new CatchExceptionBuilder()
      .registerError()
      .bubbleException(true)
      .build()
  )
  async saveUser(user: User): Promise<void> {
    // implementação
  }
}
```