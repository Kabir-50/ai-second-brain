const path                   = require('path');
const fs                     = require('fs');
const Document               = require('../models/Document');
const processDocument        = require('../services/processDocument');
const { deleteDocumentVectors } = require('../services/vectorService');

exports.uploadDocument = async (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

  const ext = path.extname(req.file.originalname).toLowerCase().replace('.', '');

  const doc = await Document.create({
    user:         req.user._id,
    filename:     req.file.filename,
    originalName: req.file.originalname,
    fileType:     ext,
    fileSize:     req.file.size,
    status:       'processing',
  });

  res.status(201).json(doc);

  processDocument(doc._id, req.user._id).catch(err =>
    console.error('Background processing error:', err.message)
  );
};

exports.getDocuments = async (req, res) => {
  const docs = await Document.find({ user: req.user._id }).sort('-createdAt');
  res.json(docs);
};

exports.deleteDocument = async (req, res) => {
  const doc = await Document.findOne({ _id: req.params.id, user: req.user._id });
  if (!doc) return res.status(404).json({ message: 'Document not found' });

  const filePath = path.join(__dirname, '../../uploads', doc.filename);
  if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

  await deleteDocumentVectors(doc._id);
  await doc.deleteOne();
  res.json({ message: 'Document deleted' });
};