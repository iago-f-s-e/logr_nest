## 📁 **Diagrama de Arquivos e Pastas**

```
src/
├── core/                                    # 🎯 Domain Layer (Business Logic)
│   ├── interfaces/
│   │   ├── logger.interface.ts             # Contrato do logger
│   │   ├── logger-service.interface.ts     # Contrato do service
│   │   ├── error-handling-strategy.interface.ts  # Strategy para errors
│   │   └── index.ts
│   ├── enums/
│   │   ├── log-level.enum.ts              # Níveis de log
│   │   ├── error-handling-type.enum.ts    # Tipos de error handling
│   │   └── index.ts
│   ├── strategies/
│   │   ├── register-error.strategy.ts      # Strategy para registrar erros
│   │   ├── log-and-throw.strategy.ts       # Strategy para log + throw
│   │   ├── suppress-error.strategy.ts      # Strategy para suprimir erros
│   │   └── index.ts
│   └── helpers/
│       ├── get-log-pattern.helper.ts       # Helper para pattern de log
│       ├── get-error-pattern.helper.ts     # Helper para pattern de erro
│       ├── get-log-params.helper.ts        # Helper para params de log
│       └── index.ts
│
├── infrastructure/                          # 🔧 Infrastructure Layer
│   ├── context/
│   │   ├── async-trace-storage.service.ts  # AsyncLocalStorage management
│   │   └── index.ts
│   ├── winston/
│   │   ├── logger-winston.adapter.ts       # Winston adapter
│   │   ├── winston-config.interface.ts     # Configurações Winston
│   │   └── index.ts
│   ├── factories/
│   │   ├── logger.factory.ts               # Factory para loggers
│   │   ├── catch-exception.factory.ts      # Factory para exception handling
│   │   └── index.ts
│   ├── formatters/
│   │   ├── json.formatter.ts               # Formatter JSON
│   │   ├── pretty.formatter.ts             # Formatter pretty print
│   │   └── index.ts
│
├── application/                             # 🚀 Application Layer
│   ├── services/
│   │   ├── logger.service.ts               # Serviço principal de logging
│   │   └── index.ts
│   ├── decorators/
│   │   ├── catch-exception.decorator.ts    # Decorator principal
│   │   ├── log-method.decorator.ts         # Decorator para métodos
│   │   └── index.ts
│
├── nest/                                    # 🏠 NestJS Integration Layer
│   ├── interceptors/
│   │   ├── logging.interceptor.ts          # Interceptor global NestJS
│   │   ├── logging-config.interface.ts     # Configurações do interceptor
│   │   └── index.ts
│   ├── modules/
│   │   ├── logging.module.ts               # Módulo principal
│   │   ├── logging-config.module.ts        # Módulo de configuração
│   │   └── index.ts
│   ├── providers/
│   │   ├── logger.provider.ts              # Provider do logger
│   │   ├── interceptor.provider.ts         # Provider do interceptor
│   │   └── index.ts
│   └── constants/
│       ├── injection-tokens.ts             # Tokens de injeção
│       └── index.ts
│
├── types/                                   # 📝 Type Definitions
│   ├── dtos/
│   │   ├── log-pattern.dto.ts              # DTOs de patterns
│   │   ├── error-pattern.dto.ts            # DTOs de erro
│   │   ├── trigger.dto.ts                  # DTOs de trigger
│   │   └── index.ts
│   ├── options/
│   │   ├── catch-exception-options.type.ts # Opções do decorator
│   │   ├── logging-options.type.ts         # Opções de logging
│   │   └── index.ts
│   └── index.ts
│
├── utils/                                   # 🛠️ Utilities
│   ├── metadata.util.ts                    # Utilitários de metadata
│   ├── stack-trace.util.ts                 # Utilitários de stack trace
│   └── index.ts
│
└── index.ts                                # 📦 Main Export File
```

## 🔗 **Diagrama de Dependências**

