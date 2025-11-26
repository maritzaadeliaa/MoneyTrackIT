const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const { setBudgets, getBudgets } = require("../controllers/budgetController");

router.use(authMiddleware);

router.post("/", setBudgets);     // set/update budget
router.get("/", getBudgets);      // ambil budget user

module.exports = router;
