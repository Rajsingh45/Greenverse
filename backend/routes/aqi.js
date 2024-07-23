const express = require('express');
const router = express.Router();
const { addAQIData, getAQIData } = require('../controllers/aqiController');

router.post('/add', addAQIData);
router.get('/data', getAQIData);

module.exports = router;