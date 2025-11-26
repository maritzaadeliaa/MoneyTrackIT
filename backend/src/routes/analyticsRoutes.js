const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const {
  getCategoryStats,
  getSummary,
  getDailyExpense,
} = require("../controllers/analyticsController");

router.use(authMiddleware);

// chart per kategori
router.get("/categories", getCategoryStats);

// ringkasan saldo + income/expense + status kategori
router.get("/summary", getSummary);

// total pengeluaran per hari
router.get("/daily-expense", getDailyExpense);

module.exports = router;
