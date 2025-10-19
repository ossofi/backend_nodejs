const fs = require('fs');
const path = require('path');

class Logger {
    constructor(logDir) {
        this.logDir = logDir;
    }

    // ensuring folder exists
    async ensureDir(dir) {
        try {
            await fs.promises.mkdir(dir, { recursive: true });
        } catch (err) {
            console.error(`Failed to create directory ${dir}:`, err.message);
        }
    }

    // writing log entry to file
    async writeLog(filePath, type, message) {
        const logEntry = {
            timestamp: new Date().toISOString(),
            type,
            message
        };
        try {
            await fs.promises.appendFile(filePath, JSON.stringify(logEntry) + '\n');
        } catch (err) {
            console.error(`Failed to write log:`, err.message);
        }
    }
}

module.exports = Logger;
