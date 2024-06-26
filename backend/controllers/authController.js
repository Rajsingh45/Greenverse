// const express = require('express');
// const router = express.Router();
// const User = require('../models/USER');
// const {jwtAuthMiddleware, generateToken} = require('../jwt');

// const authMiddleware = require('../middleware/authMiddleware');


// const checkAdminRole = async (userID) => {
//      try{
//          const user = await User.findById(userID);
//          if(user.role === 'admin'){
//              return true;
//          }
//      }catch(err){
//          return false;
//      }
// }

const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const register = async (req, res) => {
    const { email, password ,name, role} = req.body;

    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 12);
        // const newUser = new User({ email, password: hashedPassword });
        const newUser = new User({ email, password: hashedPassword, name, role: role || 'user' });
        await newUser.save();

        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        console.log(error)
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
        // const token = jwt.sign({ email: user.email, id: user._id }, 'your_jwt_secret', { expiresIn: '1h' });
        const isAdmin = (email === "admin@example.com" && password === "adminpassword");

        const token = jwt.sign({ email: user.email, id: user._id, role: user.role }, 'your_jwt_secret', { expiresIn: '1h' });
        res.status(200).json({ token, role: isAdmin ? 'admin' : 'user' });
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: 'Something went wrong' });
    }
};

module.exports = { register, login };
