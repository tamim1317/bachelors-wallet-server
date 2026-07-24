const mongoose = require('mongoose');

const memberSchema = new mongoose.Schema({
  messId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Mess',
    default: null
  },
  photo: { type: String, default: '' },
  name: {
    type: String,
    required: [true, 'নাম দেওয়া আবশ্যক'],
    trim: true
  },
  room: {
    type: String,
    trim: true
  },
  phone: {
    type: String,
    trim: true
  },
  joinDate: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['active', 'left'],
    default: 'active'
  }
}, { timestamps: true });

memberSchema.index({ name: 1 });
memberSchema.index({ phone: 1 });

module.exports = mongoose.model('Member', memberSchema);
