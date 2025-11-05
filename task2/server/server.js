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

// Root route (prevents "Cannot GET /")
app.get("/", (_req, res) => {
  res.send("Article API is running. Use /api/articles to fetch data.");
});

// Get all articles
app.get("/api/articles", async (_req, res, next) => {
  try {
    const files = fs.readdirSync(DATA_DIR).filter(f => f.endsWith(".json"));
    const articles = files.map(f => {
      const data = JSON.parse(fs.readFileSync(path.join(DATA_DIR, f), "utf-8"));
      return {
        id: data.id,
        title: data.title,
        createdAt: data.createdAt,
      };
    });
    res.json({ data: articles });
  } catch (err) {
    next(err);
  }
});

// Get a single article
app.get("/api/articles/:id", (req, res, next) => {
  try {
    const file = path.join(DATA_DIR, `${req.params.id}.json`);
    if (!fs.existsSync(file)) return res.status(404).json({ error: "Article not found" });
    const article = JSON.parse(fs.readFileSync(file, "utf-8"));
    res.json({ data: article });
  } catch (err) {
    next(err);
  }
});

// Create a new article
app.post("/api/articles", (req, res, next) => {
  try {
    const { title, content } = req.body;
    if (!title || !content)
      return res.status(400).json({ error: "Title and content are required" });

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

// Edit existing article
app.put("/api/articles/:id", (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, content } = req.body;
    const file = path.join(DATA_DIR, `${id}.json`);

    // Validation: article must exist
    if (!fs.existsSync(file))
      return res.status(404).json({ error: "Article not found" });

    // Validation: article must include something to update
    if (!title && !content)
      return res.status(400).json({ error: "At least one field (title or content) required" });

    const article = JSON.parse(fs.readFileSync(file, "utf-8"));
    const updated = {
      ...article,
      title: title?.trim() || article.title,
      content: content?.trim() || article.content,
      updatedAt: new Date().toISOString(),
    };

    fs.writeFileSync(file, JSON.stringify(updated, null, 2));
    res.json({ data: updated });
  } catch (err) {
    next(err);
  }
});

// Delete existing article
app.delete("/api/articles/:id", (req, res, next) => {
  try {
    const { id } = req.params;
    const file = path.join(DATA_DIR, `${id}.json`);

    if (!fs.existsSync(file))
      return res.status(404).json({ error: "Article not found" });

    fs.unlinkSync(file);
    res.json({ message: `Article ${id} deleted successfully` });
  } catch (err) {
    next(err);
  }
});

// Error handler
app.use((err, _req, res, _next) => {
  console.error("error", err);
  res.status(500).json({ error: "Server error" });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
