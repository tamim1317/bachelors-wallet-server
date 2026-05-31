const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['mess', 'personal'],
    required: true
  },
  category: {
    type: String,
    required: true,
    // mess: 'bazar', 'utility', 'other'
    // personal: 'rent', 'food', 'transport', 'mobile', 'education', 'shopping', 'other'
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  date: {
    type: Date,
    default: Date.now
  },
  note: { type: String, trim: true },
  memberId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Member',
    default: null // null = mess expense, memberId = personal expense
  },
  addedBy: { type: String, default: 'manager' }
}, { timestamps: true });

module.exports = mongoose.model('Expense', expenseSchema);
