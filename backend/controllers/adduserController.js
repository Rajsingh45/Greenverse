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

module.exports = { addUser };
