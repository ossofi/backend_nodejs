import cors from "cors";
import helmet from "helmet";
import { createServer } from "http";
import path from "path";
import express from "express";
import dotenv from "dotenv";

import { initDB } from "./db.js";
import createArticleRoutes from "./routes/articles.js";
import createWorkspaceRoutes from "./routes/workspaces.js";
import requestLogger from "./middlewares/logger.js";
import { initSocket } from "./sockets/index.js";
import { ensureDirs } from "./utils/ensureDirs.js";
import uploadRouter from "./routes/uploads.js";
import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/users.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

const ROOT = path.resolve();

const DATA_DIR = process.env.DATA_DIR
  ? path.resolve(process.env.DATA_DIR)
  : path.join(ROOT, "data");

const UPLOAD_DIR = process.env.UPLOAD_DIR
  ? path.resolve(process.env.UPLOAD_DIR)
  : path.join(ROOT, "uploads");

const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";

// Ensure folders exist
ensureDirs(DATA_DIR, UPLOAD_DIR);

// Middleware
app.use(cors({ origin: CLIENT_URL, credentials: true }));
app.use(express.json());
app.use(helmet({ contentSecurityPolicy: false }));
app.use(requestLogger);

// Static uploads
app.use(
  "/uploads",
  express.static(UPLOAD_DIR, {
    setHeaders: (res) =>
      res.setHeader("Cross-Origin-Resource-Policy", "cross-origin"),
  })
);

// Auth routes
app.use("/api/auth", authRoutes);

// Other routes
app.use("/api", uploadRouter);

const httpServer = createServer(app);
const io = initSocket(httpServer, CLIENT_URL);

app.use("/api/articles", createArticleRoutes(UPLOAD_DIR, io));
app.use("/api/workspaces", createWorkspaceRoutes);

// Health check
app.get("/", (_req, res) => res.send("Article API is running"));

// Error handler
app.use((err, _req, res, _next) => {
  console.error("Server error:", err);
  res.status(500).json({ error: err.message || "Server error" });
});

app.use("/api/users", userRoutes);

// Start
(async () => {
  await initDB();
  httpServer.listen(PORT, () =>
    console.log(`Server running on http://localhost:${PORT}`)
  );
})();
