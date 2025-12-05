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

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5050;

const ROOT = path.resolve();

const DATA_DIR = process.env.DATA_DIR
  ? path.resolve(process.env.DATA_DIR)
  : path.join(ROOT, "data");

const UPLOAD_DIR = process.env.UPLOAD_DIR
  ? path.resolve(process.env.UPLOAD_DIR)
  : path.join(ROOT, "uploads");

const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";

// Make sure folders exist
ensureDirs(DATA_DIR, UPLOAD_DIR);

const httpServer = createServer(app);
const io = initSocket(httpServer, CLIENT_URL);

// Global middleware
app.use(cors({ origin: CLIENT_URL, credentials: true }));
app.use(express.json());
app.use(helmet({ contentSecurityPolicy: false }));
app.use(requestLogger);

// Serve uploaded files
app.use(
  "/uploads",
  express.static(UPLOAD_DIR, {
    setHeaders: (res) =>
      res.setHeader("Cross-Origin-Resource-Policy", "cross-origin")
  })
);

// Other routes
app.use("/api", uploadRouter);
app.use("/api/articles", createArticleRoutes(UPLOAD_DIR, io));
app.use("/api/workspaces", createWorkspaceRoutes);

// Default route
app.get("/", (_req, res) => res.send("Article API is running"));

// Global error handler
app.use((err, _req, res, _next) => {
  console.error("Server error:", err);
  res.status(500).json({ error: err.message || "Server error" });
});

// Start server
(async () => {
  await initDB();
  httpServer.listen(PORT, () =>
    console.log(`Server running on http://localhost:${PORT}`)
  );
})();
