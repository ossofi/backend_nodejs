import express from "express";
import cors from "cors";
import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import helmet from "helmet";
import { createServer } from "http";
import { Server as IOServer } from "socket.io";
import multer from "multer";

const app = express();
const PORT = process.env.PORT || 5050;

// create HTTP server for socket.io
const httpServer = createServer(app);
const io = new IOServer(httpServer, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE"],
  },
});

// Middleware
app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json());

app.use(
  helmet({
    contentSecurityPolicy: false, // disable for development
  })
);

const DATA_DIR = path.join(path.resolve(), "data");
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

// uploads directory
const UPLOAD_DIR = path.join(path.resolve(), "uploads");
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

// serve uploaded files with proper CORP headers
app.use("/uploads", express.static(UPLOAD_DIR, {
  setHeaders: (res) => {
    res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
  },
}));

// simple logger
app.use((req, _res, next) => {
  console.log(`➡ ${req.method} ${req.url}`);
  next();
});

// Socket.io connection log
io.on("connection", (socket) => {
  console.log("WS client connected:", socket.id);
  socket.on("disconnect", () => console.log("WS client disconnected:", socket.id));
});

// Multer setup
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
  filename: (_req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}-${file.originalname}`;
    cb(null, unique);
  },
});

const allowedMime = new Set([
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "application/pdf",
]);

const fileFilter = (_req, file, cb) => {
  if (!allowedMime.has(file.mimetype)) cb(new Error("Invalid file type. Only images and PDFs are allowed."));
  else cb(null, true);
};

const upload = multer({ storage, fileFilter, limits: { fileSize: 10 * 1024 * 1024 } });

// Root route
app.get("/", (_req, res) => {
  res.send("Article API is running. Use /api/articles to fetch data.");
});

// Get all articles
app.get("/api/articles", async (_req, res, next) => {
  try {
    const files = fs.readdirSync(DATA_DIR).filter((f) => f.endsWith(".json"));
    const articles = files.map((f) => {
      const data = JSON.parse(fs.readFileSync(path.join(DATA_DIR, f), "utf-8"));
      return { id: data.id, title: data.title, createdAt: data.createdAt };
    });
    res.json({ data: articles });
  } catch (err) { next(err); }
});

// Get single article
app.get("/api/articles/:id", (req, res, next) => {
  try {
    const file = path.join(DATA_DIR, `${req.params.id}.json`);
    if (!fs.existsSync(file)) return res.status(404).json({ error: "Article not found" });
    const article = JSON.parse(fs.readFileSync(file, "utf-8"));
    res.json({ data: article });
  } catch (err) { next(err); }
});

// Create new article
app.post("/api/articles", (req, res, next) => {
  try {
    const { title, content } = req.body;
    if (!title || !content) return res.status(400).json({ error: "Title and content are required" });

    const article = { id: uuidv4(), title: title.trim(), content: content.trim(), createdAt: new Date().toISOString(), attachments: [] };
    fs.writeFileSync(path.join(DATA_DIR, `${article.id}.json`), JSON.stringify(article, null, 2));

    io.emit("notification", { type: "created", articleId: article.id, title: article.title, timestamp: new Date().toISOString() });

    res.status(201).json({ data: article });
  } catch (err) { next(err); }
});

// Edit existing article
app.put("/api/articles/:id", (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, content } = req.body;
    const file = path.join(DATA_DIR, `${id}.json`);
    if (!fs.existsSync(file)) return res.status(404).json({ error: "Article not found" });
    if (!title && !content) return res.status(400).json({ error: "At least one field (title or content) required" });

    const article = JSON.parse(fs.readFileSync(file, "utf-8"));
    const updated = { ...article, title: title?.trim() || article.title, content: content?.trim() || article.content, updatedAt: new Date().toISOString(), attachments: article.attachments || [] };
    fs.writeFileSync(file, JSON.stringify(updated, null, 2));

    io.emit("notification", { type: "edited", articleId: id, title: updated.title, timestamp: new Date().toISOString() });

    res.json({ data: updated });
  } catch (err) { next(err); }
});

// Delete article
app.delete("/api/articles/:id", (req, res, next) => {
  try {
    const file = path.join(DATA_DIR, `${req.params.id}.json`);
    if (!fs.existsSync(file)) return res.status(404).json({ error: "Article not found" });
    fs.unlinkSync(file);
    res.json({ message: `Article ${req.params.id} deleted successfully` });
  } catch (err) { next(err); }
});

// Upload attachments
app.post("/api/articles/:id/attachments", upload.array("attachments", 5), (req, res, next) => {
  try {
    const { id } = req.params;
    const filePath = path.join(DATA_DIR, `${id}.json`);
    if (!fs.existsSync(filePath)) {
      if (req.files) req.files.forEach(f => fs.existsSync(path.join(UPLOAD_DIR, f.filename)) && fs.unlinkSync(path.join(UPLOAD_DIR, f.filename)));
      return res.status(404).json({ error: "Article not found" });
    }

    const article = JSON.parse(fs.readFileSync(filePath, "utf-8"));
    article.attachments = article.attachments || [];
    const added = [];

    (req.files || []).forEach(f => {
      const attach = { id: uuidv4(), originalName: f.originalname, filename: f.filename, mimeType: f.mimetype, url: `/uploads/${f.filename}`, createdAt: new Date().toISOString() };
      article.attachments.push(attach);
      added.push(attach);

      io.emit("notification", { type: "attachment", articleId: id, title: article.title, attachment: attach, timestamp: new Date().toISOString() });
    });

    fs.writeFileSync(filePath, JSON.stringify(article, null, 2));
    res.status(201).json({ data: added });
  } catch (err) { next(err); }
});

// Error handler
app.use((err, _req, res, _next) => {
  console.error("error", err);
  res.status(500).json({ error: err.message || "Server error" });
});

// start server via httpServer for socket.io
httpServer.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
