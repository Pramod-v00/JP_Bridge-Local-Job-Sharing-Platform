const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/auth');
const { getDashboard, getPendingJobs, getAllJobs, approveJob, rejectJob, getAllUsers, getReports } = require('../controllers/adminController');

router.use(protect, adminOnly);

router.get('/dashboard', getDashboard);
router.get('/jobs/pending', getPendingJobs);
router.get('/jobs/all', getAllJobs);
router.patch('/jobs/:id/approve', approveJob);
router.patch('/jobs/:id/reject', rejectJob);
router.get('/users', getAllUsers);
router.get('/reports', getReports);

module.exports = router;
