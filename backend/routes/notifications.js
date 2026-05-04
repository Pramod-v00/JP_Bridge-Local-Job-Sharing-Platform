// routes/notifications.js
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { getNotifications, markNotificationsRead } = require('../controllers/usersController');

router.get('/', protect, getNotifications);
router.patch('/read', protect, markNotificationsRead);

module.exports = router;
