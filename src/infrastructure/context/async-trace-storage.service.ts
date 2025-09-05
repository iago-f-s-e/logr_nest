import { AsyncLocalStorage } from 'node:async_hooks';
import { ErrorContext, LogContext } from '../../types';

export class AsyncTraceStorage {
  private static instance: AsyncTraceStorage;
  private als: AsyncLocalStorage<LogContext>;

  private constructor() {
    this.als = new AsyncLocalStorage<LogContext>();
  }

  private static getInstance(): AsyncTraceStorage {
    if (!AsyncTraceStorage.instance) {
      AsyncTraceStorage.instance = new AsyncTraceStorage();
    }
    return AsyncTraceStorage.instance;
  }

  private static getStore(): LogContext | undefined {
    return AsyncTraceStorage.getInstance().als.getStore();
  }

  public static run: AsyncLocalStorage<LogContext>['run'] =
    AsyncTraceStorage.getInstance().als.run.bind(
      AsyncTraceStorage.getInstance().als,
    );

  public static get outsideAsyncContext(): boolean {
    return AsyncTraceStorage.getStore() === undefined;
  }

  public static get correlationId(): string | undefined {
    return AsyncTraceStorage.getStore()?.correlationId;
  }

  public static set correlationId(value: string | undefined) {
    const store = AsyncTraceStorage.getStore();
    if (store && value) {
      (store as any).correlationId = value;
    }
  }

  public static get causationId(): string | undefined {
    return AsyncTraceStorage.getStore()?.causationId;
  }

  public static set causationId(value: string | undefined) {
    const store = AsyncTraceStorage.getStore();
    if (store && value) {
      (store as any).causationId = value;
    }
  }

  public static set registeredError(dto: ErrorContext) {
    const store = AsyncTraceStorage.getStore();
    if (!store) return;

    if (!store.registeredError) {
      (store as any).registeredError = dto;
    }
  }

  public static get registeredError(): ErrorContext | undefined {
    return AsyncTraceStorage.getStore()?.registeredError;
  }

  public static clearRegisteredError(): void {
    const store = AsyncTraceStorage.getStore();
    if (store) {
      (store as any).registeredError = undefined;
    }
  }

  public static getTraceIds() {
    const store = AsyncTraceStorage.getStore();
    return {
      correlationId: store?.correlationId,
      causationId: store?.causationId,
    };
  }
}
