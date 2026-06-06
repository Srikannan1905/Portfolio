const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');
const dotenv = require('dotenv');

dotenv.config();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configure Multer Storage for Cloudinary
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'portfolio',
    allowed_formats: ['jpg', 'png', 'jpeg', 'gif', 'webp', 'svg', 'pdf'],
    // transformation: [{ width: 500, height: 500, crop: 'limit' }] // optional
  },
  resource_type: 'auto',
});

const uploadCloud = multer({ storage: storage });

const deleteMediaByUrl = async (url) => {
    if (!url || !url.includes('cloudinary.com')) return;
    try {
        const parts = url.split('/');
        const uploadIdx = parts.indexOf('upload');
        if (uploadIdx === -1) return;
        
        const versionAndRest = parts.slice(uploadIdx + 1);
        let pathParts = versionAndRest;
        if (versionAndRest[0].startsWith('v')) {
            pathParts = versionAndRest.slice(1);
        }
        let publicId = pathParts.join('/');
        
        const isRaw = url.includes('/raw/upload/');
        if (!isRaw) {
             publicId = publicId.split('.')[0];
        }
        
        await cloudinary.uploader.destroy(publicId, { resource_type: isRaw ? 'raw' : 'image' });
        console.log(`Deleted old media from Cloudinary: ${publicId}`);
    } catch (err) {
        console.error("Error deleting old media from cloudinary:", err);
    }
};

module.exports = { cloudinary, uploadCloud, deleteMediaByUrl };
