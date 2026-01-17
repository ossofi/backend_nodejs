import express from "express";
import db from "../models/index.js";
import { authenticateJWT } from "../middlewares/auth.js";

const router = express.Router();
router.use(authenticateJWT); // protect all routes

const { Workspace } = db;

// GET all workspaces
router.get("/", async (_req, res) => {
  try {
    const workspaces = await Workspace.findAll({
      attributes: ["id", "name"],
      order: [["createdAt", "ASC"]],
    });
    res.json({ data: workspaces });
  } catch (err) {
    console.error("GET /api/workspaces error:", err);
    res.status(500).json({ error: "Failed to load workspaces" });
  }
});

// POST create workspace
router.post("/", async (req, res) => {
  try {
    const { name } = req.body;
    if (!name?.trim()) return res.status(400).json({ error: "Workspace name is required" });

    const ws = await Workspace.create({ name: name.trim() });
    res.status(201).json({ data: ws });
  } catch (err) {
    console.error("POST /api/workspaces error:", err);
    res.status(500).json({ error: "Failed to create workspace" });
  }
});

export default router;
