const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },

  email: {
    type: String,
    required: true,
    unique: true
  },

  password: {
    type: String,
    required: true
  },

  mainBalance: {
    type: Number,
    default: 0   // uang utama
  },

  savingBalance: {
    type: Number,
    default: 0   // tabungan
  }
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);
