const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const {
  createTransaction,
  getTransactions,
  updateTransaction,
  deleteTransaction,
  transferToSaving,
  transferFromSaving,
  uploadReceipt
} = require("../controllers/transactionController");

// semua route transaksi wajib login
router.use(authMiddleware);

// CRUD income/expense - PAKAI UPLOAD MIDDLEWARE UNTUK CREATE
router.post("/", uploadReceipt, createTransaction);
router.get("/", getTransactions);
router.put("/:id", updateTransaction);
router.delete("/:id", deleteTransaction);

// Saving
router.post("/transfer/to-saving", transferToSaving);
router.post("/transfer/from-saving", transferFromSaving);

module.exports = router;