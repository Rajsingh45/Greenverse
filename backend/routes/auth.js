const express = require('express');
const router = express.Router();
const { register, login, changePassword, requestOTP, verifyOTP, resetPassword } = require('../controllers/authController');
const { authMiddleware } = require('../middleware/authMiddleware'); // Import the middleware

router.post('/register', register);
router.post('/login', login);
router.post('/changepassword', authMiddleware, changePassword);
router.post('/requestotp', requestOTP); // Add this line
router.post('/verifyotp', verifyOTP); // Add this line
router.post('/resetpassword', resetPassword); // Add this line

module.exports = router;
