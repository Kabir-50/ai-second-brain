const express     = require('express');
const router      = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  createSession, getSessions,
  getMessages,   deleteSession,
  sendMessage,
} = require('../controllers/chatController');

router.use(protect);
router.post('/', createSession);
router.get('/',  getSessions);
router.get('/:sessionId/messages', getMessages);
router.delete('/:sessionId', deleteSession);
router.post('/:sessionId/message', sendMessage);

module.exports = router;