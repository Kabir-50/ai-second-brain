const { RecursiveCharacterTextSplitter } = require('@langchain/textsplitters');

const chunkText = async (text) => {
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize:    800,
    chunkOverlap: 100,
    separators: ['\n\n', '\n', '. ', ' ', ''],
  });

  const chunks = await splitter.createDocuments([text]);

  return chunks.map((chunk, index) => ({
    index,
    text:     chunk.pageContent,
    length:   chunk.pageContent.length,
  }));
};

module.exports = chunkText;