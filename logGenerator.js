const path = require('path');
const Logger = require('./logger');
const fs = require('fs');

const baseDir = path.join(__dirname, 'logs'); // main logs directory
const logger = new Logger(baseDir);

let currentFolder = '';

function randomLogType() {
    return Math.random() < 0.7 ? 'success' : 'error';
}

function randomMessage(type) {
    return type === 'success' ? 'Operation completed successfully' : 'An error occurred';
}

// сreating a new folder every minute
async function createNewFolder() {
    const folderName = new Date().toISOString().replace(/[:.]/g, '-');
    currentFolder = path.join(baseDir, folderName);
    await logger.ensureDir(currentFolder);
    console.log('Created folder:', currentFolder);
}

// сreating a new log file every 10 seconds
async function createLogFile() {
    if (!currentFolder) return;

    const fileName = `log-${new Date().toISOString().replace(/[:.]/g, '-')}.txt`;
    const filePath = path.join(currentFolder, fileName);

    const type = randomLogType();
    const message = randomMessage(type);
    await logger.writeLog(filePath, type, message);

    console.log(`Created log file: ${fileName} (${type})`);
}

// main loops
async function startGenerator() {
    await logger.ensureDir(baseDir);
    await createNewFolder();
    
    // folder every 1 minute
    setInterval(createNewFolder, 60 * 1000);

    // log file every 10 seconds
    setInterval(createLogFile, 10 * 1000);
}

startGenerator();
