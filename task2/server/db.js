import fs from "fs";
import path from "path";
import { Sequelize } from "sequelize";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rawConfig = fs.readFileSync(path.join(__dirname, "config/config.json"));
const configFile = JSON.parse(rawConfig);

const env = process.env.NODE_ENV || "development";
const config = configFile[env];

export const sequelize = new Sequelize(
  config.database,
  config.username,
  config.password,
  config
);

export async function initDB() {
  try {
    await sequelize.authenticate();
    console.log("DB connected.");
  } catch (err) {
    console.error("Unable to connect to DB:", err);
  }
}
