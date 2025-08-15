import { context, trace } from '@opentelemetry/api';
import { LogLevel, LogExportConfig } from './types/logging';
import { ExportService } from './ExportService';

export class Logger {
  private exportService: ExportService;

  constructor(
    private readonly context: string,
    private level: LogLevel = LogLevel.INFO,
    config?: LogExportConfig
  ) {
    this.exportService = new ExportService(config);
  }

  private shouldLog(level: LogLevel): boolean {
    return level >= this.level;
  }

  private formatMessage(level: string, message: string, correlationId?: string): string {
    const spanContext = trace.getSpanContext(context.active());
    const traceId = spanContext?.traceId || 'no-trace';
    const cid = correlationId || traceId;
    
    return `[${new Date().toISOString()}] [${level}] [${this.context}] [CID:${cid}] ${message}`;
  }

  setLevel(level: LogLevel): void {
    this.level = level;
  }

  async info(message: string, data?: any, correlationId?: string) {
    if (this.shouldLog(LogLevel.INFO)) {
      const logMessage = this.formatMessage('INFO', message, correlationId);
      console.log(logMessage);
      await this.exportService.export({
        level: 'INFO',
        message,
        context: this.context,
        correlationId,
        data,
        timestamp: new Date().toISOString()
      });
    }
  }

  warn(message: string, correlationId?: string, ...args: any[]) {
    if (this.shouldLog(LogLevel.WARN)) {
      console.warn(this.formatMessage('WARN', message, correlationId), ...args);
    }
  }

  error(message: string, correlationId?: string, ...args: any[]) {
    if (this.shouldLog(LogLevel.ERROR)) {
      console.error(this.formatMessage('ERROR', message, correlationId), ...args);
    }
  }

  debug(message: string, correlationId?: string, ...args: any[]) {
    if (this.shouldLog(LogLevel.DEBUG)) {
      console.debug(this.formatMessage('DEBUG', message, correlationId), ...args);
    }
  }

  // Pour l'export vers les systèmes de monitoring
  toOpenTelemetry() {
    return {
      context: this.context,
      level: this.level
    };
  }
}