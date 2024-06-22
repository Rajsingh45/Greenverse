const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { getAQIData,postAQIData } = require('../controllers/aqiController');

router.get('/data/:deviceId', authMiddleware, getAQIData);
router.post('/data/:deviceId', authMiddleware, postAQIData);

module.exports = router;
