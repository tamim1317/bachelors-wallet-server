const mongoose = require('mongoose');

const budgetSchema = new mongoose.Schema({
  month: { type: String, required: true }, // "2026-06"
  totalBudget: { type: Number, required: true },
  categories: [{
    name: { type: String, required: true },
    limit: { type: Number, required: true }
  }]
}, { timestamps: true });

budgetSchema.index({ month: 1 }, { unique: true });

module.exports = mongoose.model('Budget', budgetSchema);