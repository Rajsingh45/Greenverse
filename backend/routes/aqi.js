const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { getAQIData,postAQIData } = require('../controllers/aqiController');

module.exports = router;
