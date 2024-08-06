const express = require('express');
const router = express.Router();
const { register, login,checkNameAvailability,    requestSignupOTP,
    verifySignupOTP,
    requestForgotPasswordOTP,
    verifyForgotPasswordOTP, rememberMe, changePassword,checkEmailExists, searchDevices, resetPassword,getAllUsers,getProfilePicture, uploadProfilePicture, renameUser   } = require('../controllers/authController');
const { authMiddleware } = require('../middleware/authMiddleware'); // Import the middleware
const upload = require('../middleware/uploadMiddleware');

router.post('/register', register);

router.get('/check-name', checkNameAvailability);
router.post('/login', login);
router.get('/remember-me', rememberMe);

router.put('/changepassword', authMiddleware, changePassword);
router.post('/checkemail',checkEmailExists)

// router.post('/requestotp', requestOTP); // Add this line
// router.post('/verifyotp', verifyOTP); // Add this line
router.post('/resetpassword', resetPassword); // Add this line

// router.post('/requestsignupotp', requestSignupOTP); // New route for signup OTP
// router.post('/verifysignupotp', verifySignupOTP);

router.post('/requestsignupotp', requestSignupOTP);
router.post('/verifysignupotp', verifySignupOTP);
router.post('/requestforgotpasswordotp', requestForgotPasswordOTP);
router.post('/verifyforgotpasswordotp', verifyForgotPasswordOTP);

router.get('/users', authMiddleware, getAllUsers)

router.post('/upload', authMiddleware, upload.single('profilePicture'), uploadProfilePicture);
router.put('/rename', authMiddleware, renameUser); 
router.get('/profile-picture', authMiddleware, getProfilePicture);

router.get('/search',authMiddleware, searchDevices);
module.exports = router;
