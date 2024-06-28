const User = require('../models/USER');
const Admin = require('../models/ADMIN')
const addUser = async (req, res) => {
    const { name, email, noofdevices } = req.body;

    try {
        const existingUser = await User.findOne({ email });
        if (!existingUser) {
            return res.status(400).json({ message: 'Email does not exists' });
        }

        const newUser = new Admin({ name, email, noofdevices, role: 'user' });
        await newUser.save();

        res.status(201).json({ message: 'User added successfully', user: newUser });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Something went wrong' });
    }
};

const updateUserDevices = async (req, res) => {
    const { email } = req.params; // Assuming email is passed as a parameter in the URL
    const { noofdevices } = req.body;

    try {
        const existingUser = await Admin.findOne({ email });
        if (!existingUser) {
            return res.status(400).json({ message: 'User not found' });
        }

        existingUser.noofdevices = noofdevices;
        await existingUser.save();

        res.json({ message: 'Number of devices updated successfully', user: existingUser });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Something went wrong' });
    }
};

module.exports = { addUser, updateUserDevices };