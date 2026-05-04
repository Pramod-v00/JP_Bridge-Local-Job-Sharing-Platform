const { User, Job, Review, Notification, Report } = require('../models');
const { getDistance } = require('../utils/helpers');

// ─── USERS ────────────────────────────────────────────────────────────────────

const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id || req.user._id)
      .select('-password -blockedUsers');
    if (!user) return res.status(404).json({ message: 'User not found' });
    const jobs = await Job.find({ userId: user._id, status: 'approved' }).sort({ createdAt: -1 });
    res.json({ user, jobs });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { name, workType, area, lat, lng } = req.body;
    const updates = {};
    if (name) updates.name = name;
    if (workType) updates.workType = workType;
    if (req.file) updates.profilePhoto = req.file.path;
    if (lat && lng) updates.location = { lat: parseFloat(lat), lng: parseFloat(lng), area: area || '' };

    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true }).select('-password');
    res.json({ message: 'Profile updated', user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const updateLocation = async (req, res) => {
  try {
    const { lat, lng, area } = req.body;
    await User.findByIdAndUpdate(req.user._id, { location: { lat, lng, area: area || '' } });
    res.json({ message: 'Location updated' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const searchWorkers = async (req, res) => {
  try {
    const { workType, lat, lng, radius = 10 } = req.query;
    if (!lat || !lng) return res.status(400).json({ message: 'Location required' });

    const query = { isAdmin: false };
    if (workType) query.workType = workType;

    const workers = await User.find(query).select('-password -phone -blockedUsers');
    const userLat = parseFloat(lat);
    const userLng = parseFloat(lng);

    const nearby = workers
      .map((w) => {
        const dist = getDistance(userLat, userLng, w.location.lat, w.location.lng);
        return { ...w.toObject(), distance: parseFloat(dist.toFixed(1)) };
      })
      .filter((w) => w.distance <= parseFloat(radius))
      .sort((a, b) => a.distance - b.distance);

    res.json(nearby);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const blockUser = async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user._id, {
      $addToSet: { blockedUsers: req.params.id },
    });
    res.json({ message: 'User blocked' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─── REVIEWS ──────────────────────────────────────────────────────────────────

const createReview = async (req, res) => {
  try {
    const { jobId, rating, comment, reviewedUserId } = req.body;

    const job = await Job.findOne({ _id: jobId, jobStatus: 'completed' });
    if (!job) return res.status(400).json({ message: 'Job not found or not completed' });

    const existing = await Review.findOne({ jobId, reviewerId: req.user._id });
    if (existing) return res.status(400).json({ message: 'Already reviewed this job' });

    await Review.create({
      jobId,
      reviewerId: req.user._id,
      reviewedUserId,
      rating,
      comment,
    });

    // Update user average rating
    const reviews = await Review.find({ reviewedUserId });
    const avg = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
    await User.findByIdAndUpdate(reviewedUserId, {
      rating: parseFloat(avg.toFixed(1)),
      ratingCount: reviews.length,
    });

    await Notification.create({
      userId: reviewedUserId,
      type: 'new_review',
      message: `You received a ${rating}-star review`,
      relatedId: jobId,
    });

    res.status(201).json({ message: 'Review submitted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getReviewsForUser = async (req, res) => {
  try {
    const reviews = await Review.find({ reviewedUserId: req.params.userId })
      .populate('reviewerId', 'name profilePhoto')
      .sort({ createdAt: -1 });
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─── NOTIFICATIONS ────────────────────────────────────────────────────────────

const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(50);
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const markNotificationsRead = async (req, res) => {
  try {
    await Notification.updateMany({ userId: req.user._id, read: false }, { read: true });
    res.json({ message: 'Notifications marked as read' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─── REPORTS ──────────────────────────────────────────────────────────────────

const createReport = async (req, res) => {
  try {
    const { targetType, targetId, reason } = req.body;
    await Report.create({ reporterId: req.user._id, targetType, targetId, reason });
    res.status(201).json({ message: 'Report submitted. Our team will review it.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  getProfile, updateProfile, updateLocation, searchWorkers, blockUser,
  createReview, getReviewsForUser,
  getNotifications, markNotificationsRead,
  createReport,
};
