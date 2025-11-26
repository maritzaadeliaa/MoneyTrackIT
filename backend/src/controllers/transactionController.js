const Transaction = require("../models/Transaction");
const User = require("../models/User");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Konfigurasi multer untuk menyimpan file
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = "uploads/";
    // Pastikan folder uploads ada
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Nama file: timestamp + original name
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  // Hanya terima file gambar dan PDF
  if (file.mimetype.startsWith("image/") || file.mimetype === "application/pdf") {
    cb(null, true);
  } else {
    cb(new Error("Hanya file gambar dan PDF yang diizinkan!"), false);
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
  fileFilter: fileFilter
});

// Middleware upload untuk single file
exports.uploadReceipt = upload.single("receipt");

/*
|--------------------------------------------------------------------------
| CREATE transaksi (income / expense) dengan upload file
|--------------------------------------------------------------------------
*/
exports.createTransaction = async (req, res) => {
  try {
    // Debug: lihat apa yang diterima
    console.log("=== DEBUG CREATE TRANSACTION ===");
    console.log("Request body:", req.body);
    console.log("Request file:", req.file);
    console.log("=== END DEBUG ===");

    const { type, category, amount, note, date } = req.body;

    if (!type || !amount) {
      return res.status(400).json({ message: "Type dan amount wajib diisi" });
    }

    if (!["INCOME", "EXPENSE"].includes(type)) {
      return res.status(400).json({ message: "Type harus INCOME atau EXPENSE" });
    }

    if (type === "EXPENSE" && !category) {
      return res.status(400).json({ message: "Expense wajib punya category" });
    }

    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: "User tidak ditemukan" });

    // **PERBAIKAN: Gunakan relative path saja, bukan absolute URL**
    let receiptUrl = null;
    if (req.file) {
      receiptUrl = `/uploads/${req.file.filename}`;
      console.log("Generated receipt URL:", receiptUrl);
      
      // Test apakah file benar-benar ada
      const filePath = `uploads/${req.file.filename}`;
      if (fs.existsSync(filePath)) {
        console.log("✅ File berhasil disimpan di:", filePath);
      } else {
        console.log("❌ File TIDAK ditemukan di:", filePath);
      }
    }
    
    // update saldo utama
    if (type === "INCOME") {
      user.mainBalance += Number(amount);
    } else if (type === "EXPENSE") {
      user.mainBalance -= Number(amount);
    }
    await user.save();

    const transaction = await Transaction.create({
      user: req.userId,
      type,
      category: type === "EXPENSE" ? category : null,
      amount: Number(amount),
      note,
      date: date || new Date(),
      receiptUrl // Tambahkan receiptUrl ke transaksi
    });

    res.json({
      message: "Transaksi berhasil dibuat",
      transaction,
      mainBalance: user.mainBalance,
    });
  } catch (error) {
    console.error(error);
    // Handle multer error
    if (error instanceof multer.MulterError) {
      if (error.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ message: "File terlalu besar. Maksimal 5MB" });
      }
    }
    res.status(500).json({ message: error.message });
  }
};

