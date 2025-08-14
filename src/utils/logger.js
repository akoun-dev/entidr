const levelOrder = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
  none: 4,
};

const currentLevel = process.env.LOG_LEVEL || 'info';

function shouldLog(level) {
  return levelOrder[level] >= levelOrder[currentLevel];
}

module.exports = {
  debug: (...args) => {
    if (shouldLog('debug')) console.debug(...args);
  },
  info: (...args) => {
    if (shouldLog('info')) console.info(...args);
  },
  warn: (...args) => {
    if (shouldLog('warn')) console.warn(...args);
  },
  error: (...args) => {
    if (shouldLog('error')) console.error(...args);
  },
};
