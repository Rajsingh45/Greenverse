const express = require('express');
const router = express.Router();
const { getDataByDateTime } = require('../controllers/dataController');
const { MongoClient } = require('mongodb');

router.get('/data', async (req, res) => {
  const { date, time } = req.query;

  try {
    const data = await getDataByDateTime(date, time);
    res.json(data);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: err.message });
  }
});

require('dotenv').config();

// MongoDB connection setup
const mongoURL = process.env.MONGODB_URL;
const client = new MongoClient(mongoURL, { useNewUrlParser: true, useUnifiedTopology: true });
let db;

// Middleware to connect to MongoDB
const connectDB = async (req, res, next) => {
  if (!db) {
    try {
      await client.connect();
      db = client.db(); // Set the database
    } catch (err) {
      console.error('Error connecting to MongoDB:', err);
      return res.status(500).json({ error: 'Failed to connect to database' });
    }
  }
  req.db = db; // Attach the database to the request object
  next();
};

// Helper function to get data by parameter and include timestamp
const getDataByParameter = async (db, parameter) => {
  const validFields = ['IAQ', 'Humidity', 'PM 2.5', 'PM 10', 'Temperature', 'Pressure', 'C02 Equivalent', 'VOC\'s', 'Gas Resistance']; // Update as per your fields
  if (!validFields.includes(parameter)) {
    throw new Error('Invalid parameter');
  }

  const collection = db.collection('sensors'); // Access the 'sensors' collection
  return collection.find({}, {
    projection: { 
      [parameter]: 1, // Include the specified parameter field
      dateTime: 1,   // Include the timestamp field
      _id: 0          // Exclude the _id field
    }
  }).toArray(); // Convert cursor to array
};

// Route to get data by parameter and include timestamp
router.get('/datas', connectDB, async (req, res) => {
  const { parameter } = req.query;

  try {
    if (!parameter) {
      return res.status(400).json({ error: 'Parameter is required' });
    }

    const data = await getDataByParameter(req.db, parameter);
    res.json(data);
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
});

const { getDataByTopic } = require('../controllers/dataController');

router.get('/data/:topic', async (req, res) => {
    const { topic } = req.params;
    const { date, time } = req.query;

    try {
        const data = await getDataByTopic(topic, date, time);
        res.json(data);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
