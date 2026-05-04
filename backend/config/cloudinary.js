const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Image storage
const imageStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'kaampay/images',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 800, height: 600, crop: 'limit' }],
  },
});

// Audio storage
const audioStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'kaampay/audio',
    resource_type: 'video', // Cloudinary uses 'video' for audio
    allowed_formats: ['mp3', 'wav', 'ogg', 'webm', 'm4a'],
  },
});

// Profile photo storage
const profileStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'kaampay/profiles',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 400, height: 400, crop: 'fill', gravity: 'face' }],
  },
});

const uploadImages = multer({ storage: imageStorage });
const uploadAudio = multer({ storage: audioStorage });
const uploadProfile = multer({ storage: profileStorage });

module.exports = { cloudinary, uploadImages, uploadAudio, uploadProfile };
