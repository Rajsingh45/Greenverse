const User = require('../models/USER');
const Admin = require('../models/ADMIN');

const addUser = async (req, res) => {
    const { name, email, noofdevices, deviceIPs } = req.body;

    try {
        const existingUser = await Admin.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'Email already exists' });
        }

        const newUser = new Admin({ name, email, noofdevices, deviceIPs, role: 'user',dateAdded: formatDate(new Date()) });
        await newUser.save();

        res.status(201).json({ message: 'User added successfully', user: newUser });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Something went wrong' });
    }
};
    const formatDate = (date) => {
        const day = date.getDate();
        const month = date.toLocaleString('default', { month: 'short' });
        const year = date.getFullYear();
        return `${day} ${month} ${year}`;
};

const getAllUsers = async (req, res) => {
    try {
        const users = await Admin.find();
        res.status(200).json(users);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Something went wrong' });
    }
};

const getDevicesNumber = async (req, res) => {
    try {
        const admin = await Admin.findOne({ email: req.user.email });
        if (!admin) {
            return res.status(404).json({ error: 'Admin not found' });
        }
        res.json({ noofdevices: admin.noofdevices });
    } catch (error) {
        console.error('Error fetching admin devices:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

const checkAdminEmailExists = async (req, res) => {
    const { email } = req.body;
    try {
        const user = await Admin.findOne({ email });
        if (!user) {
            res.json({ exists: true });
        } else {
            res.status(404).json({ exists: false, error: 'Email Not exists' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};
const updateUserDevices = async (req, res) => {
    const { name, noofdevices, deviceIPs, email } = req.body;
  
    try {
      const existingUser = await Admin.findOne({ email });
      if (!existingUser) {
        return res.status(400).json({ message: 'User not found' });
      }
  
      // Directly update the device IPs and the number of devices
      existingUser.deviceIPs = deviceIPs;
      existingUser.noofdevices = noofdevices;
      existingUser.name = name;
  
      await existingUser.save();
  
      res.json({ message: 'Number of devices updated successfully', user: existingUser });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Something went wrong' });
}
};

const renameUser = async (req, res) => {
    const { email ,newName} = req.body;

    try {
        const existingUser = await Admin.findOne({ email });
        if (!existingUser) {
            return res.status(400).json({ message: 'User not found' });
        }

        existingUser.name = newName;
        await existingUser.save();

        res.json({ message: 'User renamed successfully', user: existingUser });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Something went wrong' });
    }
};

const deleteUser = async (req, res) => {
    const { email } = req.body;

    try {
        const existingUser = await Admin.findOneAndDelete({ email });
        if (!existingUser) {
            return res.status(400).json({ message: 'User not found' });
        }

        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Something went wrong' });
    }
};

const searchUserByName = async (req, res) => {
    const { name } = req.query;

    try {
        const users = await Admin.find({ name: new RegExp(name, 'i') });
        
        if (!users || users.length === 0) {
            return res.status(404).json({ message: 'No users found' });
        }

        res.status(200).json(users);
    } catch (error) {
        console.error('Error searching for user by name:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = { addUser, getAllUsers, updateUserDevices, getDevicesNumber, checkAdminEmailExists, deleteUser, renameUser, searchUserByName };

