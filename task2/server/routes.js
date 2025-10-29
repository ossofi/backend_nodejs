import express from "express";
import fs from "fs/promises";
import path from "path";
import { v4 as uuidv4 } from "uuid";

const router = express.Router();
const DATA_DIR = path.join(path.resolve(), "data");
fs.mkdir(DATA_DIR, { recursive: true }).catch(() => {});

// List all articles
async function listArticles() {
  const files = await fs.readdir(DATA_DIR);
  const items = [];
  for (const f of files) {
    if (!f.endsWith(".json")) continue;
    const txt = await fs.readFile(path.join(DATA_DIR, f), "utf8");
    items.push(JSON.parse(txt));
  }
  items.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  return items;
}

// GET /api/articles
router.get("/articles", async (req, res) => {
  try {
    const items = await listArticles();
    res.json({ data: items });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to list articles" });
  }
});

// GET /api/articles/:id
router.get("/articles/:id", async (req, res) => {
  const id = req.params.id;
  const file = path.join(DATA_DIR, `${id}.json`);
  try {
    const txt = await fs.readFile(file, "utf8");
    res.json({ data: JSON.parse(txt) });
  } catch (err) {
    if (err.code === "ENOENT") return res.status(404).json({ error: "Article not found" });
    console.error(err);
    res.status(500).json({ error: "Failed to read article" });
  }
});

// POST /api/articles
router.post("/articles", async (req, res) => {
  const { title, content } = req.body || {};
  if (!title || !content) return res.status(400).json({ error: "Title & content required" });

  const id = uuidv4();
  const article = { id, title: title.trim(), content, createdAt: new Date().toISOString() };
  const file = path.join(DATA_DIR, `${id}.json`);
  try {
    await fs.writeFile(file, JSON.stringify(article, null, 2), "utf8");
    res.status(201).json({ data: article });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to save article" });
  }
});

export default router;
