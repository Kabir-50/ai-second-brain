const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  session: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ChatSession',
    required: true,
  },
  role:    { type: String, enum: ['user', 'assistant'], required: true },
  content: { type: String, required: true },
  sources: [{ 
    chunkText:  String,
    documentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Document' },
  }],
}, { timestamps: true });

messageSchema.index({ session: 1, createdAt: 1 });

module.exports = mongoose.model('Message', messageSchema);