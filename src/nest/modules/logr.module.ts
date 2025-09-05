import { DynamicModule, Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { LoggerService } from '../../application/services';
import { LogrInterceptor, LogrInterceptorConfig } from '../interceptors';

const defaultConfig: LogrInterceptorConfig = {
  excludePaths: ['/health'],
  logRequestStart: true,
  logRequestEnd: true,
  logUnhandledErrors: true,
};

@Module({
  providers: [
    LoggerService,
    LogrInterceptor.forRoot({
      logRequestStart: true,
      logRequestEnd: true,
      excludePaths: ['/health'],
    }),
    {
      provide: APP_INTERCEPTOR,
      useClass: LogrInterceptor,
    },
  ],
  exports: [LoggerService],
})
// biome-ignore lint/complexity/noStaticOnlyClass: <explanation>
export class LogrModule {
  public static forRoot(): DynamicModule {
    return {
      global: true,
      module: LogrModule,
      providers: [LoggerService],
      exports: [LoggerService],
    };
  }

  public static registerInterceptorForRoot(
    config: LogrInterceptorConfig = defaultConfig,
  ): DynamicModule {
    return {
      module: LogrModule,
      providers: [
        LogrInterceptor.forRoot({ ...defaultConfig, ...config }),
        {
          provide: APP_INTERCEPTOR,
          useClass: LogrInterceptor,
        },
      ],
    };
  }

  public static registerInterceptorForFeature(
    config: LogrInterceptorConfig = defaultConfig,
  ): DynamicModule {
    return {
      module: LogrModule,
      providers: [LogrInterceptor.forRoot({ ...defaultConfig, ...config })],
    };
  }
}
