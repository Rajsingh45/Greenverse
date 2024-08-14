const mqtt = require('mqtt');
const { MongoClient } = require('mongodb');
const fs = require('fs');
const moment = require('moment-timezone');
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
        // console.log('Connected to MQTT broker');
    });

    mqttClient.on('message', async (topic, message) => {
        try {
            const messageData = JSON.parse(message.toString());
            const currentSecond = getFormattedSecond();

            // Check if data is already stored for this second
            if (!lastStoredTimestamps[topic] || currentSecond > lastStoredTimestamps[topic]) {
                lastStoredTimestamps[topic] = currentSecond;

                const db = mongoClient.db(dbName);
                const collection = db.collection(topic);
                const result = await collection.insertOne({
                    ...messageData,
                    dateTime: currentSecond
                });

                if (result.insertedCount > 0) {
                    console.log('Data inserted:', result.insertedCount);
                }
            } else {
                // Data for topic already stored for this second
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

        // console.log(Subscribing to topics: ${espTopics.join(', ')});

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

subscribeToTopics().catch(err => {
    console.error('Failed to subscribe to topics:', err);
});

module.exports = subscribeToTopics;