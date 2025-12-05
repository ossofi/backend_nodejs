import fs from "fs";
import path from "path";
import { Sequelize, DataTypes } from "sequelize";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import { sequelize } from "../db.js";

const db = { sequelize, Sequelize };

for (const file of fs.readdirSync(__dirname)) {
  if (file === "index.js" || !file.endsWith(".js")) continue;

  const modelModule = await import(path.join(__dirname, file));
  const defineModel = modelModule.default;
  if (!defineModel) continue;

  const model = defineModel(sequelize, DataTypes);
  db[model.name] = model;
}

// Setup associations if present
Object.keys(db).forEach(name => {
  if (db[name].associate) db[name].associate(db);
});

console.log("Loaded models:", Object.keys(db));
export default db;
