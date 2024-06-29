const express = require('express');
const router = express.Router();
const { addUser } = require('../controllers/adduserController');
const { authMiddleware, adminMiddleware } = require('../middleware/authMiddleware');
const User = require('../models/USER');
const { updateUserDevices } = require('../controllers/adduserController');
const { getAllUsers } = require('../controllers/adduserController');

router.post('/adduser', authMiddleware, adminMiddleware, addUser);

router.post('/checkemail', async (req, res) => {
    const { email } = req.body;
    try {
      const user = await User.findOne({ email });
      if (user) {
        res.json({ exists: true });
      } else {
        res.json({ exists: false });
      }
    } catch (error) {
      res.status(500).json({ error: 'Server error' });
    }
  });

router.put('/:email/updatedevices', updateUserDevices);

router.get('/users', authMiddleware, adminMiddleware, getAllUsers);

module.exports = router;
