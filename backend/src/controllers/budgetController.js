const Budget = require("../models/Budget");

// SET budget per kategori
exports.setBudgets = async (req, res) => {
  try {
    const { budgets } = req.body; 

    console.log("Data diterima dari frontend:", { budgets, userId: req.userId });

    if (!budgets || !Array.isArray(budgets)) {
      return res.status(400).json({ 
        message: "Budgets harus berupa array" 
      });
    }

    // Validasi setiap item dalam array
    for (let i = 0; i < budgets.length; i++) {
      const budget = budgets[i];
      
      if (!budget.category || typeof budget.category !== 'string') {
        return res.status(400).json({ 
          message: `Budget ke-${i + 1}: Kategori harus berupa string` 
        });
      }
      
      if (budget.maxBudget === undefined || budget.maxBudget === null || isNaN(Number(budget.maxBudget))) {
        return res.status(400).json({ 
          message: `Budget ke-${i + 1}: maxBudget harus berupa angka yang valid` 
        });
      }
      
      // Convert to number untuk memastikan
      budget.maxBudget = Number(budget.maxBudget);
      
      if (budget.maxBudget < 0) {
        return res.status(400).json({ 
          message: `Budget ke-${i + 1}: maxBudget tidak boleh negatif` 
        });
      }
    }

    // cari budget user
    let userBudget = await Budget.findOne({ user: req.userId });

    if (!userBudget) {
      // kalau belum ada → buat baru
      userBudget = await Budget.create({
        user: req.userId,
        budgets
      });
      console.log("Budget baru dibuat:", userBudget);
    } else {
      // update existing
      userBudget.budgets = budgets;
      await userBudget.save();
      console.log("Budget updated:", userBudget);
    }

    res.json({
      message: "Budget berhasil disimpan",
      budgets: userBudget.budgets
    });

  } catch (error) {
    console.error("Error in setBudgets:", error);
    res.status(500).json({ 
      message: "Internal server error",
      error: error.message 
    });
  }
};

// GET budget user
exports.getBudgets = async (req, res) => {
  try {
    const userBudget = await Budget.findOne({ user: req.userId });

    if (!userBudget) {
      return res.json({ budgets: [] });
    }

    res.json({ budgets: userBudget.budgets });
  } catch (error) {
    console.error("Error in getBudgets:", error);
    res.status(500).json({ message: error.message });
  }
};