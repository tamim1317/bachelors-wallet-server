const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
  roomNumber: {
    type: String,
    required: [true, 'রুম নম্বর দিন'],
    trim: true
  },
  floor: { type: String, trim: true },
  capacity: { type: Number, default: 1 },
  monthlyRent: { type: Number, default: 0 },
  status: {
    type: String,
    enum: ['occupied', 'vacant', 'maintenance'],
    default: 'vacant'
  },
  occupants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Member'
  }],
  amenities: [String],
  notes: { type: String, trim: true }
}, { timestamps: true });

module.exports = mongoose.model('Room', roomSchema);