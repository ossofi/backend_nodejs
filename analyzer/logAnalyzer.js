const fs = require('fs');
const path = require('path');
const { LOG_LEVELS, BASE_LOG_DIR } = require('../shared/constants');

async function analyzeLogs(filterType = null) {
  const counts = {
    [LOG_LEVELS.SUCCESS]: 0,
    [LOG_LEVELS.ERROR]: 0,
    [LOG_LEVELS.WARN]: 0,
    [LOG_LEVELS.INFO]: 0,
  };

  if (!fs.existsSync(BASE_LOG_DIR)) {
    console.error('There are no logs available. Please run the generator first.');
    return;
  }

  const folders = await fs.promises.readdir(BASE_LOG_DIR);
  for (const folder of folders) {
    const folderPath = path.join(BASE_LOG_DIR, folder);
    const files = await fs.promises.readdir(folderPath);

    for (const file of files) {
      const filePath = path.join(folderPath, file);
      const content = await fs.promises.readFile(filePath, 'utf8');
      const lines = content.split('\n').filter(Boolean);

      for (const line of lines) {
        try {
          const log = JSON.parse(line);
          if (log.level && counts.hasOwnProperty(log.level)) {
            counts[log.level]++;
          }
        } catch {
          // skip malformed
        }
      }
    }
  }

  if (filterType) {
    if (!(filterType in counts)) {
      console.error(`Unknown type "${filterType}". Available: ${Object.values(LOG_LEVELS).join(', ')}`);
      return;
    }
    console.log({ [filterType]: counts[filterType] });
  } else {
    console.log(counts);
  }
}

const args = process.argv.slice(2);
let filterType = null;
const typeArg = args.find(a => a.startsWith('--type='));
if (typeArg) filterType = typeArg.split('=')[1];

analyzeLogs(filterType);
