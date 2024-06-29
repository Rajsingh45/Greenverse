const express = require('express');
const router = express.Router();
const { addUser } = require('../controllers/adduserController');
const { authMiddleware, adminMiddleware } = require('../middleware/authMiddleware');
const User = require('../models/USER');
const { updateUserDevices } = require('../controllers/adduserController');
const { getAllUsers } = require('../controllers/adduserController');
const {getDevicesNumber}=require('../controllers/adduserController');
const {checkEmailExists}=require('../controllers/adduserController')
const Admin=require('../models/ADMIN');

router.get('/devices', authMiddleware,getDevicesNumber)

router.post('/adduser', authMiddleware, adminMiddleware, addUser);

router.post('/checkemail',checkEmailExists)

router.put('/:email/updatedevices', updateUserDevices);

router.get('/users', authMiddleware, adminMiddleware, getAllUsers);

module.exports = router;
