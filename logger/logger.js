const fs = require('fs');
const { LOG_LEVELS } = require('../shared/constants');

class Logger {
  constructor(filePath) {
    this.filePath = filePath;
  }

  async write(level, msg, meta = {}) {
    const entry = {
      ts: new Date().toISOString(),
      level,
      msg,
      meta,
    };
    await fs.promises.appendFile(this.filePath, JSON.stringify(entry) + '\n');
  }

  async success(msg, meta) { return this.write(LOG_LEVELS.SUCCESS, msg, meta); }
  async error(msg, meta)   { return this.write(LOG_LEVELS.ERROR, msg, meta); }
  async warn(msg, meta)    { return this.write(LOG_LEVELS.WARN, msg, meta); }
  async info(msg, meta)    { return this.write(LOG_LEVELS.INFO, msg, meta); }
}

module.exports = { Logger };
