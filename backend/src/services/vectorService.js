const { getOrCreateCollection } = require('../config/chromaClient');
const { getEmbedding, getEmbeddingsBatch } = require('./embeddingService');

const COLLECTION_NAME = 'documents';

const storeChunks = async (documentId, userId, chunks) => {
  const collection = await getOrCreateCollection(COLLECTION_NAME);

  const texts      = chunks.map(c => c.text);
  const embeddings = await getEmbeddingsBatch(texts);

  const ids       = chunks.map((_, i) => `${documentId}_chunk_${i}`);
  const metadatas = chunks.map((c, i) => ({
    documentId: documentId.toString(),
    userId:     userId.toString(),
    chunkIndex: i,
    chunkText:  c.text.slice(0, 500),
  }));

  await collection.add({
    ids,
    embeddings,
    documents: texts,
    metadatas,
  });

  console.log(`✅ Stored ${chunks.length} vectors for document ${documentId}`);
  return ids;
};

const searchSimilarChunks = async (query, userId, documentId, topK = 5) => {
  const collection    = await getOrCreateCollection(COLLECTION_NAME);
  const queryEmbedding = await getEmbedding(query);

  const where = documentId
    ? { $and: [{ userId: userId.toString() }, { documentId: documentId.toString() }] }
    : { userId: userId.toString() };

  const results = await collection.query({
    queryEmbeddings: [queryEmbedding],
    nResults:        topK,
    where,
  });

  if (!results.documents?.[0]?.length) return [];

  return results.documents[0].map((text, i) => ({
    text,
    metadata: results.metadatas[0][i],
    distance: results.distances[0][i],
  }));
};

const deleteDocumentVectors = async (documentId) => {
  const collection = await getOrCreateCollection(COLLECTION_NAME);
  await collection.delete({ where: { documentId: documentId.toString() } });
  console.log(`🗑️ Deleted vectors for document ${documentId}`);
};

module.exports = { storeChunks, searchSimilarChunks, deleteDocumentVectors };