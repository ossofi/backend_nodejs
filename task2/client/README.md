# Simple Articles App

A simple full-stack application to manage articles — built with **Node.js + Express** on the backend and **React** on the frontend.

---

## Features

### Backend (Node.js + Express)
- Stores articles as JSON files in `/data/`
- Endpoints:
  - `GET /api/articles` — List all articles
  - `GET /api/articles/:id` — Get a single article
  - `POST /api/articles` — Create a new article
- Basic validation for required fields (`title`, `content`)
- CORS enabled for frontend access
- Clear error handling and request logging

### Frontend (React)
- Displays a list of all articles
- Opens a single article view
- Includes a WYSIWYG editor (e.g., **React Quill**) to create new articles
- Posts new articles to the backend API

---

## Tech Stack

| Layer | Technology |
|-------|-------------|
| Frontend | React + React Router + React Quill |
| Backend | Node.js + Express |
| Data Storage | Local filesystem (JSON files) |

---

## Setup Instructions

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd <your-project-folder>
```

### 2. Install dependencies

## Backend

```bash
cd server
npm install
```

## Frontend

```bash
cd ../client
npm install
```

### 3. Run the backend

```bash
npm run dev
Server will start at:
    http://localhost:5050
```

### 4. Run the frontend

```bash
npm run dev
```

- Frontend will start at:
- http://localhost:5173


### Project Structure

task2/
├── client/                 # React frontend
│   ├── src/
│   │   └── components/
│   │       ├── ArticleForm.jsx
│   │       └── ...
│   ├── package.json
│   └── ...
│
├── server/                 # Express backend
│   ├── data/               # Stored articles (.json files)
│   ├── routes.js
│   ├── server.js
│   ├── package.json
│   └── ...
│
└── README.md


#### API Examples
- Get all articles
```bash
curl http://localhost:5050/api/articles
```
- Get one article
```bash
curl http://localhost:5050/api/articles/<article-id>
```
- Create an article
```bash
curl -X POST http://localhost:5050/api/articles \
  -H "Content-Type: application/json" \
  -d '{"title": "My First Post", "content": "Hello World!"}'
```
- Validation & Error Handling
    - Missing title or content → 400 Bad Request
    - Invalid article ID → 404 Not Found
    - Server errors → 500 Internal Server Error
