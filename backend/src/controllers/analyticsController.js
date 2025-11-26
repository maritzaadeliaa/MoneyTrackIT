const Transaction = require("../models/Transaction");
const Budget = require("../models/Budget");
const User = require("../models/User");

// HELPER: biar nama kategori bisa ditampilkan lebih manusiawi
const categoryDisplayName = (cat) => {
  const map = {
    food: "Makanan & Minuman",
    housing: "Tempat Tinggal",
    transport: "Transportasi",
    clothing: "Pakaian",
    medical: "Kesehatan",
    others: "Lain-lain"
  };
  return map[cat] || cat;
};


// Tambahkan mapper kebalikan UI → kode kategori
const categoryToCode = {
  "Makanan & Minuman": "food",
  "Tempat Tinggal": "housing",
  "Transportasi": "transport",
  "Pakaian": "clothing",
  "Kesehatan": "medical",
  "Lain-lain": "others",
};

/*
|--------------------------------------------------------------------------
| 1. TOTAL PENGELUARAN PER KATEGORI (untuk pie chart)
|--------------------------------------------------------------------------
*/
exports.getCategoryStats = async (req, res) => {
  try {
    const { from, to } = req.query;

    const match = {
      user: req.userId,
      type: "EXPENSE",
    };

    if (from || to) {
      match.date = {};
      if (from) match.date.$gte = new Date(from);
      if (to) match.date.$lte = new Date(to);
    }

    const result = await Transaction.aggregate([
      { $match: match },
      {
        $group: {
          _id: "$category",
          total: { $sum: "$amount" },
        },
      },
    ]);

    const formatted = result.map((r) => ({
      category: r._id,
      total: r.total,
    }));

    res.json({ data: formatted });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


/*
|--------------------------------------------------------------------------
| 2. SUMMARY: balance, total income/expense, status hemat/boros per kategori
|--------------------------------------------------------------------------
*/
exports.getSummary = async (req, res) => {
  try {
    const { from, to } = req.query;

    const user = await User.findById(req.userId).select(
      "mainBalance savingBalance name email"
    );
    if (!user) return res.status(404).json({ message: "User tidak ditemukan" });

    // Aggregate total income & total expense
    const baseMatch = { user: req.userId };
    if (from || to) {
      baseMatch.date = {};
      if (from) baseMatch.date.$gte = new Date(from);
      if (to) baseMatch.date.$lte = new Date(to);
    }

    const incomeExpenseAgg = await Transaction.aggregate([
      { $match: baseMatch },
      {
        $group: {
          _id: "$type",
          total: { $sum: "$amount" },
        },
      },
    ]);

    let totalIncome = 0;
    let totalExpense = 0;
    incomeExpenseAgg.forEach((row) => {
      if (row._id === "INCOME") totalIncome = row.total;
      if (row._id === "EXPENSE") totalExpense = row.total;
    });

    // Ambil budget user
    const budgetDoc = await Budget.findOne({ user: req.userId });

    // Aggregate pengeluaran per kategori
    const catMatch = {
      user: req.userId,
      type: "EXPENSE",
    };
    if (from || to) {
      catMatch.date = {};
      if (from) catMatch.date.$gte = new Date(from);
      if (to) catMatch.date.$lte = new Date(to);
    }

        // AGGREGATE TRANSAKSI, tapi convert kategori UI → code
    const catAggRaw = await Transaction.aggregate([
      { $match: catMatch },
      {
        $group: {
          _id: "$category",
          spent: { $sum: "$amount" },
        },
      },
    ]);

    // Konversi kategori UI → kode backend
    const catAgg = catAggRaw.map(row => ({
      _id: categoryToCode[row._id] || row._id,
      spent: row.spent,
    }));


    // Map spent per kategori
   const spentMap = {};
catAgg.forEach((row) => {
  spentMap[row._id] = row.spent;
});


    // Gabungkan dengan budget jadi status hemat/boros
    const categoryStatus = [];

    const allCategories = ["food", "housing", "transport", "clothing", "medical", "others"];

    allCategories.forEach((cat) => {
      const spent = spentMap[cat] || 0;

      let budget = null;
      let percentage = null;
      let statusMessage = "Belum ada batas pengeluaran untuk kategori ini.";

      if (budgetDoc && Array.isArray(budgetDoc.budgets)) {
        const found = budgetDoc.budgets.find((b) => b.category === cat);
        if (found) {
          budget = found.maxBudget;
        }
      }

      if (budget && budget > 0) {
        percentage = (spent / budget) * 100;

        if (percentage < 50) {
          statusMessage = `Hebat, kamu hemat di kategori ${categoryDisplayName(cat)} 🥰`;
        } else if (percentage < 80) {
          statusMessage = `Masih aman, tetap kontrol ya untuk ${categoryDisplayName(cat)} 🙂`;
        } else if (percentage < 100) {
          statusMessage = `Hati-hati, pengeluaranmu untuk ${categoryDisplayName(cat)} sudah mendekati batas 😥`;
        } else {
          statusMessage = `Limit terlampaui! Coba rem dulu pengeluaran di ${categoryDisplayName(cat)} 🚨`;
        }
      }

      categoryStatus.push({
        category: cat,
        displayName: categoryDisplayName(cat),
        spent,
        budget,
        percentage,
        statusMessage,
      });
    });

    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
      mainBalance: user.mainBalance,
      savingBalance: user.savingBalance,
      totalIncome,
      totalExpense,
      categoryStatus,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


/*
|--------------------------------------------------------------------------
| 3. DAILY EXPENSE: total pengeluaran per hari (buat list/sort by date)
|--------------------------------------------------------------------------
*/
exports.getDailyExpense = async (req, res) => {
  try {
    const { from, to } = req.query;

    const match = {
      user: req.userId,
      type: "EXPENSE",
    };

    if (from || to) {
      match.date = {};
      if (from) match.date.$gte = new Date(from);
      if (to) match.date.$lte = new Date(to);
    }

    const result = await Transaction.aggregate([
      { $match: match },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$date" },
          },
          totalExpense: { $sum: "$amount" },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const formatted = result.map((r) => ({
      date: r._id,
      totalExpense: r.totalExpense,
    }));

    res.json({ data: formatted });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
