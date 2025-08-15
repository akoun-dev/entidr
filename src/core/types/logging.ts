export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  SILENT = 4
}

export interface LogExportConfig {
  elkEndpoint: string;
  prometheusEndpoint: string;
  samplingRate?: number;
  grafanaEndpoint?: string;
}

export interface LogContext {
  correlationId: string;
  traceId?: string;
  spanId?: string;
  service: string;
}