// routes/auth.js
const express = require('express');
const router = express.Router();
const { register, login, adminLogin, makeAdmin } = require('../controllers/authController');
const { uploadProfile } = require('../config/cloudinary');

router.post('/register', uploadProfile.single('profilePhoto'), register);
router.post('/login', login);
router.post('/admin-login', adminLogin);
router.post('/make-admin', makeAdmin);

module.exports = router;
