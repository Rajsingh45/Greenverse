const User = require('../models/USER');
const jwt = require('jsonwebtoken');
const Admin = require('../models/ADMIN');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const crypto = require('crypto');

const otpStore = {}; // In-memory store for OTPs

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

const changePassword = async (req, res) => {
    const { email, oldPassword, newPassword } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const isPasswordCorrect = await bcrypt.compare(oldPassword, user.password);
        if (!isPasswordCorrect) {
            return res.status(400).json({ message: 'Old password is incorrect' });
        }

        const hashedNewPassword = await bcrypt.hash(newPassword, 12);
        user.password = hashedNewPassword;
        await user.save();

        res.status(200).json({ message: 'Password changed successfully' });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Something went wrong' });
    }
};

const transporter = nodemailer.createTransport({
    service: 'gmail', // You can use any email service
    auth: {
        user: process.env.EMAIL_USER, // Use email from .env
        pass: process.env.EMAIL_PASS// Your email password
    }
});

const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000); // Generate a 6 digit OTP
};

const requestOTP = async (req, res) => {
    const { email } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const otp = generateOTP();
        otpStore[email] = { otp, expiresAt: Date.now() + (10 * 60 * 1000) }; // Store OTP with expiration time

        const mailOptions = {
            from: 'process.env.EMAIL_USER',
            to: email,
            subject: 'Password Reset OTP',
            text: `Your OTP for password reset is ${otp}`
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error(error);
                return res.status(500).json({ message: 'Error sending email' });
            }
            res.status(200).json({ message: 'OTP sent successfully' });
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Something went wrong' });
    }
};

const verifyOTP = async (req, res) => {
    const { email, otp } = req.body;

    try {
        const otpData = otpStore[email];
        if (!otpData) {
            return res.status(402).json({ message: 'OTP not requested or expired' });
        }

        if (otpData.otp !== Number(otp) || Date.now() > otpData.expiresAt) {
            return res.status(401).json({ message: 'Invalid or expired OTP' });
        }

        res.status(200).json({ message: 'OTP verified successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Something went wrong' });
    }
};

const resetPassword = async (req, res) => {
    const { email, otp, newPassword, confirmPassword } = req.body;

    try {
        const otpData = otpStore[email];
        if (!otpData) {
            return res.status(400).json({ message: 'OTP not requested or expired' });
        }

        if (otpData.otp !== Number(otp) || Date.now() > otpData.expiresAt) {
            return res.status(401).json({ message: 'Invalid or expired OTP' });
        }

        if (newPassword !== confirmPassword) {
            return res.status(402).json({ message: 'Passwords do not match' });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 12);
        user.password = hashedPassword;
        await user.save();

        delete otpStore[email]; // Remove OTP after successful reset

        res.status(200).json({ message: 'Password reset successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Something went wrong' });
    }
};

const getAllUsers = async (req, res) => {
    try {
      const user = await User.findOne({ email: req.user.email });
      if (!user) return res.status(404).json({ message: 'User not found' });
      res.status(200).json(user);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Something went wrong' });
    }
  };

  const fs = require('fs');
const path = require('path');
const uploadProfilePicture = async (req, res) => {
    try {
      const user = await User.findOne({email : req.user.email});
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      if (user.profilePicture) {
        const oldFilePath = path.join(__dirname, '..', user.profilePicture);
        fs.unlink(oldFilePath, (err) => {
            if (err) {
                console.error('Error deleting old profile picture:', err);
            }
        });
    }
  
      user.profilePicture = req.file.path;
      await user.save();
  
      res.json({ message: 'Profile picture uploaded successfully', user });
    } catch (error) {
      console.error('Error uploading profile picture:', error);
      res.status(500).json({ message: 'Server error' });
    }
  };


const getProfilePicture = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.user.email });
    if (!user || !user.profilePicture) {
      return res.status(404).json({ message: 'Profile picture not found' });
    }

    const filePath = path.join(__dirname, '..', user.profilePicture);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'Profile picture not found' });
    }

    res.sendFile(filePath);
  } catch (error) {
    console.error('Error fetching profile picture:', error);
    res.status(500).json({ message: 'Server error' });
  }
};


  const renameUser = async (req, res) => {
    const { email, newName } = req.body;

    try {
        const existingUser = await User.findOne({ email });
        if (!existingUser) {
            return res.status(400).json({ message: 'User not found in users collection' });
        }

        const existingAdmin = await Admin.findOne({ email });
        if (!existingAdmin) {
            return res.status(400).json({ message: 'User not found in admins collection' });
        }

        existingUser.name = newName;
        existingAdmin.name = newName;

        await existingUser.save();
        await existingAdmin.save();

        res.json({ message: 'Name updated successfully in both collections', user: existingUser, admin: existingAdmin });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Something went wrong' });
    }
};

module.exports = { register, login, changePassword, requestOTP, verifyOTP, resetPassword,getAllUsers, uploadProfilePicture, renameUser ,getProfilePicture};