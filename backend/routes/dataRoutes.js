const express = require('express');
const router = express.Router();
const {  
    getDeviceDataByDatetime, 
    getDeviceDataByDateRange, 
    downloadDeviceData, 
    getDeviceParameters 
} = require('../controllers/dataController');


router.get('/device-data-by-datetime/:espTopic/:datetime', getDeviceDataByDatetime);
router.get('/device-data-by-daterange/:espTopic', getDeviceDataByDateRange);
router.get('/download-device-data/:espTopic', downloadDeviceData);
router.get('/device-parameters/:espTopic', getDeviceParameters);

module.exports = router;
