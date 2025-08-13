'use strict';

const isProd = process.env.NODE_ENV === 'production';

function log(method, message) {
  if (isProd) return;
  console[method](message);
}

module.exports = {
  info: (msg) => log('log', msg),
  warn: (msg) => log('warn', msg),
  error: (msg) => log('error', msg),
};
