# Node.js Backend – Setup & Database Migration Guide

This README explains how to configure the backend server, install dependencies, set up PostgreSQL, run Sequelize migrations, and start the API.

---

## 📁 Project Structure

```
server/
├── migrations/      # Sequelize migrations (UUID-based)
├── models/          # Sequelize models
├── routes/          # API routes
├── uploads/         # Stored files
├── data/            # Optional JSON data
├── db.js            # Sequelize initialization
├── app.js           # Express setup
└── server.js        # Entry point
```

---

## 🚀 Requirements

Install:

* **Node.js ≥ 18**
* **npm**
* **PostgreSQL ≥ 14**
* **sequelize-cli**

---

## 🗄️ PostgreSQL Setup

### 1️⃣ Create the database

```sql
CREATE DATABASE articlesdb;
```

### 2️⃣ Ensure config matches your PostgreSQL user

`server/config/config.json`

```
"username": "postgres",
"password": "9420",
"database": "articlesdb",
"host": "127.0.0.1",
"dialect": "postgres"
```

Modify if needed.

---

## 🛠️ Install Dependencies

Inside **server/**:

```
npm install
```

---

## 🧱 Running Migrations

Migrations live in:

```
server/migrations/
```

### 1️⃣ Install Sequelize CLI

Global:

```
npm install --global sequelize-cli
```

Or local:

```
npm install --save-dev sequelize-cli
```

### 2️⃣ Run migrations

```
npx sequelize-cli db:migrate
```

This creates tables with **UUID primary keys**:

* Workspaces
* Articles
* Comments

---

## ▶️ Starting the Server

From inside **server/**:

```
npm start
```

Server starts on:

```
http://localhost:3000
```

---

## 🧪 Testing the API

### ✔ Get all workspaces

```
GET /api/workspaces
```

### ✔ Create a workspace

```
POST /api/workspaces
{
  "name": "My Workspace"
}
```

### ✔ Create an article

```
POST /api/articles
{
  "title": "Hello World",
  "content": "Text...",
  "workspaceId": "UUID_HERE"
}
```

### ✔ Post a comment

```
POST /api/comments
{
  "text": "Nice post!",
  "articleId": "UUID_HERE"
}
```

---

## 🗂 File Uploads

Uploads go to:

```
server/uploads/
```

Handled via `multer`.

---

## 🔧 Environment Variables

Create `.env` in **server/**:

```
PORT=3000
DB_USER=postgres
DB_PASS=9420
DB_NAME=articlesdb
DB_HOST=127.0.0.1
```

---

## 🛑 Troubleshooting

### ❌ Migration errors

* Ensure PostgreSQL is running
* Delete `server/node_modules` and reinstall
* Try resetting:

```
npx sequelize-cli db:migrate:undo:all
npx sequelize-cli db:migrate
```

### ❌ UUID relation issues

Make sure all models use:

```
type: DataTypes.UUID,
defaultValue: DataTypes.UUIDV4
```

---

## ✅ Finished

Your backend is now ready with UUID-based migrations, API routing, file uploads, and PostgreSQL setup.

---

# 🎨 Frontend (Client) Setup

The client is a React + Vite application.

## ▶️ Install Dependencies

```
cd ../client
npm install
```

## ▶️ Run the Frontend

```
npm run dev
```

Runs at:

```
http://localhost:5173
```

## 📁 Client Folder Structure

```
client/
├── src/
│   ├── components/
│   ├── pages/
│   ├── hooks/
│   ├── context/
│   ├── assets/
│   └── main.jsx
├── public/
└── index.html
```

The client communicates with the backend API and listens for real‑time updates through Socket.IO.
