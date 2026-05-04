const jwt = require('jsonwebtoken');
const { User } = require('../models');

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });

// Normalize phone: ensure it's stored as +91XXXXXXXXXX
const normalizePhone = (phone) => {
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 10) return `+91${digits}`;
  if (digits.length === 12 && digits.startsWith('91')) return `+${digits}`;
  if (digits.length === 13 && phone.startsWith('+')) return phone;
  return `+91${digits.slice(-10)}`;
};

const safeUser = (user) => ({
  _id: user._id,
  name: user.name,
  phone: user.phone,
  email: user.email || '',
  workType: user.workType,
  profilePhoto: user.profilePhoto,
  location: user.location,
  rating: user.rating,
  role: user.role,
  isAdmin: user.role === 'admin',
});

// POST /api/auth/register
const register = async (req, res) => {
  try {
    const { name, phone, password, workType, lat, lng, area } = req.body;

    if (!name || !phone || !password || !workType) {
      return res.status(400).json({ message: 'Name, phone, password, and work type are required' });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    const normalized = normalizePhone(phone);
    const digits = normalized.replace('+91', '');
    if (!/^\d{10}$/.test(digits)) {
      return res.status(400).json({ message: 'Enter a valid 10-digit Indian mobile number' });
    }

    const exists = await User.findOne({ phone: normalized });
    if (exists) {
      return res.status(400).json({ message: 'Phone number already registered' });
    }

    const profilePhoto = req.file ? req.file.path : '';

    const user = await User.create({
      name: name.trim(),
      phone: normalized,
      password,
      workType,
      profilePhoto,
      role: 'user',
      location: {
        lat: parseFloat(lat) || 0,
        lng: parseFloat(lng) || 0,
        area: area || '',
      },
    });

    res.status(201).json({
      message: 'Registration successful',
      token: generateToken(user._id),
      user: safeUser(user),
    });
  } catch (err) {
    console.error('Register error:', err);
    if (err.code === 11000) {
      return res.status(400).json({ message: 'Phone number already registered' });
    }
    res.status(500).json({ message: 'Registration failed. Please try again.' });
  }
};

// POST /api/auth/login
const login = async (req, res) => {
  try {
    const { phone, password } = req.body;
    if (!phone || !password) {
      return res.status(400).json({ message: 'Phone and password are required' });
    }

    const normalized = normalizePhone(phone);
    const user = await User.findOne({ phone: normalized });

    if (!user) {
      return res.status(401).json({ message: 'No account found with this phone number' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Incorrect password' });
    }

    user.lastSeen = new Date();
    await user.save({ validateBeforeSave: false });

    res.json({
      token: generateToken(user._id),
      user: safeUser(user),
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Login failed. Please try again.' });
  }
};

// POST /api/auth/admin-login  — dedicated admin login
const adminLogin = async (req, res) => {
  try {
    const { phone, password } = req.body;
    if (!phone || !password) {
      return res.status(400).json({ message: 'Phone and password are required' });
    }

    const normalized = normalizePhone(phone);
    const user = await User.findOne({ phone: normalized, role: 'admin' });

    if (!user) {
      return res.status(401).json({ message: 'No admin account found' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Incorrect password' });
    }

    user.lastSeen = new Date();
    await user.save({ validateBeforeSave: false });

    res.json({
      token: generateToken(user._id),
      user: safeUser(user),
    });
  } catch (err) {
    console.error('Admin login error:', err);
    res.status(500).json({ message: 'Login failed. Please try again.' });
  }
};

// POST /api/auth/make-admin — manually elevate a user to admin (secret-protected)
const makeAdmin = async (req, res) => {
  try {
    const { phone, secret } = req.body;
    if (secret !== process.env.ADMIN_SECRET_KEY) {
      return res.status(403).json({ message: 'Invalid secret' });
    }
    const normalized = normalizePhone(phone);
    const user = await User.findOneAndUpdate(
      { phone: normalized },
      { role: 'admin' },
      { new: true }
    );
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ message: `${user.name} is now an admin` });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { register, login, adminLogin, makeAdmin };
