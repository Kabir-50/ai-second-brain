const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const getModel = () =>
  genAI.getGenerativeModel({ model: process.env.GEMINI_MODEL || 'gemini-2.5-flash' });

const askLLM = async (prompt, systemPrompt = '') => {
  const model  = getModel();
  const result = await model.generateContent({
    systemInstruction: systemPrompt || undefined,
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
  });
  return result.response.text().trim();
};

const streamLLM = async (prompt, systemPrompt = '', onChunk) => {
  const model  = getModel();
  const result = await model.generateContentStream({
    systemInstruction: systemPrompt || undefined,
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
  });

  let fullText = '';
  for await (const chunk of result.stream) {
    const text = chunk.text();
    fullText += text;
    onChunk?.(text);
  }
  return fullText;
};

const checkGemini = async () => {
  try {
    await askLLM('Say OK', 'You are a test assistant.');
    return { running: true, model: process.env.GEMINI_MODEL };
  } catch (err) {
    return { running: false, error: err.message };
  }
};

module.exports = { askLLM, streamLLM, checkGemini };