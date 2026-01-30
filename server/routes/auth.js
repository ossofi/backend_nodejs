import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import db from "../models/index.js";

const router = express.Router();
const { User } = db;
const JWT_SECRET = process.env.JWT_SECRET || "supersecret";
const JWT_EXPIRATION = "1h";

// REGISTER
router.post("/register", async (req, res) => {
  try {
    const { email, password, role } = req.body;
    if (!email || !password) return res.status(400).json({ error: "Email and password required" });

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ email, passwordHash: hashed, role: role || "user" });

    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: JWT_EXPIRATION });

    res.status(201).json({ data: { id: user.id, email: user.email, role: user.role }, token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// LOGIN
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: "Email and password required" });

    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(401).json({ error: "Invalid credentials" });

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) return res.status(401).json({ error: "Invalid credentials" });

    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: JWT_EXPIRATION });

    res.json({ token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
