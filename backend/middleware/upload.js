const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

// 1. Tell Cloudinary who we are using our .env keys
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// 2. Set up the storage engine
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'campus_marketplace', // It will create this folder in your Cloudinary account!
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'] // Only allow images
  }
});

// 3. Create the multer upload middleware
const upload = multer({ storage: storage });

module.exports = upload;