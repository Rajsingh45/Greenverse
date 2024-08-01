const User = require('../models/USER');
const Admin = require('../models/ADMIN');
const moment = require('moment');
const mongoose = require('mongoose');
const subscribeToTopics = require('../services/mqttMongoIntegration');

const formatDateAWS = (date) => {
    return moment(date).format('YYYY-MM-DD HH:mm:00');
};

const createCollection = async (db, topic) => {
    const collectionExists = await db.listCollections({ name: topic }).hasNext();
    if (!collectionExists) {
        await db.createCollection(topic);
        console.log(`Collection created for topic: ${topic}`);
    }
};

const addUser = async (req, res) => {
    const { name, email, noofdevices, espTopics } = req.body;

    try {
        const existingUser = await Admin.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'Email already exists' });
        }

        const newUser = new Admin({
            name,
            email,
            noofdevices,
            espTopics,
            role: 'user',
            dateAdded: formatDateAWS(new Date())
        });
        await newUser.save();
        // Connect to MongoDB
        const db = mongoose.connection.db;
        // Create collections for each topic specified in espTopics
        for (const topic of espTopics) {
            await createCollection(db, topic);
        }
        // Subscribe to new topics
        await subscribeToTopics(); // Ensure subscription to new topics
        // Verify data stored correctly
        const storedUser = await Admin.findOne({ email });
        console.log('Stored user:', storedUser);
        res.status(201).json({ message: 'User added successfully', user: newUser });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Something went wrong' });
    }
};

// const addUser = async (req, res) => {
//     const { name, email, noofdevices, espTopics } = req.body;

//     try {
//         const existingUser = await Admin.findOne({ email });
//         if (existingUser) {
//             return res.status(400).json({ message: 'Email already exists' });
//         }

//         const newUser = new Admin({ name, email, noofdevices, espTopics, role: 'user', dateAdded: formatDate(new Date()) });
//         await newUser.save();

//         res.status(201).json({ message: 'User added successfully', user: newUser });
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ message: 'Something went wrong' });
//     }
// };

const updateUserDevices = async (req, res) => {
    const { name, noofdevices, espTopics, email } = req.body;

    try {
        const existingUser = await Admin.findOne({ email });
        if (!existingUser) {
            return res.status(400).json({ message: 'User not found' });
        }

        // Update user details
        existingUser.espTopics = espTopics; 
        existingUser.noofdevices = noofdevices;
        existingUser.name = name;

        await existingUser.save();

        // Connect to MongoDB
        const db = mongoose.connection.db;

        // Create collections for each topic specified in espTopics
        for (const topic of espTopics) {
            await createCollection(db, topic);
        }

        // Subscribe to new topics
        await subscribeToTopics(email); // Ensure subscription to new topics

        res.json({ message: 'Number of devices updated successfully', user: existingUser });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Something went wrong' });
    }
};

// const updateUserDevices = async (req, res) => {
//     const { name, noofdevices, espTopics, email } = req.body;

//     try {
//         const existingUser = await Admin.findOne({ email });
//         if (!existingUser) {
//             return res.status(400).json({ message: 'User not found' });
//         }

//         existingUser.espTopics = espTopics; 
//         existingUser.noofdevices = noofdevices;
//         existingUser.name = name;

//         await existingUser.save();

//         res.json({ message: 'Number of devices updated successfully', user: existingUser });
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ message: 'Something went wrong' });
//     }
// };


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

const getUserDevicesByEmail = async (req, res) => {
    const { email } = req.query;

    try {
        const user = await Admin.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json({ devices: user.noofdevices });
    } catch (error) {
        console.error('Error fetching user devices:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = { addUser, getAllUsers, updateUserDevices, getDevicesNumber, checkAdminEmailExists, deleteUser, renameUser, searchUserByName, getUserDevicesByEmail};

