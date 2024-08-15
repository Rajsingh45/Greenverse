const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/authMiddleware');
const { addUser, getAllUsers, deleteTopic, updateUserDevices, getDeviceNames, getDevicesNumber, checkAdminEmailExists, searchUserByName, deleteUser, renameUser, getUserDevicesByEmail } = require('../controllers/adduserController');

router.get('/devices', authMiddleware, getDevicesNumber);

router.post('/adduser', authMiddleware, addUser);

router.post('/checkemail', checkAdminEmailExists);

router.put('/updatedevices', updateUserDevices);

router.get('/users', authMiddleware, getAllUsers);

router.put('/rename', authMiddleware, renameUser);

router.delete('/deleteuser', authMiddleware, deleteUser);

router.delete('/deletetopic', authMiddleware, deleteTopic);

router.get('/search-user', authMiddleware, searchUserByName);

router.get('/user/devices', authMiddleware, getUserDevicesByEmail);

router.get('/device-names', authMiddleware, getDeviceNames);

module.exports = router;
