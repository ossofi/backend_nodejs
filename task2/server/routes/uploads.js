import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";

const router = express.Router();

// Ensure uploads folder exists
const uploadPath = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadPath)) fs.mkdirSync(uploadPath, { recursive: true });

// Configure Multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + "-" + file.originalname);
  },
});

const upload = multer({ storage });

router.post("/upload", upload.single("image"), (req, res) => {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });
  
    // Metadata
    const fileData = {
      id: Date.now().toString(), // or your UUID generator
      mimeType: req.file.mimetype,
      originalName: req.file.originalname,
      filename: req.file.filename,
      url: `/uploads/${req.file.filename}`,
      createdAt: new Date().toISOString(),
    };
  
    // Save metadata to JSON
    const metadataFile = path.join(process.cwd(), "data/images.json");
    const currentData = fs.existsSync(metadataFile)
      ? JSON.parse(fs.readFileSync(metadataFile))
      : [];
    currentData.push(fileData);
    fs.writeFileSync(metadataFile, JSON.stringify(currentData, null, 2));
  
    res.json(fileData);
  });
  
  export default router;
  