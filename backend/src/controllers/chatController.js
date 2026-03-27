const ChatSession           = require('../models/ChatSession');
const Message               = require('../models/Message');
const Document              = require('../models/Document');
const { ragQueryStream }    = require('../services/ragService');

exports.createSession = async (req, res) => {
  const { documentId } = req.body;
  const doc = await Document.findOne({ _id: documentId, user: req.user._id });
  if (!doc) return res.status(404).json({ message: 'Document not found' });
  if (doc.status !== 'ready')
    return res.status(400).json({ message: 'Document is still processing' });

  const session = await ChatSession.create({
    user:     req.user._id,
    document: documentId,
    title:    `Chat – ${doc.originalName}`,
  });
  res.status(201).json(session);
};

exports.getSessions = async (req, res) => {
  const sessions = await ChatSession.find({ user: req.user._id })
    .populate('document', 'originalName status')
    .sort('-createdAt');
  res.json(sessions);
};

exports.getMessages = async (req, res) => {
  const session = await ChatSession.findOne({
    _id: req.params.sessionId, user: req.user._id,
  });
  if (!session) return res.status(404).json({ message: 'Session not found' });
  const messages = await Message.find({ session: session._id }).sort('createdAt');
  res.json(messages);
};

exports.deleteSession = async (req, res) => {
  const session = await ChatSession.findOne({
    _id: req.params.sessionId, user: req.user._id,
  });
  if (!session) return res.status(404).json({ message: 'Session not found' });
  await Message.deleteMany({ session: session._id });
  await session.deleteOne();
  res.json({ message: 'Session deleted' });
};

exports.sendMessage = async (req, res) => {
  const { question } = req.body;
  const { sessionId } = req.params;

  const session = await ChatSession.findOne({
    _id: sessionId, user: req.user._id,
  }).populate('document');
  if (!session) return res.status(404).json({ message: 'Session not found' });

  // Save user message
  await Message.create({ session: sessionId, role: 'user', content: question });

  // Set up SSE stream
  res.setHeader('Content-Type',  'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection',    'keep-alive');

  let fullAnswer = '';

  const { sources } = await ragQueryStream(
    question,
    req.user._id,
    session.document._id.toString(),
    (chunk) => {
      fullAnswer += chunk;
      res.write(`data: ${JSON.stringify({ type: 'chunk', text: chunk })}\n\n`);
    }
  );

  // Save assistant message
  await Message.create({
    session:  sessionId,
    role:     'assistant',
    content:  fullAnswer,
    sources,
  });

  res.write(`data: ${JSON.stringify({ type: 'done', sources })}\n\n`);
  res.end();
};