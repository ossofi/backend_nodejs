# Node.js Backend – Setup & Database Migration Guide

This document explains how to configure the backend server, install dependencies, set up PostgreSQL, run Sequelize migrations, and start the API.

The backend uses PostgreSQL, Sequelize, and UUID-based primary keys for tables.

---

## Project Structure

server/
├── migrations/      # Sequelize migrations (UUID-based)
├── models/          # Sequelize models
├── routes/          # API routes
├── uploads/         # Stored files
├── data/            # Optional JSON data
├── db.js            # Sequelize initialization
├── app.js           # Express setup
└── server.js        # Entry point

---

## Requirements

* Node.js ≥ 18
* npm
* PostgreSQL ≥ 14
* sequelize-cli (dev dependency)

---

## PostgreSQL Setup

### 1. Create the database

```sql
CREATE DATABASE articlesdb;
```

### 2. Environment Variables

Create a `.env` file inside `server/`:

```
PORT=5050
DB_USER=postgres
DB_PASSWORD=YOUR_PASSWORD
DB_NAME=articlesdb
DB_HOST=127.0.0.1
DATABASE_URL=postgres://postgres:YOUR_PASSWORD@127.0.0.1:5432/articlesdb
```

> ⚠️ Never commit `.env` to the repository. Use placeholders in docs.

---

## Install Dependencies

Inside `server/`:

```
npm install
```

---

## Sequelize Configuration

`server/config/config.json`:

```json
{
  "development": {
    "use_env_variable": "DATABASE_URL",
    "dialect": "postgres"
  },
  "production": {
    "use_env_variable": "DATABASE_URL",
    "dialect": "postgres"
  }
}
```

`.sequelizerc`:

```js
const path = require('path');

module.exports = {
  config: path.resolve(__dirname, 'config', 'config.json'),
  modelsPath: path.resolve(__dirname, 'models'),
  migrationsPath: path.resolve(__dirname, 'migrations'),
  seedersPath: path.resolve(__dirname, 'seeders'),
};
```

`db.js`:

```js
import dotenv from 'dotenv';
import { Sequelize } from 'sequelize';
dotenv.config();

export const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  logging: false,
});

export async function initDB() {
  try {
    await sequelize.authenticate();
    console.log('DB connected.');
  } catch (err) {
    console.error('Unable to connect to DB:', err);
  }
}
```

---

## Running Migrations

Inside `server/`:

```
npm run migrate
```

If needed, undo all migrations:

```
npm run migrate:undo
```

> Ensure PostgreSQL is running and `.env` variables are correct.

---

## Starting the Server

```
npm start
```

Server runs at:

```
http://localhost:5050
```

---

## Testing the API

### Get all workspaces

```
GET /api/workspaces
```

### Create a workspace

```
POST /api/workspaces
{
  "name": "My Workspace"
}
```

### Create an article

```
POST /api/articles
{
  "title": "Hello World",
  "content": "Text...",
  "workspaceId": "UUID_HERE"
}
```

### Post a comment

```
POST /api/comments
{
  "text": "Nice post!",
  "articleId": "UUID_HERE"
}
```

---

## File Uploads

Uploads go to `server/uploads/` and are handled via `multer`.

---

## Frontend (Client) Setup

Client is React + Vite.

```
cd ../client
npm install
npm run dev
```

Runs at `http://localhost:5173`.

---

## Troubleshooting

* Ensure PostgreSQL is running.
* Use UUIDs in models:

```js
type: DataTypes.UUID,
defaultValue: DataTypes.UUIDV4
```

* If migrations fail, delete `node_modules` and reinstall.
* Avoid committing passwords; always use `.env`.

---

## ✅ Finished

Backend is ready with UUID-based migrations, API routing, file uploads, and PostgreSQL setup.")
