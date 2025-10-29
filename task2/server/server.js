import express from "express";
import cors from "cors";
import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import helmet from "helmet";

const app = express();
const PORT = process.env.PORT || 5050;

// Middleware
app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json());

// Helmet (disable strict CSP for dev)
app.use(
  helmet({
    contentSecurityPolicy: false, // disable for development
  })
);

const DATA_DIR = path.join(path.resolve(), "data");
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Log all incoming requests
app.use((req, _res, next) => {
  console.log(`➡ ${req.method} ${req.url}`);
  next();
});

// Routes
app.get("/api/articles", async (_req, res, next) => {
  try {
    const files = fs.readdirSync(DATA_DIR).filter(f => f.endsWith(".json"));
    const articles = files.map(f => {
      const data = JSON.parse(fs.readFileSync(path.join(DATA_DIR, f), "utf-8"));
      return data;
    });
    res.json({ data: articles });
  } catch (err) {
    next(err);
  }
});

app.get("/api/articles/:id", async (req, res, next) => {
  try {
    const file = path.join(DATA_DIR, `${req.params.id}.json`);
    if (!fs.existsSync(file)) return res.status(404).json({ error: "Not found" });
    const article = JSON.parse(fs.readFileSync(file, "utf-8"));
    res.json({ data: article });
  } catch (err) {
    next(err);
  }
});

app.post("/api/articles", async (req, res, next) => {
  try {
    const { title, content } = req.body;
    if (!title || !content) return res.status(400).json({ error: "Title and content required" });

    const article = {
      id: uuidv4(),
      title: title.trim(),
      content: content.trim(),
      createdAt: new Date().toISOString(),
    };
    const file = path.join(DATA_DIR, `${article.id}.json`);
    fs.writeFileSync(file, JSON.stringify(article, null, 2));
    res.status(201).json({ data: article });
  } catch (err) {
    next(err);
  }
});

// Error handler
app.use((err, _req, res, _next) => {
  console.error("💥", err);
  res.status(500).json({ error: "Server error" });
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);

  // Wait a tick to ensure routes are registered
  setTimeout(() => {
    if (app._router?.stack) {
      const routes = app._router.stack
        .filter(r => r.route)
        .map(r => `${Object.keys(r.route.methods)[0].toUpperCase()} ${r.route.path}`);
      console.log("Registered routes:", routes);
    } else {
      console.log("⚠️ No routes found.");
    }
  }, 200);
});