```mermaid
graph TB
    %% NestJS Integration Layer
    App[NestJS Application] --> LoggingModule[LoggingModule]
    LoggingModule --> LoggingConfigModule[LoggingConfigModule]
    LoggingModule --> LoggerProvider[LoggerProvider]
    LoggingModule --> InterceptorProvider[InterceptorProvider]
    InterceptorProvider --> LoggingInterceptor[LoggingInterceptor]
    LoggingInterceptor --> LoggerService
    LoggingInterceptor --> AsyncTraceStorage[AsyncTraceStorage]
    LoggerProvider --> LoggerService[LoggerService]

    %% Application Layer
    CatchExceptionDecorator[CatchExceptionDecorator] --> LoggerService
    CatchExceptionDecorator --> CatchExceptionFactory[CatchExceptionFactory]

    %% Core Business Logic
    LoggerService --> LoggerInterface[Logger Interface]
    LoggerService --> AsyncTraceStorage
    LoggerService --> LogPatternHelper[LogPatternHelper]
    LoggerService --> ErrorPatternHelper[ErrorPatternHelper]

    CatchExceptionFactory --> ErrorHandlingStrategy[ErrorHandlingStrategy]

    ErrorHandlingStrategy --> RegisterErrorStrategy[RegisterErrorStrategy]
    ErrorHandlingStrategy --> LogAndThrowStrategy[LogAndThrowStrategy]
    ErrorHandlingStrategy --> SuppressErrorStrategy[SuppressErrorStrategy]

    RegisterErrorStrategy --> AsyncTraceStorage
    LogAndThrowStrategy --> LoggerService

    %% Infrastructure Layer
    LoggerInterface --> LoggerFactory[LoggerFactory]
    LoggerFactory --> LoggerWinston[LoggerWinston]
    LoggerFactory --> LoggerConsole[LoggerConsole]

    LoggerWinston --> WinstonConfig[WinstonConfig]
    LoggerWinston --> JsonFormatter[JsonFormatter]
    LoggerWinston --> PrettyFormatter[PrettyFormatter]

    %% External Dependencies
    LoggerWinston --> Winston[Winston Library]
    AsyncTraceStorage --> NodeAsyncHooks[Node.js async_hooks]

    %% Style classes
    classDef nestLayer fill:#e1f5fe
    classDef appLayer fill:#f3e5f5
    classDef coreLayer fill:#e8f5e8
    classDef infraLayer fill:#fff3e0
    classDef external fill:#ffebee

    class App,LoggingModule,LoggingConfigModule,LoggerProvider,InterceptorProvider nestLayer
    class LoggerService,LoggingInterceptor,CatchExceptionDecorator appLayer
    class LoggerInterface,ErrorHandlingStrategy,LogPatternHelper,ErrorPatternHelper coreLayer
    class AsyncTraceStorage,LoggerFactory,LoggerWinston,LostErrorMonitor,PerformanceMonitor,PluginSystem infraLayer
    class Winston,NodeAsyncHooks external
```

## 🌊 **Fluxograma de Dados - Request Lifecycle**