/*
|--------------------------------------------------------------------------
| GET semua transaksi user
|--------------------------------------------------------------------------
*/
exports.getTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find({ user: req.userId })
      .sort({ date: -1 });

    res.json({ transactions });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/*
|--------------------------------------------------------------------------
| UPDATE transaksi
|--------------------------------------------------------------------------
*/
exports.updateTransaction = async (req, res) => {
  try {
    const { id } = req.params;
    const { type, category, amount, note, date } = req.body;

    const user = await User.findById(req.userId);
    const oldTx = await Transaction.findOne({ _id: id, user: req.userId });

    if (!oldTx) {
      return res.status(404).json({ message: "Transaksi tidak ditemukan" });
    }

    // UNDO efek transaksi lama
    if (oldTx.type === "INCOME") {
      user.mainBalance -= oldTx.amount;
    } else if (oldTx.type === "EXPENSE") {
      user.mainBalance += oldTx.amount;
    }

    // APPLY update baru
    oldTx.type = type || oldTx.type;
    oldTx.category = oldTx.type === "EXPENSE" ? (category || oldTx.category) : null;
    oldTx.amount = amount !== undefined ? Number(amount) : oldTx.amount;
    oldTx.note = note !== undefined ? note : oldTx.note;
    oldTx.date = date || oldTx.date;

    // APPLY efek baru
    if (oldTx.type === "INCOME") {
      user.mainBalance += oldTx.amount;
    } else if (oldTx.type === "EXPENSE") {
      user.mainBalance -= oldTx.amount;
    }

    await user.save();
    await oldTx.save();

    res.json({
      message: "Transaksi berhasil diupdate",
      transaction: oldTx,
      mainBalance: user.mainBalance,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/*
|--------------------------------------------------------------------------
| DELETE transaksi
|--------------------------------------------------------------------------
*/
exports.deleteTransaction = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(req.userId);
    const tx = await Transaction.findOne({ _id: id, user: req.userId });

    if (!tx) {
      return res.status(404).json({ message: "Transaksi tidak ditemukan" });
    }

    // Hapus file receipt jika ada
    if (tx.receiptUrl) {
      // **PERBAIKAN: Handle baik relative path maupun absolute URL**
      const filename = tx.receiptUrl.split('/').pop();
      const filePath = path.join(__dirname, '../uploads', filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        console.log("✅ File berhasil dihapus:", filePath);
      } else {
        console.log("❌ File tidak ditemukan untuk dihapus:", filePath);
      }
    }

    // UNDO efek transaksi
    if (tx.type === "INCOME") {
      user.mainBalance -= tx.amount;
    } else if (tx.type === "EXPENSE") {
      user.mainBalance += tx.amount;
    }

    await user.save();
    await tx.deleteOne();

    res.json({
      message: "Transaksi berhasil dihapus",
      mainBalance: user.mainBalance,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/*  
|--------------------------------------------------------------------------
| TRANSFER ke TABUNGAN
|--------------------------------------------------------------------------
*/
exports.transferToSaving = async (req, res) => {
  try {
    const { amount, note, date } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ message: "Amount harus > 0" });
    }

    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: "User tidak ditemukan" });

    if (user.mainBalance < amount) {
      return res.status(400).json({ message: "Saldo utama tidak cukup" });
    }

    user.mainBalance -= Number(amount);
    user.savingBalance += Number(amount);
    await user.save();

    const tx = await Transaction.create({
      user: req.userId,
      type: "TRANSFER_TO_SAVING",
      amount: Number(amount),
      note: note || "Pindah ke tabungan",
      date: date || new Date(),
    });

    res.json({
      message: "Berhasil pindahkan ke tabungan",
      transaction: tx,
      mainBalance: user.mainBalance,
      savingBalance: user.savingBalance,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/*
|--------------------------------------------------------------------------
| TRANSFER dari TABUNGAN ke saldo utama
|--------------------------------------------------------------------------
*/
exports.transferFromSaving = async (req, res) => {
  try {
    const { amount, note, date } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ message: "Amount harus > 0" });
    }

    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: "User tidak ditemukan" });

    if (user.savingBalance < amount) {
      return res.status(400).json({ message: "Saldo tabungan tidak cukup" });
    }

    user.savingBalance -= Number(amount);
    user.mainBalance += Number(amount);
    await user.save();

    const tx = await Transaction.create({
      user: req.userId,
      type: "TRANSFER_FROM_SAVING",
      amount: Number(amount),
      note: note || "Tarik dari tabungan",
      date: date || new Date(),
    });

    res.json({
      message: "Berhasil tarik dari tabungan",
      transaction: tx,
      mainBalance: user.mainBalance,
      savingBalance: user.savingBalance,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};