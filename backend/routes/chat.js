// routes/chat.js
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { getRoom, getMessages, saveMessage, getConversations } = require('../controllers/chatController');

router.get('/room/:userId', protect, getRoom);
router.get('/messages/:roomId', protect, getMessages);
router.post('/messages', protect, saveMessage);
router.get('/conversations', protect, getConversations);

module.exports = router;
