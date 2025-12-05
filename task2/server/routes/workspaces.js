import express from "express";
import db from "../models/index.js";
const { Workspace } = db;

const router = express.Router();

router.get("/", async (_, res) => {
  try {
    const workspaces = await Workspace.findAll();
    res.json({ data: workspaces });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/", async (req, res) => {
  try {
    const ws = await Workspace.create({ name: req.body.name });
    res.json({ data: ws });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
