const path = require('path');

const BASE_LOG_DIR = path.join(__dirname, '..', 'logs');

const LOG_LEVELS = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARN: 'warn',
  INFO: 'info',
};

module.exports = { BASE_LOG_DIR, LOG_LEVELS };
