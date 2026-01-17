import fs from "fs";
import path from "path";
import { fileURLToPath, pathToFileURL } from "url";
import { DataTypes } from "sequelize";
import { sequelize } from "../db.js";

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

const db = { sequelize };

// Dynamically load all models
for (const file of fs.readdirSync(dirname)) {
  if (file === "index.js" || !file.endsWith(".js")) continue;

  const modelPath = path.join(dirname, file);
  const moduleURL = pathToFileURL(modelPath).href;

  const modelModule = await import(moduleURL);
  const defineModel = modelModule.default;
  if (!defineModel) continue;

  const model = defineModel(sequelize, DataTypes);
  db[model.name] = model;
}

// Setup associations
Object.values(db).forEach(model => {
  if (model.associate) model.associate(db);
});

console.log("Loaded models:", Object.keys(db));
export default db;
