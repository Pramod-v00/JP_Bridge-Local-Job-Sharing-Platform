const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// ─── USER MODEL ──────────────────────────────────────────────────────────────
const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, unique: true },
    email: { type: String, default: '', trim: true },
    password: { type: String, required: true, minlength: 6 },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
    workType: {
      type: String,
      required: true,
      enum: [
        'plumber', 'electrician', 'driver', 'helper', 'carpenter',
        'painter', 'cleaner', 'cook', 'security', 'gardener', 'other',
      ],
    },
    profilePhoto: { type: String, default: '' },
    location: {
      lat: { type: Number, default: 0 },
      lng: { type: Number, default: 0 },
      area: { type: String, default: '' },
    },
    rating: { type: Number, default: 0 },
    ratingCount: { type: Number, default: 0 },
    isVerified: { type: Boolean, default: true },
    // isAdmin is derived from role for backwards compat
    blockedUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    lastSeen: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// Virtual: isAdmin derived from role
userSchema.virtual('isAdmin').get(function () {
  return this.role === 'admin';
});

userSchema.set('toJSON', { virtuals: true });
userSchema.set('toObject', { virtuals: true });

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

// ─── JOB MODEL ───────────────────────────────────────────────────────────────
const jobSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    images: [{ type: String }],
    audioUrl: { type: String, default: '' },
    urgency: { type: String, enum: ['normal', 'urgent'], default: 'normal' },
    location: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
      area: { type: String, default: '' },
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    jobStatus: {
      type: String,
      enum: ['open', 'in-progress', 'completed'],
      default: 'open',
    },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  },
  { timestamps: true }
);

// Geospatial index
jobSchema.index({ 'location.lat': 1, 'location.lng': 1 });

// ─── MESSAGE MODEL ────────────────────────────────────────────────────────────
const messageSchema = new mongoose.Schema(
  {
    roomId: { type: String, required: true, index: true },
    senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    receiverId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    message: { type: String, required: true },
    read: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// ─── REVIEW MODEL ─────────────────────────────────────────────────────────────
const reviewSchema = new mongoose.Schema(
  {
    jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
    reviewerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    reviewedUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, default: '' },
  },
  { timestamps: true }
);

// ─── NOTIFICATION MODEL ───────────────────────────────────────────────────────
const notificationSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: {
      type: String,
      enum: ['new_job', 'message', 'job_approved', 'job_rejected', 'new_review'],
    },
    message: { type: String, required: true },
    read: { type: Boolean, default: false },
    relatedId: { type: mongoose.Schema.Types.ObjectId, default: null },
  },
  { timestamps: true }
);

// ─── REPORT MODEL ─────────────────────────────────────────────────────────────
const reportSchema = new mongoose.Schema(
  {
    reporterId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    targetType: { type: String, enum: ['job', 'user'], required: true },
    targetId: { type: mongoose.Schema.Types.ObjectId, required: true },
    reason: { type: String, required: true },
    resolved: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const User = mongoose.model('User', userSchema);
const Job = mongoose.model('Job', jobSchema);
const Message = mongoose.model('Message', messageSchema);
const Review = mongoose.model('Review', reviewSchema);
const Notification = mongoose.model('Notification', notificationSchema);
const Report = mongoose.model('Report', reportSchema);

module.exports = { User, Job, Message, Review, Notification, Report };
