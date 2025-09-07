'use strict';

module.exports = function responseEnvelope(req, res, next) {
  res.ok = (data, status = 200) => res.status(status).json({ data, error: null });
  res.fail = (status, message, extra = {}) =>
    res.status(status).json({ data: null, error: { message, ...extra } });
  next();
};

