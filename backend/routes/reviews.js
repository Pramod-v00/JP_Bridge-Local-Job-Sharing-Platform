const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { createReview, getReviewsForUser } = require('../controllers/usersController');

router.post('/', protect, createReview);
router.get('/user/:userId', protect, getReviewsForUser);

module.exports = router;
