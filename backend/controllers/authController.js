const User = require('../models/USER');
const jwt = require('jsonwebtoken');
const Admin = require('../models/ADMIN');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const crypto = require('crypto');

const otpStore = {}; // In-memory store for OTPs

const register = async (req, res) => {
    const { email, password, name, contactNumber, role } = req.body;

    try {
        // Check if an admin user already exists
        if (role === 'admin') {
            const adminUser = await User.findOne({ role: 'admin' });
            if (adminUser) {
                return res.status(400).json({ error: 'Admin already exists' });
            }
        }

        // Check if the name already exists
        const existingName = await User.findOne({ name });
        if (existingName) {
            return res.status(400).json({ message: 'Username already exists' });
        }

        // Check if the email already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'Email already registered' });
        }

        // Check if the contact number already exists
        const existingContact = await User.findOne({ contactNumber });
        if (existingContact) {
            return res.status(400).json({ message: 'Contact number already registered' });
        }

        // Hash the password and create a new user
        const hashedPassword = await bcrypt.hash(password, 12);
        const newUser = new User({ email, password: hashedPassword, name, contactNumber, role: role || 'user' });
        await newUser.save();

        res.status(201).json({ message: role === 'user' ? 'User registered successfully' : 'Admin registered successfully' });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Something went wrong' });
    }
};


const generateRememberMeToken = () => {
    return crypto.randomBytes(32).toString('hex');
};

const login = async (req, res) => {
    const { email, password, rememberMe } = req.body;

    try {
        const user = await User.findOne({ email }).select('+rememberMeToken +rememberMeTokenExpiry');
        if (!user) {
            return res.status(404).json({ message: 'User Not Registered' });
        }

        const isPasswordCorrect = await bcrypt.compare(password, user.password);
        if (!isPasswordCorrect) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign({ email: user.email, id: user._id, role: user.role }, 'your_jwt_secret', { expiresIn: '1h' });

        if (rememberMe) {
            const rememberMeToken = generateRememberMeToken();
            user.rememberMeToken = rememberMeToken;
            user.rememberMeTokenExpiry = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days from now
            res.cookie('rememberMeToken', rememberMeToken, {
                httpOnly: true,
                secure: true, // Set to true if you're using https
                maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
            });
        } else {
            user.rememberMeToken = undefined;
            user.rememberMeTokenExpiry = undefined;
            res.clearCookie('rememberMeToken');
        }

        await user.save();

        res.status(200).json({ token, role: user.role });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Something went wrong' });
    }
};

