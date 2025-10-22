const fs = require('fs');
const path = require('path');
const { Logger } = require('../logger/logger');
const { LOG_LEVELS, BASE_LOG_DIR } = require('../shared/constants');

fs.mkdirSync(BASE_LOG_DIR, { recursive: true });

function randomChoice(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function formatTimeUnit(num) {
  return String(num).padStart(2, '0');
}

function makeFolderName() {
  const now = new Date();
  return `${now.getFullYear()}-${formatTimeUnit(now.getMonth()+1)}-${formatTimeUnit(now.getDate())}_${formatTimeUnit(now.getHours())}-${formatTimeUnit(now.getMinutes())}`;
}

function makeFileName() {
  const now = new Date();
  return `log_${formatTimeUnit(now.getHours())}-${formatTimeUnit(now.getMinutes())}-${formatTimeUnit(now.getSeconds())}.log`;
}

async function ensureFolder() {
  const folderName = makeFolderName();
  const folderPath = path.join(BASE_LOG_DIR, folderName);
  await fs.promises.mkdir(folderPath, { recursive: true });
  return folderPath;
}

async function writeRandomLogFile(folderPath) {
  const filePath = path.join(folderPath, makeFileName());
  const logger = new Logger(filePath);

  const levels = Object.values(LOG_LEVELS);
  const count = 10 + Math.floor(Math.random() * 11); // 10–20 entries

  for (let i = 0; i < count; i++) {
    const level = randomChoice(levels);
    await logger.write(level, `random ${level} message`, { index: i + 1 });
  }

  console.log(`[generator] wrote ${count} logs → ${filePath}`);
}

async function main() {
  setInterval(async () => {
    const folder = await ensureFolder();
    await writeRandomLogFile(folder);
  }, 10 * 1000);
}

main();
