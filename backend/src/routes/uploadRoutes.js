const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const authMiddleware = require("../middleware/authMiddleware");

// Konfigurasi penyimpanan file
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../uploads")); // simpan di folder uploads
  },
  filename: (req, file, cb) => {
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const safeName = file.originalname.replace(/\s+/g, "_");
    cb(null, unique + "-" + safeName);
  },
});

const upload = multer({ storage });

// POST /api/upload/receipt
router.post(
  "/receipt",
  authMiddleware,
  upload.single("file"), // nama field: file
  (req, res) => {
    if (!req.file) {
      return res.status(400).json({ message: "Tidak ada file" });
    }

    const fileUrl = `/uploads/${req.file.filename}`;

    return res.json({
      message: "Upload berhasil",
      fileUrl,
      originalName: req.file.originalname,
    });
  }
);

module.exports = router;