```mermaid
sequenceDiagram
    participant Client
    participant NestApp as NestJS App
    participant Interceptor as LoggingInterceptor
    participant AsyncStorage as AsyncTraceStorage
    participant Controller
    participant Service
    participant Decorator as @CatchException
    participant Strategy as ErrorStrategy
    participant Logger as LoggerService
    participant Winston as WinstonAdapter

    %% Request Start
    Client->>NestApp: HTTP Request
    NestApp->>Interceptor: intercept()

    %% Context Setup
    Interceptor->>Interceptor: Extract/Generate trace IDs
    Interceptor->>AsyncStorage: run(logContext, callback)
    Note over AsyncStorage: Store: correlationId, causationId

    %% Request Logging
    Interceptor->>Logger: info("Request started")
    Logger->>AsyncStorage: getContext()
    Logger->>Logger: buildLogPattern()
    Logger->>Winston: log(pattern)

    %% Controller Execution
    Interceptor->>Controller: handle request
    Controller->>Service: business logic

    %% Happy Path
    alt Success Case
        Service-->>Controller: result
        Controller-->>Interceptor: response
        Interceptor->>Logger: info("Request completed")
        Logger->>Winston: log(success pattern)
        Interceptor-->>Client: HTTP Response

    %% Error Path
    else Error Case
        Service->>Decorator: method throws error

        %% Decorator Processing
        Decorator->>Strategy: handle(errorContext)

        alt Register Strategy
            Strategy->>AsyncStorage: set registeredError
            Strategy-->>Service: throw/return based on config
        else Log and Throw Strategy
            Strategy->>Logger: error(errorPattern)
            Logger->>AsyncStorage: getContext()
            Logger->>Winston: log(error pattern)
            Strategy-->>Service: throw customError
        else Suppress Strategy
            Strategy->>Logger: warn(suppressedError)
            Strategy-->>Service: return fallback value
        end

        %% Back to Interceptor
        Service-->>Interceptor: error/result

        %% Interceptor Error Handling
        Interceptor->>AsyncStorage: get registeredError

        alt Has Registered Error
            Interceptor->>Logger: error("Handled exception", registeredError)
            Interceptor->>AsyncStorage: clearRegisteredError()
        else Unhandled Error
            Interceptor->>Logger: error("Unhandled exception", error)
        end

        Interceptor->>Winston: log(final error pattern)
        Interceptor-->>Client: HTTP Error Response
    end

    %% Cleanup
    Note over AsyncStorage: Context automatically cleaned up
```

## 📋 **Sprint Planning - Tasks Breakdown**

### 🏃‍♂️ **Sprint 3: NestJS Integration & Decorators (8-10 dias)**

#### **Epic 3.1: NestJS Interceptor**

- **LGR-013** 🎪 Implement configurable LoggingInterceptor

  - Estimativa: 4 dias
  - Prioridade: Critical
  - Dependências: LGR-008, LGR-004
  - AC: Interceptor com configurações forRoot funcionando

- **LGR-014** 🧪 Integration tests for interceptor
  - Estimativa: 2 dias
  - Prioridade: High
  - Dependências: LGR-013
  - AC: Tests E2E do interceptor com diferentes configurações

#### **Epic 3.2: Exception Decorator**

- **LGR-015** 🎭 Implement @CatchException decorator

  - Estimativa: 3 dias
  - Prioridade: Critical
  - Dependências: LGR-012
  - AC: Decorator funcionando com builder e estratégias

- **LGR-016** ✅ Implement decorator validation system
  - Estimativa: 1 dia
  - Prioridade: Medium
  - Dependências: LGR-015
  - AC: Validação de configurações conflitantes

---

### 🏃‍♂️ **Sprint 5: NestJS Modules & Integration (5-7 dias)**

#### **Epic 5.1: NestJS Modules**

- **LGR-021** 🏠 Create LoggingModule with providers

  - Estimativa: 3 dias
  - Prioridade: Critical
  - Dependências: LGR-013, LGR-015
  - AC: Módulo exportando todos os services corretamente

- **LGR-022** ⚙️ Implement LoggingConfigModule.forRoot()
  - Estimativa: 2 dias
  - Prioridade: High
  - Dependências: LGR-021
  - AC: Configuração dinâmica do módulo funcionando

#### **Epic 5.2: Final Integration**

- **LGR-023** 🔗 Integration tests E2E complete flow
  - Estimativa: 2 dias
  - Prioridade: High
  - Dependências: LGR-022
  - AC: Teste completo request -> interceptor -> decorator -> log

---

### 🏃‍♂️ **Sprint 6: Documentation (4-5 dias)**

#### **Epic 6.2: Documentation**

- **LGR-025** 📚 Complete API documentation
  - Estimativa: 2 dias
  - Prioridade: High
  - Dependências: LGR-023
  - AC: README, API docs, examples de uso
