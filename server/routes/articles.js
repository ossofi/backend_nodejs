import express from "express";
import multer from "multer";
import { v4 as uuidv4 } from "uuid";
import path from "path";
import fs from "fs";
import db from "../models/index.js";
import { authenticateJWT } from "../middlewares/auth.js";
import authorizeArticleEdit from "../middlewares/authorizeArticleEdit.js";
import { Sequelize, Op } from "sequelize";
import PDFDocument from "pdfkit";
import striptags from "striptags";

const { Article, User, Comment, Workspace, ArticleVersion } = db;

export default function createArticleRoutes(UPLOAD_DIR, io) {
  const router = express.Router();

  // Protect ALL article routes
  router.use(authenticateJWT);

  // Ensure upload directory exists
  if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  }

  // Multer setup
  const storage = multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
    filename: (_req, file, cb) => {
      const ext = path.extname(file.originalname) || "";
      cb(null, `${Date.now()}-${uuidv4()}${ext}`);
    },
  });

  const upload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 },
  });

  // Helpers
  const attachmentsFileFor = (id) => path.join(UPLOAD_DIR, `${id}.json`);

  const readAttachmentsFor = (id) => {
    const file = attachmentsFileFor(id);
    if (!fs.existsSync(file)) return [];
    try {
      return JSON.parse(fs.readFileSync(file, "utf8"));
    } catch {
      return [];
    }
  };

  const writeAttachmentsFor = (id, attachments) => {
    fs.writeFileSync(
      attachmentsFileFor(id),
      JSON.stringify(attachments, null, 2)
    );
  };

  // Standard UUID v4 validation (works for your Sequelize UUID primary keys)
  const validateUUID = (id) =>
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

  // GET articles by workspace

  router.get("/", async (req, res) => {
    try {
      const { workspaceId } = req.query;
      if (!workspaceId) {
        return res.status(400).json({ error: "workspaceId required" });
      }

      const articles = await Article.findAll({
        where: { workspaceId },
        order: [["createdAt", "DESC"]],
      });

      const result = articles.map((a) => ({
        ...a.toJSON(),
        attachments: readAttachmentsFor(a.id),
      }));

      res.json({ data: result });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Server error" });
    }
  });

  // SEARCH
  router.get("/search", async (req, res) => {
    try {
      const { workspaceId, q } = req.query;

      if (!workspaceId) {
        return res.status(400).json({ error: "workspaceId required" });
      }
      if (!q?.trim()) {
        return res.status(400).json({ error: "Search query required" });
      }

      const articles = await Article.findAll({
        where: {
          workspaceId,
          [Op.or]: [
            { title: { [Op.iLike]: `%${q}%` } },
            { content: { [Op.iLike]: `%${q}%` } },
          ],
        },
        order: [["createdAt", "DESC"]],
      });

      res.json({
        data: articles.map(a => ({
          ...a.toJSON(),
          attachments: readAttachmentsFor(a.id),
        })),
      });
    } catch (err) {
      console.error("Search error:", err);
      res.status(500).json({ error: "Server error" });
    }
  });

  // GET single article

  router.get("/:id", async (req, res) => {
    const { id } = req.params;
    if (!validateUUID(id)) {
      return res.status(400).json({ error: "Invalid article ID" });
    }

    try {
      const article = await Article.findByPk(id, {
        include: [{ model: Comment, as: "comments" }],
      });

      if (!article) {
        return res.status(404).json({ error: "Article not found" });
      }

      res.json({
        data: {
          ...article.toJSON(),
          attachments: readAttachmentsFor(id),
        },
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Server error" });
    }
  });

  // CREATE article

  router.post("/", async (req, res) => {
    try {
      const { title, content, workspaceId } = req.body;
      if (!title || !content || !workspaceId) {
        return res.status(400).json({ error: "Missing fields" });
      }

      const article = await Article.create({
        title,
        content,
        workspaceId,
        createdBy: req.user.id, // author save
      });

      io?.emit("notification", {
        type: "created",
        title: article.title,
        articleId: article.id,
      });

      res.status(201).json({ data: article });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Server error" });
    }
  });

  router.put("/:id", authenticateJWT, authorizeArticleEdit, async (req, res) => {
    const { id } = req.params;
    const article = req.article; // already authorized by middleware

    if (!validateUUID(id)) {
      return res.status(400).json({ error: "Invalid article ID" });
    }

    try {
      // Fetch Versions only to calculate version number
      const articleWithVersions = await Article.findByPk(id, {
        include: [{ model: ArticleVersion, as: "Versions" }],
      });

      if (!articleWithVersions) {
        return res.status(404).json({ error: "Article not found" });
      }

      const versionNumber = (articleWithVersions.Versions?.length || 0) + 1;

      await ArticleVersion.create({
        articleId: article.id,
        title: article.title,
        content: article.content,
        versionNumber,
      });

      await article.update(req.body);

      io?.emit("notification", {
        type: "edited",
        title: article.title,
        articleId: article.id,
      });

      res.json({ data: article });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Server error" });
    }
  });

  // GET article versions

  router.get("/:id/versions", async (req, res) => {
    try {
      const versions = await ArticleVersion.findAll({
        where: { articleId: req.params.id },
        order: [["versionNumber", "DESC"]],
        attributes: [
          "id",
          "title",
          "content",
          "versionNumber",
          "createdAt",
        ],
      });

      res.json({ data: versions });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Server error" });
    }
  });

  // PDF export route
  router.get("/:id/export", async (req, res) => {
    const { id } = req.params;

    // UUID validation
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
      return res.status(400).json({ error: "Invalid article ID" });
    }

    try {
      const article = await db.Article.findByPk(id, {
        include: [{ model: db.User, as: "author", attributes: ["email"] }],
      });

      if (!article) return res.status(404).json({ error: "Article not found" });

      // PDF headers
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${article.title}.pdf"`
      );

      const doc = new PDFDocument({ margin: 50 });
      doc.pipe(res);

      // Title & metadata
      doc.fontSize(22).text(article.title, { underline: true });
      doc.moveDown();
      doc.fontSize(10).text(`Author: ${article.author?.email || "Unknown"}`);
      doc.text(`Created At: ${article.createdAt.toDateString()}`);
      doc.moveDown();

      // Convert HTML content to plain text
      const contentText = striptags(article.content, [], "\n");
      doc.fontSize(12).text(contentText, { lineGap: 4 });
      doc.moveDown();

      doc.end();
    } catch (err) {
      console.error("PDF export error:", err);
      res.status(500).json({ error: "Failed to generate PDF" });
    }
  });


  // DELETE article

  router.delete("/:id", async (req, res) => {
    const { id } = req.params;
    if (!validateUUID(id)) {
      return res.status(400).json({ error: "Invalid article ID" });
    }

    try {
      const article = await Article.findByPk(id);
      if (!article) {
        return res.status(404).json({ error: "Article not found" });
      }

      const metadataFile = attachmentsFileFor(id);
      if (fs.existsSync(metadataFile)) {
        const attachments = JSON.parse(fs.readFileSync(metadataFile, "utf8"));
        attachments.forEach((a) => {
          const filePath = path.join(UPLOAD_DIR, a.filename);
          if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        });
        fs.unlinkSync(metadataFile);
      }

      await article.destroy();

      io?.emit("notification", {
        type: "deleted",
        articleId: id,
      });

      res.status(204).send();
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Server error" });
    }
  });

  // COMMENTS

  router.post("/:id/comments", async (req, res) => {
    const comment = await Comment.create({
      articleId: req.params.id,
      content: req.body.content,
    });
    res.status(201).json({ data: comment });
  });

  router.put("/comments/:id", async (req, res) => {
    const comment = await Comment.findByPk(req.params.id);
    if (!comment) return res.status(404).json({ error: "Not found" });
    comment.content = req.body.content;
    await comment.save();
    res.json({ data: comment });
  });

  router.delete("/comments/:id", async (req, res) => {
    const comment = await Comment.findByPk(req.params.id);
    if (!comment) return res.status(404).json({ error: "Not found" });
    await comment.destroy();
    res.status(204).send();
  });

  // ATTACHMENTS

  router.post(
    "/:id/attachments",
    upload.array("attachments", 5),
    async (req, res) => {
      const { id } = req.params;
      if (!validateUUID(id)) {
        return res.status(400).json({ error: "Invalid article ID" });
      }

      const article = await Article.findByPk(id);
      if (!article) {
        return res.status(404).json({ error: "Article not found" });
      }

      const existing = readAttachmentsFor(id);

      const attachments = req.files.map((file) => ({
        id: uuidv4(),
        originalName: file.originalname,
        filename: file.filename,
        mimeType: file.mimetype,
        url: `/uploads/${file.filename}`,
        createdAt: new Date().toISOString(),
      }));

      writeAttachmentsFor(id, [...existing, ...attachments]);

      io?.emit("notification", {
        type: "attachment",
        articleId: id,
        count: attachments.length,
      });

      res.status(201).json({ data: attachments });
    }
  );

  return router;
}