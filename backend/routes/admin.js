const express = require('express');
const router = express.Router();
const { addUser } = require('../controllers/adduserController');
const { authMiddleware, adminMiddleware } = require('../middleware/authMiddleware');

router.post('/adduser', authMiddleware, adminMiddleware, addUser);

module.exports = router;
