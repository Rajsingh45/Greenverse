const User = require('../models/USER');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const register = async (req, res) => {
    const { email, password, name, role } = req.body;

    try {
        // Check if an admin user already exists
        if (role === 'admin') {
            const adminUser = await User.findOne({ role: 'admin' });
            if (adminUser) {
                return res.status(400).json({ error: 'Admin user already exists' });
            }
        }

        // Check if the user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Hash the password and create a new user
        const hashedPassword = await bcrypt.hash(password, 12);
        const newUser = new User({ email, password: hashedPassword, name, role: role || 'user' });
        await newUser.save();

        res.status(201).json({ message: role === 'user' ? 'User registered successfully' : 'Admin registered successfully' });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Something went wrong' });
    }
};

const login = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const isPasswordCorrect = await bcrypt.compare(password, user.password);
        if (!isPasswordCorrect) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign({ email: user.email, id: user._id, role: user.role }, 'your_jwt_secret', { expiresIn: '1h' });
        res.status(200).json({ token, role: user.role });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Something went wrong' });
    }
};

module.exports = { register, login };
