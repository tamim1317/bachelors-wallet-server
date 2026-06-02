const mongoose = require('mongoose');

const noticeSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title দিন'],
    trim: true
  },
  content: {
    type: String,
    required: [true, 'Content দিন'],
    trim: true
  },
  type: {
    type: String,
    enum: ['info', 'warning', 'urgent', 'general'],
    default: 'general'
  },
  postedBy: { type: String, default: 'Manager' },
  isPinned: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Notice', noticeSchema);