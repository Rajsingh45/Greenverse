const User = require('../models/USER');
const Admin = require('../models/ADMIN');
const mongoose = require('mongoose');
const subscribeToTopics = require('../services/mqttMongoIntegration');
const moment = require('moment-timezone'); // Ensure moment-timezone is installed

// Function to get IST time as a string
const getCurrentISTTime = () => {
  return moment().tz('Asia/Kolkata').format('YYYY-MM-DD HH:mm:ss');
};

const createCollection = async (db, topic) => {
  const collectionExists = await db.listCollections({ name: topic }).hasNext();
  if (!collectionExists) {
    await db.createCollection(topic);
    console.log(`Collection created for topic: ${topic}`);
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
    if (user) {
      res.json({ exists: false, error: 'Email does not exist' });
    } else {
      res.json({ exists: true });
    }
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

const addUser = async (req, res) => {
  const { name, email, noofdevices, espTopics } = req.body;
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }
    const existingUser = await Admin.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    const newUser = new Admin({
      name,
      email,
      noofdevices,
      espTopics,
      dateAdded: getCurrentISTTime() // Use IST formatted string
    });
    await newUser.save();

    const db = mongoose.connection.db;
    for (const topic of espTopics) {
      await createCollection(db, topic);
    }
    await subscribeToTopics();
    res.status(201).json({ message: 'User added successfully', user: newUser });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Something went wrong' });
  }
};


const updateUserDevices = async (req, res) => {
    const { name, noofdevices, espTopics, email } = req.body;
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied' });
        }
        const existingUser = await Admin.findOne({ email });
        if (!existingUser) {
            return res.status(400).json({ message: 'User not found' });
        }
        existingUser.espTopics = espTopics;
        existingUser.noofdevices = noofdevices;
        existingUser.name = name;
        await existingUser.save();
        const db = mongoose.connection.db;
        for (const topic of espTopics) {
            await createCollection(db, topic);
        }
        await subscribeToTopics(email);
        res.json({ message: 'Number of devices updated successfully', user: existingUser });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Something went wrong' });
    }
};

const getAllUsers = async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied' });
        }
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const name = req.query.name || '';
        const searchQuery = name ? { name: new RegExp(name, 'i') } : {};
        const users = await Admin.find(searchQuery).skip(skip).limit(limit);
        const total = await Admin.countDocuments(searchQuery);
        const fullUserList = await Admin.find(searchQuery);
        res.status(200).json({ users, total: Number(total), fullUserList });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Something went wrong' });
    }
};

const renameUser = async (req, res) => {
    const { email, newName } = req.body;
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied' });
        }
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
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied' });
        }
        const existingUser = await Admin.findOneAndDelete({ email });
        if (!existingUser) {
            return res.status(400).json({ message: 'User not found' });
        }
        const espTopics = existingUser.espTopics || [];
        for (const topic of espTopics) {
            const collectionName = topic;
            const collection = mongoose.connection.db.collection(collectionName);
            if (collection) {
                await collection.drop();
                console.log(`Collection ${collectionName} dropped`);
            } else {
                console.log(`Collection ${collectionName} does not exist`);
            }
        }
        res.json({ message: 'User and their ESP topics deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Something went wrong' });
    }
};

const deleteTopic = async (req, res) => {
    const { topic } = req.body;
    if (!topic) {
        console.log('Topic is required');
        return res.status(400).json({ error: 'Topic is required' });
    }
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied' });
        }
        const user = await Admin.findOne({ espTopics: topic });
        if (!user) {
            console.log('Admin not found');
            return res.status(404).json({ error: 'Admin not found' });
        }
        user.espTopics = user.espTopics.filter((t) => t !== topic);
        user.noofdevices = user.espTopics.length;
        await user.save();
        const collectionName = topic;
        const db = mongoose.connection.db;
        const collections = await db.listCollections({ name: collectionName }).toArray();
        if (collections.length > 0) {
            await db.dropCollection(collectionName);
            console.log(`Collection ${collectionName} dropped`);
        } else {
            console.log(`Collection ${collectionName} does not exist`);
        }
        res.status(200).json({ message: 'Topic and associated collection deleted successfully' });
    } catch (error) {
        console.error('Error deleting topic:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

const searchUserByName = async (req, res) => {
    const { name } = req.query;
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied' });
        }
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
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied' });
        }
        const user = await Admin.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        const devices = user.noofdevices;
        const deviceNames = user.espTopics || [];
        res.status(200).json({ devices, deviceNames });
    } catch (error) {
        console.error('Error fetching user devices:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

const getDeviceNames = async (req, res) => {
    try {
        // if (req.user.role !== 'admin') {
        //     return res.status(403).json({ message: 'Access denied' });
        // }
        const user = await Admin.findOne({ email: req.user.email });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        const deviceNames = user.espTopics;
        res.status(200).json({ deviceNames });
    } catch (error) {
        console.error('Error fetching device names:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {getDeviceNames, addUser, getAllUsers, deleteTopic, updateUserDevices, getDevicesNumber, checkAdminEmailExists, deleteUser, renameUser, searchUserByName, getUserDevicesByEmail};

