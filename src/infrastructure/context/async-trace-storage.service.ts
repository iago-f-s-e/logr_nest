import { AsyncLocalStorage } from 'node:async_hooks';
import { RegisteredError } from '../../types';

export interface AsyncTrace {
  readonly correlationId: string;
  readonly causationId: string;
  registeredError?: RegisteredError;
}

export class AsyncTraceStorage {
  private static instance: AsyncTraceStorage;
  private als: AsyncLocalStorage<AsyncTrace>;

  private constructor() {
    this.als = new AsyncLocalStorage<AsyncTrace>();
  }

  private static getInstance(): AsyncTraceStorage {
    if (!AsyncTraceStorage.instance) {
      AsyncTraceStorage.instance = new AsyncTraceStorage();
    }
    return AsyncTraceStorage.instance;
  }

  private static getStore(): AsyncTrace | undefined {
    return AsyncTraceStorage.getInstance().als.getStore();
  }

  public static run: AsyncLocalStorage<AsyncTrace>['run'] =
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

  public static set registeredError(error: RegisteredError) {
    const store = AsyncTraceStorage.getStore();
    if (!store) return;

    if (!store.registeredError) {
      (store as any).registeredError = error;
    }
  }

  public static get registeredError(): RegisteredError | undefined {
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
