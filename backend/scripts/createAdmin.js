/**
 * scripts/createAdmin.js
 * 
 * Run this ONCE to create your first admin account directly in MongoDB.
 * 
 * Usage:
 *   cd backend
 *   node scripts/createAdmin.js
 * 
 * Then log in at: http://localhost:3000/admin-login
 */

require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// ── CONFIGURE YOUR ADMIN HERE ─────────────────────
const ADMIN_PHONE = '+919876543210'; // change this
const ADMIN_PASSWORD = 'Admin@123';  // change this
const ADMIN_NAME = 'JP-Bridge Admin';
// ──────────────────────────────────────────────────

async function createAdmin() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB');

  const { User } = require('../models');

  const existing = await User.findOne({ phone: ADMIN_PHONE });
  if (existing) {
    if (existing.role !== 'admin') {
      existing.role = 'admin';
      await existing.save();
      console.log(`✅ Existing user "${existing.name}" promoted to admin`);
    } else {
      console.log(`ℹ️  Admin already exists: ${existing.name} (${ADMIN_PHONE})`);
    }
    await mongoose.disconnect();
    return;
  }

  const hashed = await bcrypt.hash(ADMIN_PASSWORD, 12);
  await User.create({
    name: ADMIN_NAME,
    phone: ADMIN_PHONE,
    password: hashed,
    workType: 'other',
    role: 'admin',
    isVerified: true,
  });

  console.log(`✅ Admin created!`);
  console.log(`   Phone:    ${ADMIN_PHONE}`);
  console.log(`   Password: ${ADMIN_PASSWORD}`);
  console.log(`   Login at: http://localhost:3000/admin-login`);

  await mongoose.disconnect();
}

createAdmin().catch((err) => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});