const rememberMe = async (req, res) => {
    const { rememberMeToken } = req.cookies;

    if (!rememberMeToken) {
        return res.status(401).json({ message: 'No remember me token found' });
    }

    try {
        const user = await User.findOne({ rememberMeToken, rememberMeTokenExpiry: { $gt: new Date() } }).select('+rememberMeToken +rememberMeTokenExpiry');
        if (!user) {
            return res.status(401).json({ message: 'Invalid or expired remember me token' });
        }

        const token = jwt.sign({ email: user.email, id: user._id, role: user.role }, 'your_jwt_secret', { expiresIn: '1h' });
        res.status(200).json({ token, user: { email: user.email, role: user.role } });
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

const checkEmailExists = async (req, res) => {
    const { email } = req.body;
    try {
        const user = await User.findOne({ email });
        if (user) {
            res.json({ exists: true });
        } else {
            res.status(404).json({ exists: false, error: 'Email Not exists' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};
const transporter = nodemailer.createTransport({
    service: 'gmail', // You can use any email service
    auth: {
        user: process.env.EMAIL_USER, // Use email from .env
        pass: process.env.EMAIL_PASS// Your email password
    }
});

// authController.js

const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000); // Generate a 6 digit OTP
};

// const otpStore = {}; // Store OTPs temporarily

const requestSignupOTP = async (req, res) => {
    const { email } = req.body;

    try {
        const user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const otp = generateOTP();
        otpStore[email] = { otp, expiresAt: Date.now() + (10 * 60 * 1000) }; // Store OTP with expiration time

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Email Verification OTP',
            text: `Your OTP for email verification is ${otp}`
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
// authController.js

const verifySignupOTP = async (req, res) => {
    const { email, otp, name, password, contactNumber } = req.body;

    try {
        const otpData = otpStore[email];
        if (!otpData) {
            return res.status(402).json({ message: 'OTP not requested or expired' });
        }

        if (otpData.otp !== Number(otp) || Date.now() > otpData.expiresAt) {
            return res.status(401).json({ message: 'Invalid or expired OTP' });
        }

        // OTP is valid, hash the password before saving the user
        const hashedPassword = await bcrypt.hash(password, 12);

        const newUser = new User({ name, email, password: hashedPassword, contactNumber });
        await newUser.save();

        // Optionally, clear the OTP from the store after successful verification
        delete otpStore[email];

        res.status(200).json({ message: 'OTP verified successfully, user created' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Something went wrong' });
    }
};

// Existing forgot password OTP function

const requestForgotPasswordOTP = async (req, res) => {
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

const verifyForgotPasswordOTP = async (req, res) => {
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

// const requestSignupOTP = async (req, res) => {
//     const { email } = req.body;

//     try {
//         const existingUser = await User.findOne({ email });
//         if (existingUser) {
//             return res.status(400).json({ message: 'User already exists' });
//         }

//         const otp = generateOTP();
//         otpStore[email] = { otp, expiresAt: Date.now() + (10 * 60 * 1000) }; // Store OTP with expiration time

//         const mailOptions = {
//             from: process.env.EMAIL_USER,
//             to: email,
//             subject: 'Email Verification OTP',
//             text: `Your OTP for email verification is ${otp}`
//         };

//         transporter.sendMail(mailOptions, (error, info) => {
//             if (error) {
//                 console.error(error);
//                 return res.status(500).json({ message: 'Error sending email' });
//             }
//             res.status(200).json({ message: 'OTP sent successfully' });
//         });
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ message: 'Something went wrong' });
//     }
// };

// const verifySignupOTP = async (req, res) => {
//     const { email, otp, name, password, contactNumber } = req.body;

//     try {
//         const otpData = otpStore[email];
//         if (!otpData) {
//             return res.status(402).json({ message: 'OTP not requested or expired' });
//         }

//         if (otpData.otp !== Number(otp) || Date.now() > otpData.expiresAt) {
//             return res.status(401).json({ message: 'Invalid or expired OTP' });
//         }

//         // Register the user
//         const newUser = new User({ name, email, password, contactNumber });
//         await newUser.save();

//         res.status(200).json({ message: 'OTP verified and user registered successfully' });
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ message: 'Something went wrong' });
//     }
// };


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

const searchDevices = async (req, res) => {
    const { name } = req.query;
  
    try {
      if (!name) {
        return res.status(400).json({ message: 'Search query is required' });
      }
  
      // Get the user's email from the authenticated request (using the decoded token)
      const userEmail = req.user.email;
  
      // Find the user by email and search their ESP topics for the given name
      const user = await Admin.findOne({
        email: userEmail,
        espTopics: { $regex: name, $options: 'i' } // Case-insensitive search
      });
  
      if (!user) {
        return res.status(404).json({ message: 'No matching devices found' });
      }
  
      // Filter the ESP topics that match the search name
      const deviceNames = user.espTopics.filter(topic => topic.toLowerCase().includes(name.toLowerCase()));
  
      res.json({ deviceNames });
    } catch (error) {
      console.error('Error searching devices:', error);
      res.status(500).json({ message: 'Something went wrong' });
    }
  };
  
  const checkNameAvailability = async (req, res) => {
    const { name } = req.query;

    try {
        const existingUser = await User.findOne({ name });
        if (existingUser) {
            return res.status(400).json({ message: 'Username already exists' });
        }
        res.status(200).json({ message: 'Username is available' });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Something went wrong' });
    }
};

module.exports = { register,    checkNameAvailability,    requestSignupOTP,
    verifySignupOTP,
    requestForgotPasswordOTP,
    verifyForgotPasswordOTP, login, rememberMe ,searchDevices, changePassword,checkEmailExists, resetPassword,getAllUsers, uploadProfilePicture, renameUser ,getProfilePicture};