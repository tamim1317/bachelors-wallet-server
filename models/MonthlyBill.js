const mongoose = require('mongoose');

const monthlyBillSchema = new mongoose.Schema({
  month: { type: String, required: true }, // "2025-06"
  memberId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Member',
    required: true
  },
  totalMeals: { type: Number, default: 0 },
  mealRate:   { type: Number, default: 0 },  // প্রতি মিলের রেট
  mealCost:   { type: Number, default: 0 },  // totalMeals × mealRate
  extraCost:  { type: Number, default: 0 },  // গ্যাস, পানি ভাগ
  totalBill:  { type: Number, default: 0 },
  paid:       { type: Boolean, default: false },
  paidDate:   { type: Date, default: null }
}, { timestamps: true });

monthlyBillSchema.index({ month: 1, memberId: 1 }, { unique: true });

module.exports = mongoose.model('MonthlyBill', monthlyBillSchema);
