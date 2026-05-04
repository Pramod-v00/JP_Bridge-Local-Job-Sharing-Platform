const { Job, Notification, User } = require('../models');
const { getDistance } = require('../utils/helpers');

// POST /api/jobs - Create job
const createJob = async (req, res) => {
  try {
    const { title, description, urgency, lat, lng, area } = req.body;
    const images = req.files && req.files.images ? req.files.images.map((f) => f.path) : [];
    const audioUrl = req.files && req.files.audio ? req.files.audio[0].path : '';

    const job = await Job.create({
      userId: req.user._id,
      title,
      description,
      images,
      audioUrl,
      urgency: urgency || 'normal',
      location: { lat: parseFloat(lat), lng: parseFloat(lng), area: area || '' },
      status: 'pending',
    });

    // Notify admins
    const admins = await User.find({ role: 'admin' });
    for (const admin of admins) {
      await Notification.create({
        userId: admin._id,
        type: 'new_job',
        message: `New job pending approval: "${title}"`,
        relatedId: job._id,
      });
    }

    res.status(201).json({ message: 'Job submitted for approval', job });
  } catch (err) {
    res.status(500).json({ message: 'Failed to create job', error: err.message });
  }
};

// GET /api/jobs/feed - Approved jobs near user
const getJobFeed = async (req, res) => {
  try {
    const { lat, lng, radius = 10 } = req.query;
    if (!lat || !lng) return res.status(400).json({ message: 'Location required' });

    const userLat = parseFloat(lat);
    const userLng = parseFloat(lng);

    const jobs = await Job.find({ status: 'approved', jobStatus: 'open' })
      .populate('userId', 'name profilePhoto rating ratingCount workType')
      .sort({ createdAt: -1 })
      .limit(100);

    const nearby = jobs
      .map((job) => {
        const dist = getDistance(userLat, userLng, job.location.lat, job.location.lng);
        return { ...job.toObject(), distance: parseFloat(dist.toFixed(1)) };
      })
      .filter((job) => job.distance <= parseFloat(radius))
      .sort((a, b) => a.distance - b.distance);

    res.json(nearby);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/jobs/:id - Single job
const getJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id).populate(
      'userId',
      'name profilePhoto rating ratingCount workType location'
    );
    if (!job) return res.status(404).json({ message: 'Job not found' });
    res.json(job);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/jobs/my-jobs - Jobs posted by logged in user
const getMyJobs = async (req, res) => {
  try {
    const jobs = await Job.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json(jobs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PATCH /api/jobs/:id/status - Update job status (poster only)
const updateJobStatus = async (req, res) => {
  try {
    const { jobStatus } = req.body;
    const job = await Job.findOne({ _id: req.params.id, userId: req.user._id });
    if (!job) return res.status(404).json({ message: 'Job not found or unauthorized' });
    job.jobStatus = jobStatus;
    await job.save();
    res.json({ message: 'Job status updated', job });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE /api/jobs/:id
const deleteJob = async (req, res) => {
  try {
    const job = await Job.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!job) return res.status(404).json({ message: 'Job not found or unauthorized' });
    res.json({ message: 'Job deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { createJob, getJobFeed, getJob, getMyJobs, updateJobStatus, deleteJob };
