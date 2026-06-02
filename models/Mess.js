const mongoose = require('mongoose');

const messSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Mess এর নাম দিন'],
    trim: true
  },
  address: { type: String, trim: true },
  description: { type: String, trim: true },
  color: { type: String, default: '#1d4ed8' },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Mess', messSchema);