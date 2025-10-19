const path = require('path');
const fs = require('fs');
const Logger = require('./logger');

const baseDir = path.join(__dirname, 'logs'); // root logs folder

// parsing optional CLI filter
const args = process.argv.slice(2);
let filterType = null;
args.forEach(arg => {
    if (arg.startsWith('--type=')) filterType = arg.split('=')[1];
});

async function analyzeLogs() {
    let counts = { success: 0, error: 0 }; // counters for log types

    try {
        const folders = await fs.promises.readdir(baseDir); // reading log folders
        for (const folder of folders) {
            const folderPath = path.join(baseDir, folder);
            const files = await fs.promises.readdir(folderPath);

            for (const file of files) {
                const filePath = path.join(folderPath, file);
                const data = await fs.promises.readFile(filePath, 'utf8'); // reading file content
                const lines = data.split('\n').filter(Boolean);

                for (const line of lines) {
                    try {
                        const log = JSON.parse(line); // parsing log
                        if (!filterType || log.type === filterType) { // counting if matches filter
                            if (log.type in counts) counts[log.type]++;
                        }
                    } catch {
                        // skipping bad lines
                    }
                }
            }
        }

        console.log('Log Analysis:');
        console.log(counts);
    } catch {
        console.error('Error reading logs'); // general read error
    }
}

analyzeLogs(); // starting analysis
