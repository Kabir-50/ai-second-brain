const express     = require('express');
const router      = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { askLLM }  = require('../services/llmService');

router.use(protect);

router.post('/ask', async (req, res) => {
  const { prompt } = req.body;
  if (!prompt) return res.status(400).json({ message: 'prompt required' });

  const answer = await askLLM(
    prompt,
    'You are a helpful assistant. Answer clearly and concisely.'
  );
  res.json({ answer });
});

router.post('/ask-with-context', async (req, res) => {
  const { question, context } = req.body;
  if (!question || !context)
    return res.status(400).json({ message: 'question and context required' });

  const systemPrompt = `You are a helpful assistant. Answer the user's question 
ONLY using the provided context. If the answer is not in the context, say 
"I don't have enough information to answer this."`;

  const answer = await askLLM(`Context:\n${context}\n\nQuestion: ${question}`, systemPrompt);
  res.json({ answer });
});

module.exports = router;