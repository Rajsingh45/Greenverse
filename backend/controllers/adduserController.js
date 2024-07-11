const User = require('../models/USER');
const Admin = require('../models/ADMIN');

const addUser = async (req, res) => {
    const { name, email, noofdevices, deviceIPs } = req.body;

    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'Email already exists' });
        }

        const newUser = new Admin({ name, email, noofdevices, deviceIPs, role: 'user' });
        await newUser.save();

        res.status(201).json({ message: 'User added successfully', user: newUser });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Something went wrong' });
    }
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

const checkEmailExists = async (req, res) => {
    const { email } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) {
            res.json({ exists: true });
        } else {
            res.status(404).json({ exists: false, error: 'Email already exists' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};

const updateUserDevices = async (req, res) => {
    const { name,noofdevices, deviceIPs,email } = req.body;

    try {
        const existingUser = await Admin.findOne({ email });
        if (!existingUser) {
             return res.status(400).json({ message: 'User not found' });
         }

        const currentDevices = existingUser.noofdevices;
        const diff = noofdevices - currentDevices;

        if (diff > 0) {
            // Adding devices
            if (deviceIPs.length !== diff) {
                return res.status(400).json({ message: `You need to provide ${diff} new IP addresses` });
            }
            existingUser.deviceIPs = existingUser.deviceIPs.concat(deviceIPs);
        } else if (diff < 0) {
            // Removing devices
            const absDiff = Math.abs(diff);
            if (deviceIPs.length !== absDiff) {
                return res.status(400).json({ message: `You need to provide ${absDiff} IP addresses to remove` });
            }
            existingUser.deviceIPs = existingUser.deviceIPs.filter(ip => !deviceIPs.includes(ip));
        }

        existingUser.noofdevices = noofdevices;
        existingUser.name=name;
        await existingUser.save();

        res.json({ message: 'Number of devices updated successfully', user: existingUser });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Something went wrong' });
    }
};

const deleteUser = async (req, res) => {
    const { userId } = req.body;

    try {
        const existingUser = await Admin.findOneAndDelete({ userId });
        if (!existingUser) {
            return res.status(400).json({ message: 'User not found' });
        }

        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Something went wrong' });
    }
};

module.exports = { addUser, getAllUsers, updateUserDevices, getDevicesNumber, checkEmailExists, deleteUser };
