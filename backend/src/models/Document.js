const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  filename:     { type: String, required: true },
  originalName: { type: String, required: true },
  fileType:     { type: String, enum: ['pdf', 'txt', 'docx'], required: true },
  fileSize:     { type: Number, required: true },
  status: {
    type: String,
    enum: ['uploading', 'processing', 'ready', 'failed'],
    default: 'uploading',
  },
  chunkCount:   { type: Number, default: 0 },
  vectorIds:    [{ type: String }],
}, { timestamps: true });

documentSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('Document', documentSchema);