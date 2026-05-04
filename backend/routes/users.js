const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { uploadProfile } = require('../config/cloudinary');
const {
  getProfile, updateProfile, updateLocation, searchWorkers, blockUser,
} = require('../controllers/usersController');

router.get('/me', protect, (req, res) => getProfile({ ...req, params: { id: req.user._id } }, res));
router.get('/profile/:id', protect, getProfile);
router.put('/profile', protect, uploadProfile.single('profilePhoto'), updateProfile);
router.patch('/location', protect, updateLocation);
router.get('/search', protect, searchWorkers);
router.post('/block/:id', protect, blockUser);

module.exports = router;
