const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure the uploads folder is created
const uploadsFolderPath = path.join(__dirname, '..', 'uploads');
// if (!fs.existsSync(uploadsFolderPath)) {
//   fs.mkdirSync(uploadsFolderPath, { recursive: true });
//   console.log('Uploads folder created.');
// }

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsFolderPath); // Use the dynamically created uploads folder
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
    cb(null, true);
  } else {
    cb(new Error('Unsupported file format'), false);
  }
};

const upload = multer({
  storage,
  limits: {
    fileSize: 2 * 1024 * 1024 // 2 MB
  },
  fileFilter
});

module.exports = upload;
