const express = require('express');
const router = express.Router();
const { authMiddleware, adminMiddleware } = require('../middleware/authMiddleware');
const { addUser, getAllUsers, deleteTopic, updateUserDevices, getDeviceNames, getDevicesNumber, checkAdminEmailExists, searchUserByName, deleteUser, renameUser, getUserDevicesByEmail } = require('../controllers/adduserController');

router.get('/devices', authMiddleware, getDevicesNumber);

router.post('/adduser', authMiddleware, adminMiddleware, addUser);

router.post('/checkemail', checkAdminEmailExists);

router.put('/updatedevices', authMiddleware, updateUserDevices);

router.get('/users', authMiddleware, adminMiddleware, getAllUsers);

router.put('/rename', authMiddleware, adminMiddleware, renameUser);

router.delete('/deleteuser', authMiddleware, adminMiddleware, deleteUser);

router.delete('/deletetopic', authMiddleware, adminMiddleware, deleteTopic);

router.get('/search-user', authMiddleware, searchUserByName);

router.get('/user/devices', authMiddleware, getUserDevicesByEmail);

router.get('/device-names', authMiddleware, getDeviceNames);

module.exports = router;
