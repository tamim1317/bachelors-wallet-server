const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  messName: { type: String, default: "Bachelor's Wallet" },
  currencySymbol: { type: String, default: '৳' },
  
  // Meal weights
  mealWeights: {
    breakfast: { type: Number, default: 0.5 },
    lunch:     { type: Number, default: 1.0 },
    dinner:    { type: Number, default: 1.0 },
  },

  // Bill calculation
  billMethod: {
    type: String,
    enum: ['meal_based', 'equal_split'],
    default: 'meal_based'
  },

  // Expense categories
  messCategories:     { type: [String], default: ['বাজার', 'গ্যাস', 'বিদ্যুৎ', 'পানি', 'অন্যান্য'] },
  personalCategories: { type: [String], default: ['রুম ভাড়া', 'বাইরে খাওয়া', 'ট্রান্সপোর্ট', 'মোবাইল রিচার্জ', 'পড়াশোনা', 'শপিং', 'অন্যান্য'] },

  // Notification
  mealReminderTime: { type: String, default: '21:00' },
  reminderEnabled:  { type: Boolean, default: true },

  mealWindows: {
  breakfast: {
    start: { type: String, default: '07:00' },
    end:   { type: String, default: '09:00' },
    enabled: { type: Boolean, default: true }
  },
  lunch: {
    start: { type: String, default: '12:00' },
    end:   { type: String, default: '14:00' },
    enabled: { type: Boolean, default: true }
  },
  dinner: {
    start: { type: String, default: '19:00' },
    end:   { type: String, default: '21:00' },
    enabled: { type: Boolean, default: true }
  }
},
managerOverride: { type: Boolean, default: true },

}, { timestamps: true });

module.exports = mongoose.model('Settings', settingsSchema);