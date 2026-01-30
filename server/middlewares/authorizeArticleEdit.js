import db from "../models/index.js";
const { Article } = db;

export default async function authorizeArticleEdit(req, res, next) {
  const { id } = req.params;

  if (!/^[0-9a-fA-F-]{36}$/.test(id)) {
    return res.status(400).json({ error: "Invalid article ID" });
  }

  const article = await Article.findByPk(id);
  if (!article) {
    return res.status(404).json({ error: "Article not found" });
  }

  if (req.user.role === "admin" || article.createdBy === req.user.id) {
    req.article = article; // attach article to request
    return next();
  }

  return res.status(403).json({ error: "Not allowed to edit this article" });
}
