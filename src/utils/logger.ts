type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'none';

const levelOrder: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
  none: 4,
};

const currentLevel = (import.meta.env.VITE_LOG_LEVEL as LogLevel) || 'info';

function shouldLog(level: LogLevel): boolean {
  return levelOrder[level] >= levelOrder[currentLevel];
}

const logger = {
  debug: (...args: unknown[]) => {
    if (shouldLog('debug')) console.debug(...args);
  },
  info: (...args: unknown[]) => {
    if (shouldLog('info')) console.info(...args);
  },
  warn: (...args: unknown[]) => {
    if (shouldLog('warn')) console.warn(...args);
  },
  error: (...args: unknown[]) => {
    if (shouldLog('error')) console.error(...args);
  },
};

export default logger;
