import fs from "fs";

export function ensureDirs(...dirs) {
  dirs.forEach(dir => {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  });
}
