'use strict';

const { z } = require('zod');

// Creates an Express middleware that validates req[part] with a Zod schema.
// On success, replaces req[part] with the parsed value.
// On failure, responds with res.fail(400, 'Validation error', { errors })
function zodValidate(schema, part = 'body') {
  return (req, res, next) => {
    try {
      const result = schema.parse(req[part] ?? {});
      req[part] = result;
      next();
    } catch (e) {
      if (e && e.issues) {
        return res.fail(400, 'Validation error', { errors: e.issues });
      }
      return res.fail(400, 'Validation error');
    }
  };
}

module.exports = { zodValidate, z: z };

