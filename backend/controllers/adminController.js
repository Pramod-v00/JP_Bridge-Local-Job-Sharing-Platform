const { Job, User, Report, Notification } = require('../models');

// GET /api/admin/dashboard
const getDashboard = async (req, res) => {
  try {
    const [totalUsers, totalJobs, pendingJobs, activeJobs] = await Promise.all([
      User.countDocuments({ isAdmin: false }),
      Job.countDocuments(),
      Job.countDocuments({ status: 'pending' }),
      Job.countDocuments({ status: 'approved', jobStatus: { $ne: 'completed' } }),
    ]);
    res.json({ totalUsers, totalJobs, pendingJobs, activeJobs });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/admin/jobs/pending
const getPendingJobs = async (req, res) => {
  try {
    const jobs = await Job.find({ status: 'pending' })
      .populate('userId', 'name phone workType profilePhoto rating')
      .sort({ createdAt: -1 });
    res.json(jobs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/admin/jobs/all
const getAllJobs = async (req, res) => {
  try {
    const jobs = await Job.find()
      .populate('userId', 'name phone workType profilePhoto')
      .sort({ createdAt: -1 });
    res.json(jobs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PATCH /api/admin/jobs/:id/approve
const approveJob = async (req, res) => {
  try {
    const job = await Job.findByIdAndUpdate(
      req.params.id,
      { status: 'approved' },
      { new: true }
    ).populate('userId');

    if (!job) return res.status(404).json({ message: 'Job not found' });

    await Notification.create({
      userId: job.userId._id,
      type: 'job_approved',
      message: `Your job "${job.title}" has been approved and is now live!`,
      relatedId: job._id,
    });

    // Notify io clients
    const io = req.app.get('io');
    io.emit('job_approved', { jobId: job._id, userId: job.userId._id });

    res.json({ message: 'Job approved', job });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PATCH /api/admin/jobs/:id/reject
const rejectJob = async (req, res) => {
  try {
    const { reason } = req.body;
    const job = await Job.findByIdAndUpdate(
      req.params.id,
      { status: 'rejected' },
      { new: true }
    ).populate('userId');

    if (!job) return res.status(404).json({ message: 'Job not found' });

    await Notification.create({
      userId: job.userId._id,
      type: 'job_rejected',
      message: `Your job "${job.title}" was rejected. Reason: ${reason || 'Does not meet guidelines'}`,
      relatedId: job._id,
    });

    res.json({ message: 'Job rejected', job });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/admin/users
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({ role: 'user' })
      .select('-password')
      .sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/admin/reports
const getReports = async (req, res) => {
  try {
    const reports = await Report.find({ resolved: false })
      .populate('reporterId', 'name phone')
      .sort({ createdAt: -1 });
    res.json(reports);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getDashboard, getPendingJobs, getAllJobs, approveJob, rejectJob, getAllUsers, getReports };
