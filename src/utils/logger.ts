type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'none';

const levelOrder: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2, 
  error: 3,
  none: 4,
};

const currentLevel: LogLevel = (typeof process !== 'undefined' ? (process.env.LOG_LEVEL as LogLevel) : null) || 'info';

function shouldLog(level: LogLevel): boolean {
  return levelOrder[level] >= levelOrder[currentLevel];
}

export const debug = (...args: any[]): void => {
  if (shouldLog('debug')) console.debug(...args);
};

export const info = (...args: any[]): void => {
  if (shouldLog('info')) console.info(...args);
};

export const warn = (...args: any[]): void => {
  if (shouldLog('warn')) console.warn(...args);
};

export const error = (...args: any[]): void => {
  if (shouldLog('error')) console.error(...args);
};
