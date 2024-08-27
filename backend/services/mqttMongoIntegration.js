const mqtt = require('mqtt');
const { MongoClient } = require('mongodb');
const fs = require('fs');
const moment = require('moment-timezone');
const cron = require('node-cron');
require('dotenv').config();
const express = require('express');
const router = express.Router();

const mongoURL = process.env.MONGODB_URL;
const mqttUrl = 'mqtts://a1qe87k6xy75k4-ats.iot.eu-north-1.amazonaws.com';
const dbName = 'Airbuddi';
const mongoClient = new MongoClient(mongoURL, { useNewUrlParser: true, useUnifiedTopology: true });

let mqttClient;
const lastStoredTimestamps = {};

function getFormattedSecond() {
    return moment().tz('Asia/Kolkata').format('YYYY-MM-DD HH:mm:ss');
}

async function connectMQTT() {
    mqttClient = mqtt.connect(mqttUrl, {
        key: fs.readFileSync(process.env.MQTT_KEY_PATH),
        cert: fs.readFileSync(process.env.MQTT_CERT_PATH),
        ca: fs.readFileSync(process.env.MQTT_CA_PATH),
        connectTimeout: 10000,
        protocol: 'mqtts',
        clean: true,
        reconnectPeriod: 10000
    });

    mqttClient.on('connect', () => {
        console.log('Connected to MQTT broker');
    });

    mqttClient.on('message', async (topic, message) => {
        try {
            const messageData = JSON.parse(message.toString());
            const currentSecond = getFormattedSecond();

            if (!lastStoredTimestamps[topic] || currentSecond > lastStoredTimestamps[topic]) {
                lastStoredTimestamps[topic] = currentSecond;

                const db = mongoClient.db(dbName);
                const collection = db.collection(topic);
                const result = await collection.insertOne({
                    ...messageData,
                    dateTime: currentSecond,
                    dataType: 'raw' // Marking as raw data
                });

                if (result.insertedCount > 0) {
                    console.log('Data inserted:', result.insertedCount);
                }
            }
        } catch (err) {
            console.error('Failed to process message:', err.message);
        }
    });
    mqttClient.on('error', (err) => {
        console.error('MQTT Client Error:', err.stack || err.message || err);
    });
}

async function subscribeToTopics() {
    if (!mqttClient) {
        await connectMQTT(); // Initialize MQTT client if not already
    }
    try {
        await mongoClient.connect();
        console.log('Connected to MongoDB');
        const db = mongoClient.db(dbName);
        // Fetch all topics from existing collections
        const collections = await db.listCollections().toArray();
        const espTopics = collections.map(col => col.name).filter(name => /^.*\d$/.test(name));

        console.log(`Subscribing to topics: ${espTopics.join(', ')}`);
        if (espTopics.length === 0) {
            console.error('No topics found to subscribe.');
            return;
        }

        espTopics.forEach(topic => {
            mqttClient.subscribe(topic, { qos: 0 }, (err) => {
                if (err) {
                    console.error(`Failed to subscribe to topic ${topic}:`, err.message);
                } else {
                    console.log(`Subscribed to topic: ${topic}`);
                }
            });
        });
    } catch (err) {
        console.error('Failed to connect to MongoDB or MQTT broker:', err.message);
    }
}

async function aggregateData(db, topic, range) {
    const collection = db.collection(topic);
    const startTime = moment().subtract(range, 'seconds').format('YYYY-MM-DD HH:mm:ss');
    const endTime = moment().format('YYYY-MM-DD HH:mm:ss'); // Current time
    // Find all raw documents within the specified range
    const data = await collection.find({
        dateTime: { $gte: startTime, $lt: endTime },
        dataType: 'raw' // Only consider raw data for aggregation
    }).toArray();

    if (data.length === 0) {
        return;
    }
    // Calculate averages
    const averageData = {
        dateTime: endTime, // Timestamp the aggregated document as the most recent entry
        dataType: 'aggregated', // Marking as aggregated data
        id: data[0].id, // Extract `id` from the first document and move it outside of `parameters`
        parameters: {}
    };
    const parameterKeys = Object.keys(data[0]).filter(key => !['dateTime', '_id', 'dataType', 'id'].includes(key));
    parameterKeys.forEach(key => {
        averageData.parameters[key] = data.reduce((sum, doc) => sum + parseFloat(doc[key]), 0) / data.length;
    });
    await collection.deleteMany({
        dateTime: { $gte: startTime, $lt: endTime },
        dataType: 'raw' // Ensure only raw data is deleted
    });
    await collection.insertOne(averageData);
}

// Schedule a job to run every 60 seconds for 1-minute aggregation
cron.schedule('* * * * *', async () => {
    try {
        const db = mongoClient.db(dbName);
        const collections = await db.listCollections().toArray();
        const espTopics = collections.map(col => col.name).filter(name => /^.*\d$/.test(name));

        for (const topic of espTopics) {
            await aggregateData(db, topic, 60); // 1-minute range
        }
    } catch (err) {
        console.error(err);
    }
});

subscribeToTopics().catch(err => {
    console.error('Failed to subscribe to topics:', err);
});

module.exports = subscribeToTopics;
