const mongoose = require('mongoose');

const incomeSchema = new mongoose.Schema({
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  source: {
    type: String,
    required: true,
    // টিউশনি, বাবার কাছ থেকে, চাকরি, ফ্রিল্যান্সিং, অন্যান্য
  },
  month: { type: String, required: true }, // "2026-06"
  note: { type: String, trim: true },
  date: { type: Date, default: Date.now }
}, { timestamps: true });
incomeSchema.index({ month: 1 });
incomeSchema.index({ date: -1 });

module.exports = mongoose.model('Income', incomeSchema);