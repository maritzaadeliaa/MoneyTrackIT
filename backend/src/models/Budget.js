const mongoose = require("mongoose");

const budgetSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  budgets: [
    {
      category: {
        type: String,
        enum: ["food", "housing", "transport", "clothing", "medical", "others"],
        required: true
      },
      maxBudget: {
        type: Number,
        required: true,
        min: 0
      }
    }
  ]
}, { timestamps: true });

module.exports = mongoose.model("Budget", budgetSchema);
