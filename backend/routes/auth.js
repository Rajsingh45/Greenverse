const express = require('express');
const router = express.Router();
const { register, login, changePassword, requestOTP, verifyOTP, resetPassword,getAllUsers, uploadProfilePicture   } = require('../controllers/authController');
const { authMiddleware } = require('../middleware/authMiddleware'); // Import the middleware
const upload = require('../middleware/uploadMiddleware');

router.post('/register', register);
router.post('/login', login);
router.post('/changepassword', authMiddleware, changePassword);
router.post('/requestotp', requestOTP); // Add this line
router.post('/verifyotp', verifyOTP); // Add this line
router.post('/resetpassword', resetPassword); // Add this line
router.get('/users', authMiddleware, getAllUsers)
router.post('/upload', authMiddleware, upload.single('profilePicture'), uploadProfilePicture);

module.exports = router;
