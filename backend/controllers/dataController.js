const { MongoClient } = require('mongodb');
require('dotenv').config();

const mongoURL = process.env.MONGODB_URL;
const dbName = 'Airbuddi'; 
const collectionName = 'sensors';

const mongoClient = new MongoClient(mongoURL, { useNewUrlParser: true, useUnifiedTopology: true });

const getDataByDateTime = async (date, time) => {
  if (!date || !time) {
    throw new Error('Date and time query parameters are required.');
  }

  const dateTime = `${date} ${time}`;
  
  try {
    await mongoClient.connect();
    const db = mongoClient.db(dbName);
    const collection = db.collection(collectionName);

    const data = await collection.find({ dateTime }).toArray();
    return data;
  } catch (err) {
    throw new Error('Failed to fetch data: ' + err.message);
  }
};

module.exports = { getDataByDateTime };
