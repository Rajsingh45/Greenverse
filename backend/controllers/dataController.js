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


const getDataByDateTimeRange = async (startDate, endDate, startTime, endTime, parameter) => {
  const startDateTime = `${startDate}T${startTime}`;
  const endDateTime = `${endDate}T${endTime}`;

  const data = await sensors.find({
    date: { $gte: new Date(startDateTime), $lte: new Date(endDateTime) },
    parameter: parameter
  });

  return data;
};

const getDataByTopic = async (topic, date, time) => {
    if (!date || !time) {
        throw new Error('Date and time query parameters are required.');
    }
    const dateTime = `${date} ${time}`;
    try {
        await mongoClient.connect();
        const db = mongoClient.db(dbName);
        const collection = db.collection(topic);

        const data = await collection.find({ dateTime }).toArray();
        return data;
    } catch (err) {
        throw new Error('Failed to fetch data: ' + err.message);
    } finally {
        await mongoClient.close();
    }
};


module.exports = { getDataByDateTimeRange,getDataByDateTime,getDataByTopic };
