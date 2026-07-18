const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: { type: String, required: true, trim: true },
  type: {
    type: String,
    enum: ['text', 'announcement', 'system'],
    default: 'text'
  },
  reactions: [{
    emoji: String,
    users: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
  }],
  isDeleted: { type: Boolean, default: false }
}, { timestamps: true });

messageSchema.index({ createdAt: -1 });
messageSchema.index({ isDeleted: 1 });

module.exports = mongoose.model('Message', messageSchema);