const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const multer = require('multer');
const { uploadImages, uploadAudio } = require('../config/cloudinary');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const { cloudinary } = require('../config/cloudinary');
const { createJob, getJobFeed, getJob, getMyJobs, updateJobStatus, deleteJob } = require('../controllers/jobController');

// Multi-file upload (images + audio in one request)
const jobUpload = multer({
  storage: new CloudinaryStorage({
    cloudinary,
    params: (req, file) => {
      if (file.fieldname === 'audio') {
        return { folder: 'kaampay/audio', resource_type: 'video' };
      }
      return { folder: 'kaampay/images', transformation: [{ width: 800, crop: 'limit' }] };
    },
  }),
});

router.get('/feed', protect, getJobFeed);
router.get('/my-jobs', protect, getMyJobs);
router.get('/:id', protect, getJob);
router.post('/', protect, jobUpload.fields([{ name: 'images', maxCount: 3 }, { name: 'audio', maxCount: 1 }]), createJob);
router.patch('/:id/status', protect, updateJobStatus);
router.delete('/:id', protect, deleteJob);

module.exports = router;
