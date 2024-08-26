const User = require('../models/USER');
const jwt = require('jsonwebtoken');
const Admin = require('../models/ADMIN');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const otpStore = {}; // In-memory store for OTPs
const path = require('path');
const fs = require('fs');

const register = async (req, res) => {
    const { email, password, name, contactNumber } = req.body;
    try {
        const existingName = await User.findOne({ name });
        if (existingName) {
            return res.status(400).json({ message: 'Username already exists' });
        }
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'Email already registered' });
        }
        const existingContact = await User.findOne({ contactNumber });
        if (existingContact) {
            return res.status(400).json({ message: 'Contact number already registered' });
        }
        const hashedPassword = await bcrypt.hash(password, 12);
        const newUser = new User({ email, password: hashedPassword, name, contactNumber });
        await newUser.save();
        res.status(201).json({ message: 'User registered successfully' });
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
        const token = jwt.sign({ email: user.email, id: user._id }, 'your_jwt_secret', { expiresIn: '24h' });
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
        res.status(200).json({ token });
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
        const token = jwt.sign({ email: user.email, id: user._id }, 'your_jwt_secret', { expiresIn: '24h' });
        res.status(200).json({ token, user: { email: user.email } });
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

const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000); // Generate a 6 digit OTP
};

const requestSignupOTP = async (req, res) => {
    const { email, contactNumber } = req.body;
    try {
        const userByEmail = await User.findOne({ email });
        if (userByEmail) {
            return res.status(400).json({ message: 'User with this email already exists' });
        }
        const userByContact = await User.findOne({ contactNumber });
        if (userByContact) {
            return res.status(400).json({ message: 'User with this contact number already exists' });
        }
        const otp = generateOTP();
        otpStore[email] = { otp, expiresAt: Date.now() + (10 * 60 * 1000) }; // Store OTP with expiration time
        const logoPath = path.join(__dirname, '../../frontend/src/images/logo.png');
        console.log(logoPath)
        const logoBase64 = fs.readFileSync(logoPath, 'base64');
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Email Verification OTP',
            html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
                <div style="background-color: green; padding: 10px; border-radius: 10px 10px 0 0; text-align: center;">
                    <img src="https://drive.google.com/uc?export=view&id=12121nsZjukO8ve1fUz84v0BY8Dm9yYme" alt="Company Logo" style="width: 100px; height: auto;" />
                    <h2 style="color: white; margin: 10px 0;">Greenverse Private Limited</h2>
                </div>
                <div style="padding: 20px;">
                    <p>Hi,</p>
                    <p>Enter this code in the next 10 minutes to sign up:</p>
                    <div style="text-align: center; margin: 20px 0;">
                        <div style="font-size: 36px; font-weight: bold; border: 2px solid #ddd; display: inline-block; padding: 10px 20px; border-radius: 5px;">
                            ${otp}
                        </div>
                    </div>
                    <p>If you didn't request this code, you can safely ignore this email. Someone else might have typed your email address by mistake.</p>
                </div>
                <div style="background-color: #f8f8f8; padding: 10px; text-align: center; border-radius: 0 0 10px 10px;">
                    <p style="margin: 0; color: #888;">Thank you for using our service!</p>
                </div>
            </div>
            `
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

const requestPasswordOTP = async (req, res) => {
    const { email, oldPassword  } = req.body;
    try {
        const userByEmail = await User.findOne({ email });
        if (!userByEmail) {
            return res.status(400).json({ message: 'User with this email does not exist' });
        }
        const isMatch = await bcrypt.compare(oldPassword, userByEmail.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Incorrect old password' });
        }
        const otp = generateOTP();
        otpStore[email] = { otp, expiresAt: Date.now() + (10 * 60 * 1000) }; 
        const logoPath = path.join(__dirname, '../../frontend/src/images/logo.png');
        console.log(logoPath)
        const logoBase64 = fs.readFileSync(logoPath, 'base64');
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Email Verification OTP',
            html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
                <div style="background-color: green; padding: 10px; border-radius: 10px 10px 0 0; text-align: center;">
                <img src="https://drive.google.com/uc?export=view&id=12121nsZjukO8ve1fUz84v0BY8Dm9yYme" alt="Company Logo" style="width: 100px; height: auto;" />
                    <h2 style="color: white; margin: 10px 0;">Greenverse Private Limited</h2>
                </div>
                <div style="padding: 20px;">
                    <p>Hi,</p>
                    <p>Enter this code in the next 10 minutes to sign up:</p>
                    <div style="text-align: center; margin: 20px 0;">
                        <div style="font-size: 36px; font-weight: bold; border: 2px solid #ddd; display: inline-block; padding: 10px 20px; border-radius: 5px;">
                            ${otp}
                        </div>
                    </div>
                    <p>If you didn't request this code, you can safely ignore this email. Someone else might have typed your email address by mistake.</p>
                </div>
                <div style="background-color: #f8f8f8; padding: 10px; text-align: center; border-radius: 0 0 10px 10px;">
                    <p style="margin: 0; color: #888;">Thank you for using our service!</p>
                </div>
            </div>
            `
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
        const hashedPassword = await bcrypt.hash(password, 12);
        const newUser = new User({ name, email, password: hashedPassword, contactNumber });
        await newUser.save();
        delete otpStore[email];
        res.status(200).json({ message: 'OTP verified successfully, user created' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Something went wrong' });
    }
};

const verifyPasswordOTP = async (req, res) => {
    const { email, otp, password } = req.body;
    try {
        const otpData = otpStore[email];
        if (!otpData) {
            return res.status(402).json({ message: 'OTP not requested or expired' });
        }
        if (otpData.otp !== Number(otp) || Date.now() > otpData.expiresAt) {
            return res.status(401).json({ message: 'Invalid or expired OTP' });
        }
        const hashedPassword = await bcrypt.hash(password, 12);
        await User.findOneAndUpdate(
            { email },
            { password: hashedPassword }
        );
        delete otpStore[email];
        res.status(200).json({ message: 'OTP verified successfully, user details updated' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Something went wrong' });
    }
};

const requestForgotPasswordOTP = async (req, res) => {
    const { email } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        const otp = generateOTP();
        otpStore[email] = { otp, expiresAt: Date.now() + (10 * 60 * 1000) }; // Store OTP with expiration time
        const logoPath = path.join(__dirname, '../../frontend/src/images/logo.png');
        const logoBase64 = fs.readFileSync(logoPath, 'base64');
        // const logoDataURI = `data:image/png;base64,${logoBase64}`;
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Password Reset OTP',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
                    <div style="background-color: green; padding: 10px; border-radius: 10px 10px 0 0; text-align: center;">
                        <img src="https://drive.google.com/uc?export=view&id=12121nsZjukO8ve1fUz84v0BY8Dm9yYme" alt="Company Logo" style="width: 100px; height: auto;" />
                        <h2 style="color: white; margin: 10px 0;">Greenverse Private Limited</h2>
                    </div>
                    <div style="padding: 20px;">
                        <p>Hi,</p>
                        <p>You requested to reset your password. Enter this code within the next 10 minutes to reset your password:</p>
                        <div style="text-align: center; margin: 20px 0;">
                            <div style="font-size: 36px; font-weight: bold; border: 2px solid #ddd; display: inline-block; padding: 10px 20px; border-radius: 5px;">
                                ${otp}
                            </div>
                        </div>
                        <p>If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.</p>
                    </div>
                    <div style="background-color: #f8f8f8; padding: 10px; text-align: center; border-radius: 0 0 10px 10px;">
                        <p style="margin: 0; color: #888;">Thank you for using our service!</p>
                    </div>
                </div>
            `
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
    const { email, otp, newPassword, confirmPassword } = req.body
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
    const adminEmail = process.env.ADMIN_EMAIL; 
    try {
        const existingUser = await User.findOne({ email });
        if (!existingUser) {
            return res.status(400).json({ message: 'User not found in users collection' });
        }
        existingUser.name = newName;
        await existingUser.save();
        if (email !== adminEmail) {
            const existingAdmin = await Admin.findOne({ email });
            if (!existingAdmin) {
                return res.status(400).json({ message: 'User not found in admins collection' });
            }
            existingAdmin.name = newName;
            await existingAdmin.save();
        }
        res.json({ message: 'Name updated successfully in both collections', user: existingUser });
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
      const userEmail = req.user.email;
      const user = await Admin.findOne({
        email: userEmail,
        espTopics: { $regex: name, $options: 'i' } // Case-insensitive search
      });
      if (!user) {
        return res.status(404).json({ message: 'No matching devices found' });
      }
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

const deleteProfilePicture = async (req, res) => {
    try {
      const userId = req.user.id;
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      if (user.profilePicture && fs.existsSync(user.profilePicture)) {
        fs.unlinkSync(user.profilePicture);
      }
      user.profilePicture = null;
      await user.save();
      res.status(200).json({ message: 'Profile picture deleted successfully' });
    } catch (error) {
      console.error('Error deleting profile picture:', error);
      res.status(500).json({ message: 'Server error' });
    }
};

module.exports = { register, checkNameAvailability, requestSignupOTP, verifySignupOTP, requestForgotPasswordOTP, verifyForgotPasswordOTP,
    login, rememberMe, searchDevices, changePassword, checkEmailExists,  getAllUsers,
    resetPassword, uploadProfilePicture, renameUser , getProfilePicture, deleteProfilePicture, requestPasswordOTP, verifyPasswordOTP };