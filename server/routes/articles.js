import express from "express";
import multer from "multer";
import { v4 as uuidv4 } from "uuid";
import path from "path";
import fs from "fs";
import db from "../models/index.js";

const { Article, Comment } = db;

export default function createArticleRoutes(UPLOAD_DIR, io) {
  const router = express.Router();

  // Ensure upload directory exists
  if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

  // Multer setup
  // Save files with a safe generated filename (timestamp + uuid + original ext)
  const storage = multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
    filename: (_req, file, cb) => {
      const ext = path.extname(file.originalname) || "";
      const safeName = `${Date.now()}-${uuidv4()}${ext}`;
      cb(null, safeName);
    }
  });

  const upload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  });

  // Helper: read attachments metadata for an article id
  function readAttachmentsFor(id) {
    const attachmentsFile = path.join(UPLOAD_DIR, `${id}.json`);
    if (!fs.existsSync(attachmentsFile)) return [];
    try {
      const raw = fs.readFileSync(attachmentsFile, "utf-8");
      return JSON.parse(raw);
    } catch (err) {
      console.error("Error parsing attachments metadata for", id, err);
      return [];
    }
  }

  // Helper: write attachments metadata for an article id
  function writeAttachmentsFor(id, attachments) {
    const attachmentsFile = path.join(UPLOAD_DIR, `${id}.json`);
    fs.writeFileSync(attachmentsFile, JSON.stringify(attachments, null, 2));
  }

  // Get articles by workspace
  router.get("/", async (req, res) => {
    try {
      const { workspaceId } = req.query;
      if (!workspaceId) return res.status(400).json({ error: "workspaceId required" });

      const articles = await Article.findAll({
        where: { workspaceId },
        order: [["createdAt", "DESC"]],
        attributes: ["id", "title", "content", "workspaceId", "createdAt", "updatedAt"]
      });

      // Attach attachments metadata for each article
      const articlesWithAttachments = articles.map(a => {
        const attachments = readAttachmentsFor(a.id);
        return { ...a.toJSON(), attachments };
      });

      return res.json({ data: articlesWithAttachments });
    } catch (err) {
      console.error("GET /api/articles error:", err);
      return res.status(500).json({ error: "Server error" });
    }
  });

  // Get single article with comments + attachments
  router.get("/:id", async (req, res) => {
    try {
      const { id } = req.params;

      // Basic UUID check
      if (!/^[0-9a-fA-F-]{36}$/.test(id)) {
        return res.status(400).json({ error: "Invalid article ID" });
      }

      const article = await Article.findByPk(id, {
        include: [{ model: Comment, as: "Comments" }],
        attributes: ["id", "title", "content", "workspaceId", "createdAt", "updatedAt"]
      });

      if (!article) return res.status(404).json({ error: "Article not found" });

      const attachments = readAttachmentsFor(id);

      // Send article JSON + attachments array
      return res.json({ data: { ...article.toJSON(), attachments } });
    } catch (err) {
      console.error("GET /api/articles/:id error:", err);
      return res.status(500).json({ error: "Server error" });
    }
  });

  // Create article
  router.post("/", async (req, res) => {
    try {
      const { title, content, workspaceId } = req.body;
      if (!title || !content || !workspaceId) return res.status(400).json({ error: "Missing fields" });

      const article = await Article.create({ title, content, workspaceId });

      if (io?.emit) io.emit("articleCreated", article);

      return res.status(201).json({ data: article });
    } catch (err) {
      console.error("POST /api/articles error:", err);
      return res.status(500).json({ error: "Server error" });
    }
  });

  // Update article - create a new version
