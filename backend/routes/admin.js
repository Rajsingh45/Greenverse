const express = require('express');
const router = express.Router();
const { authMiddleware, adminMiddleware } = require('../middleware/authMiddleware');
const User = require('../models/USER');
const { addUser, getAllUsers, updateUserDevices, getDevicesNumber, checkAdminEmailExists,  searchUserByName ,deleteUser , renameUser,getUserDevicesByEmail} = require('../controllers/adduserController');
const Admin=require('../models/ADMIN');

router.get('/devices', authMiddleware,getDevicesNumber)

router.post('/adduser', authMiddleware, adminMiddleware, addUser);

router.post('/checkemail',checkAdminEmailExists)

router.put('/updatedevices', updateUserDevices);

router.get('/users', authMiddleware, adminMiddleware, getAllUsers);

router.put('/rename', authMiddleware, adminMiddleware, renameUser); // Add this line

router.delete('/deleteuser', authMiddleware, adminMiddleware, deleteUser); // Add this line

router.get('/search-user', authMiddleware, searchUserByName); // Add this line

router.get('/user/devices', authMiddleware, adminMiddleware, getUserDevicesByEmail);

module.exports = router;
