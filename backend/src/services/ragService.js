const { searchSimilarChunks } = require('./vectorService');
const { askLLM, streamLLM }   = require('./llmService');

const SYSTEM_PROMPT = `You are a helpful AI assistant that answers questions based strictly on the provided document context.
Rules:
- Answer ONLY from the provided context
- If the answer is not in the context, say "I couldn't find information about that in the uploaded document."
- Be concise and clear
- Quote relevant parts when helpful`;

const buildPrompt = (question, chunks) => {
  const context = chunks.map((c, i) => `[Chunk ${i + 1}]:\n${c.text}`).join('\n\n');
  return `Context from document:\n\n${context}\n\nQuestion: ${question}`;
};

const ragQuery = async (question, userId, documentId) => {
  const chunks = await searchSimilarChunks(question, userId, documentId, 5);
  if (!chunks.length) {
    return {
      answer:  "I couldn't find relevant information in the uploaded document.",
      sources: [],
    };
  }

  const prompt = buildPrompt(question, chunks);
  const answer = await askLLM(prompt, SYSTEM_PROMPT);

  return {
    answer,
    sources: chunks.map(c => ({
      chunkText:  c.text,
      documentId: c.metadata.documentId,
    })),
  };
};

const ragQueryStream = async (question, userId, documentId, onChunk) => {
  const chunks = await searchSimilarChunks(question, userId, documentId, 5);
  if (!chunks.length) {
    onChunk?.("I couldn't find relevant information in the uploaded document.");
    return { sources: [] };
  }

  const prompt = buildPrompt(question, chunks);
  await streamLLM(prompt, SYSTEM_PROMPT, onChunk);

  return {
    sources: chunks.map(c => ({
      chunkText:  c.text,
      documentId: c.metadata.documentId,
    })),
  };
};

module.exports = { ragQuery, ragQueryStream };