router.put("/:id", async (req, res) => {
  try {
    const { title, content, workspaceId } = req.body;
    const article = await Article.findByPk(req.params.id, {
      include: [{ model: db.ArticleVersion, as: "Versions" }]
    });
    if (!article) return res.status(404).json({ error: "Article not found" });

    // Determine version number
    const versionNumber = (article.Versions?.length || 0) + 1;

    // Save current state to ArticleVersion before updating
    await db.ArticleVersion.create({
      articleId: article.id,
      title: article.title,
      content: article.content,
      versionNumber
    });

    // Update the article
    await article.update({ title, content, workspaceId });

    if (io?.emit) io.emit("articleUpdated", article);

    return res.json({ data: article });
  } catch (err) {
    console.error("PUT /api/articles/:id error:", err);
    return res.status(500).json({ error: "Server error" });
  }
});

  // Get versions of an article
  router.get("/:id/versions", async (req, res) => {
    try {
      const versions = await db.ArticleVersion.findAll({
        where: { articleId: req.params.id },
        order: [["versionNumber", "DESC"]]
      });
      res.json({ data: versions });
    } catch (err) {
      console.error("GET /api/articles/:id/versions error:", err);
      res.status(500).json({ error: "Server error" });
    }
  });


  // Delete article
router.delete("/:id", async (req, res) => {
  try {
    const id = req.params.id;

    // Find article
    const article = await Article.findByPk(id);
    if (!article) {
      return res.status(404).json({ error: "Article not found" });
    }

    // 1. Delete physical files + metadata JSON
    const metadataFile = path.join(UPLOAD_DIR, `${id}.json`);
    if (fs.existsSync(metadataFile)) {
      const attachments = JSON.parse(fs.readFileSync(metadataFile, "utf8"));

      // Delete all uploaded files
      attachments.forEach(a => {
        const filePath = path.join(UPLOAD_DIR, a.filename);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      });

      // Delete metadata JSON
      fs.unlinkSync(metadataFile);
    }

    // 2️. Delete article record
    await article.destroy();

    // 3️. Notify WebSocket listeners
    if (io?.emit) io.emit("articleDeleted", { id });

    res.json({ success: true });
  } catch (err) {
    console.error("DELETE /api/articles/:id error:", err);
    res.status(500).json({ error: "Failed to delete article" });
  }
});


  // Add comment
  router.post("/:id/comments", async (req, res) => {
    try {
      const { content } = req.body;
      if (!content) return res.status(400).json({ error: "Content required" });

      const comment = await Comment.create({ articleId: req.params.id, content });
      return res.status(201).json({ data: comment });
    } catch (err) {
      console.error("POST /api/articles/:id/comments error:", err);
      return res.status(500).json({ error: "Server error" });
    }
  });
// Edit comment
router.put("/comments/:id", async (req, res) => {
  try {
    const comment = await Comment.findByPk(req.params.id);
    if (!comment) return res.status(404).json({ error: "Comment not found" });
    comment.content = req.body.content;
    await comment.save();
    res.json(comment);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update comment" });
  }
});

// Delete comment
router.delete("/comments/:id", async (req, res) => {
  try {
    const comment = await Comment.findByPk(req.params.id);
    if (!comment) return res.status(404).json({ error: "Comment not found" });
    await comment.destroy();
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete comment" });
  }
});


  // Upload attachments
  // Single endpoint to attach files to an existing article
  router.post("/:id/attachments", upload.array("attachments", 5), async (req, res) => {
    try {
      const article = await Article.findByPk(req.params.id);
      if (!article) return res.status(404).json({ error: "Article not found" });

      // Load existing attachments metadata
      const existing = readAttachmentsFor(req.params.id);

      // Map uploaded files into metadata: store originalName, stored filename, mime, url
      const attachments = (req.files || []).map(file => ({
        id: uuidv4(),
        mimeType: file.mimetype,
        originalName: file.originalname,
        filename: file.filename,
        // Url is relative to server root and served by express.static('/uploads')
        url: `/uploads/${file.filename}`,
        createdAt: new Date().toISOString()
      }));

      // Merge and persist metadata
      const merged = [...existing, ...attachments];
      writeAttachmentsFor(req.params.id, merged);

      // Optionally notify via socket
      if (io?.emit) io.emit("articleAttachmentAdded", { articleId: req.params.id, attachments });

      return res.status(201).json({ data: attachments });
    } catch (err) {
      console.error("POST /api/articles/:id/attachments error:", err);
      return res.status(500).json({ error: "Server error" });
    }
  });

  return router;
}
