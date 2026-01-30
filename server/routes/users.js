import express from "express";
import db from "../models/index.js";
import { authenticateJWT } from "../middlewares/auth.js";

const { User } = db;
const router = express.Router();

// protect all routes
router.use(authenticateJWT);

// admin-only middleware
const requireAdmin = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ error: "Admin only" });
  }
  next();
};

// GET all users (admin only)
router.get("/", requireAdmin, async (_req, res) => {
  const users = await User.findAll({
    attributes: ["id", "email", "role", "createdAt"],
  });
  res.json({ data: users });
});

// UPDATE user role (admin only)
router.put("/:id/role", requireAdmin, async (req, res) => {
  const { role } = req.body;
  if (!["admin", "user"].includes(role)) {
    return res.status(400).json({ error: "Invalid role" });
  }

  const user = await User.findByPk(req.params.id);
  if (!user) return res.status(404).json({ error: "User not found" });

  user.role = role;
  await user.save();

  res.json({ data: user });
});

export default router;
