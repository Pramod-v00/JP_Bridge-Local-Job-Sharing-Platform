const { Message } = require('../models');
const { createRoomId } = require('../utils/helpers');

// GET /api/chat/room/:userId - Get/create room with another user
const getRoom = async (req, res) => {
  try {
    const roomId = createRoomId(req.user._id.toString(), req.params.userId);
    res.json({ roomId });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/chat/messages/:roomId - Get messages for a room
const getMessages = async (req, res) => {
  try {
    const messages = await Message.find({ roomId: req.params.roomId })
      .populate('senderId', 'name profilePhoto')
      .sort({ createdAt: 1 })
      .limit(100);

    // Mark as read
    await Message.updateMany(
      { roomId: req.params.roomId, receiverId: req.user._id, read: false },
      { read: true }
    );

    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/chat/messages - Save message to DB
const saveMessage = async (req, res) => {
  try {
    const { roomId, receiverId, message } = req.body;
    const msg = await Message.create({
      roomId,
      senderId: req.user._id,
      receiverId,
      message,
    });
    const populated = await msg.populate('senderId', 'name profilePhoto');
    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/chat/conversations - Get all conversations for current user
const getConversations = async (req, res) => {
  try {
    const userId = req.user._id.toString();

    const messages = await Message.find({
      $or: [{ senderId: req.user._id }, { receiverId: req.user._id }],
    })
      .sort({ createdAt: -1 })
      .populate('senderId', 'name profilePhoto')
      .populate('receiverId', 'name profilePhoto');

    // Group by roomId, get latest message per room
    const rooms = {};
    for (const msg of messages) {
      if (!rooms[msg.roomId]) {
        rooms[msg.roomId] = msg;
      }
    }

    res.json(Object.values(rooms));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getRoom, getMessages, saveMessage, getConversations };
