const { ChromaClient } = require('chromadb');

const client = new ChromaClient({
  host: 'localhost',
  port: 8000,
  ssl:  false,
});

const embeddingFunction = {
  generate: async (texts) => texts.map(() => []),
};

const getOrCreateCollection = async (collectionName) => {
  return await client.getOrCreateCollection({
    name:               collectionName,
    metadata:           { 'hnsw:space': 'cosine' },
    embeddingFunction,
  });
};

module.exports = { client, getOrCreateCollection };