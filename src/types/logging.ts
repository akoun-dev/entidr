export interface LoggingConfig {
  level: 'error' | 'warn' | 'info' | 'debug';
  retentionDays: number;
  consoleOutput: boolean;
  fileOutput: boolean;
  filePath?: string;
}

export type UpdateLoggingConfigDto = Partial<LoggingConfig>;
