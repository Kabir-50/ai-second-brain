const mongoose = require('mongoose');

const chatSessionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  document: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Document',
    required: true,
  },
  title: { type: String, default: 'New Chat' },
}, { timestamps: true });

chatSessionSchema.index({ user: 1, document: 1 });

module.exports = mongoose.model('ChatSession', chatSessionSchema);