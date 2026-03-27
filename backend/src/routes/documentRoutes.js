const express    = require('express');
const router     = express.Router();
const { protect } = require('../middleware/authMiddleware');
const upload     = require('../config/multer');
const Document        = require('../models/Document');
const extractText     = require('../services/extractText');
const chunkText       = require('../services/chunkText');
const { searchSimilarChunks } = require('../services/vectorService');
const {
  uploadDocument,
  getDocuments,
  deleteDocument,
} = require('../controllers/documentController');

router.use(protect);
router.post('/upload', upload.single('file'), uploadDocument);
router.get('/',        getDocuments);
router.delete('/:id',  deleteDocument);

// Debug route — inspect chunks of a document
router.get('/:id/chunks', async (req, res) => {
  const doc = await Document.findOne({ _id: req.params.id, user: req.user._id });
  if (!doc) return res.status(404).json({ message: 'Not found' });

  const text   = await extractText(doc.filename, doc.fileType);
  const chunks = await chunkText(text);
  res.json({ total: chunks.length, chunks });
});


// Test semantic search
router.post('/search', async (req, res) => {
  const { query, documentId } = req.body;
  if (!query) return res.status(400).json({ message: 'query required' });

  const results = await searchSimilarChunks(
    query,
    req.user._id,
    documentId || null,
    5
  );
  res.json({ results });
});

module.exports = router;
