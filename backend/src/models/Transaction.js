const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // INCOME / EXPENSE / TRANSFER_TO_SAVING / TRANSFER_FROM_SAVING
    type: {
      type: String,
      enum: ["INCOME", "EXPENSE", "TRANSFER_TO_SAVING", "TRANSFER_FROM_SAVING"],
      required: true,
    },

    // Dipakai untuk EXPENSE saja
    category: {
      type: String,
      enum: [
        "Makanan & Minuman",
        "Tempat Tinggal",
        "Transportasi",
        "Pakaian",
        "Kesehatan",
        "Lain-lain",
        null,        // kalau mau boleh null untuk INCOME
      ],
      default: null,
    },

    amount: {
      type: Number,
      required: true,
      min: 0,
    },

    note: {
      type: String,
      default: "",
    },

    date: {
      type: Date,
      default: Date.now,
    },

    // TAMBAHKAN FIELD RECEIPT URL
    receiptUrl: {
      type: String,
      default: null,
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Transaction", transactionSchema);