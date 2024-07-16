const express = require('express');
const router = express.Router();
const { register, login, rememberMe, changePassword,checkEmailExists, requestOTP, verifyOTP, resetPassword,getAllUsers,getProfilePicture, uploadProfilePicture, renameUser   } = require('../controllers/authController');
const { authMiddleware } = require('../middleware/authMiddleware'); // Import the middleware
const upload = require('../middleware/uploadMiddleware');

router.post('/register', register);
router.post('/login', login);
router.get('/remember-me', rememberMe);

router.put('/changepassword', authMiddleware, changePassword);
router.post('/checkemail',checkEmailExists)

router.post('/requestotp', requestOTP); // Add this line
router.post('/verifyotp', verifyOTP); // Add this line
router.post('/resetpassword', resetPassword); // Add this line

router.get('/users', authMiddleware, getAllUsers)

router.post('/upload', authMiddleware, upload.single('profilePicture'), uploadProfilePicture);
router.put('/rename', authMiddleware, renameUser); 
router.get('/profile-picture', authMiddleware, getProfilePicture);


module.exports = router;
