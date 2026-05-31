const mongoose = require('mongoose');

const mealSchema = new mongoose.Schema({
  memberId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Member',
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  breakfast: { type: Boolean, default: false },
  lunch:     { type: Boolean, default: false },
  dinner:    { type: Boolean, default: false },
  guestMeals: { type: Number, default: 0 }
}, { timestamps: true });

// একজন member-এর একটি দিনে একটাই entry থাকবে
mealSchema.index({ memberId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Meal', mealSchema);
