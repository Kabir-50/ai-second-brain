const Document       = require('../models/Document');
const extractText    = require('./extractText');
const chunkText      = require('./chunkText');
const { storeChunks } = require('./vectorService');

const processDocument = async (documentId, userId) => {
  const doc = await Document.findById(documentId);
  if (!doc) throw new Error('Document not found');

  try {
    await Document.findByIdAndUpdate(documentId, { status: 'processing' });

    const rawText = await extractText(doc.filename, doc.fileType);
    if (!rawText?.trim()) throw new Error('No text extracted from document');

    const chunks  = await chunkText(rawText);
    const ids     = await storeChunks(documentId, userId, chunks);

    await Document.findByIdAndUpdate(documentId, {
      status:     'ready',
      chunkCount: chunks.length,
      vectorIds:  ids,
    });

    console.log(`✅ Processed "${doc.originalName}" → ${chunks.length} chunks embedded`);
    return chunks;

  } catch (err) {
    await Document.findByIdAndUpdate(documentId, { status: 'failed' });
    console.error(`❌ Failed to process ${documentId}:`, err.message);
    throw err;
  }
};

module.exports = processDocument;