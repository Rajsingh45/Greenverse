const mqtt = require('mqtt');
const { MongoClient } = require('mongodb');
const WebSocket = require('ws');
require('dotenv').config();
const moment = require('moment-timezone');

const mongoURL = process.env.MONGODB_URL;
const mqttUrl = 'mqtts://a1qe87k6xy75k4-ats.iot.eu-north-1.amazonaws.com';
const mqttTopic = 'esp32/pub';
const dbName = 'Airbuddi'; 
const collectionName = 'sensors'; 

const mongoClient = new MongoClient(mongoURL, { useNewUrlParser: true, useUnifiedTopology: true });

// Create a WebSocket server
const wss = new WebSocket.Server({ port: 8080 });

function getFormattedDateTime() {
  const now = moment().tz('Asia/Kolkata'); // IST timezone
  const date = now.format('YYYY-MM-DD'); // YYYY-MM-DD
  const time = now.format('HH:mm:00'); // HH:MM:00
  return `${date} ${time}`;
}

async function main() {
  let mqttClient;
  try {
    await mongoClient.connect();
    console.log('Connected to MongoDB');
    const db = mongoClient.db(dbName);

    const collections = await db.listCollections().toArray();
    console.log('Collections in database:', collections.map(coll => coll.name));

    const collection = db.collection(collectionName);

    mqttClient = mqtt.connect(mqttUrl, {
      key: require('fs').readFileSync(process.env.MQTT_KEY_PATH),
      cert: require('fs').readFileSync(process.env.MQTT_CERT_PATH),
      ca: require('fs').readFileSync(process.env.MQTT_CA_PATH),
      connectTimeout: 10000,
      protocol: 'mqtts',
      clean: true,
      reconnectPeriod: 10000,
      will: {
        topic: mqttTopic,
        payload: 'Will message',
        qos: 0,
        retain: false
      }
    });

    mqttClient.on('connect', () => {
      console.log('Connected to MQTT broker');
      mqttClient.subscribe(mqttTopic, { qos: 0 }, (err) => {
        if (err) {
          console.error('Failed to subscribe to topic:', err.message);
        } else {
          console.log(`Subscribed to topic: ${mqttTopic}`);
        }
      });
    });

    let lastStoredMinute = null;

    mqttClient.on('message', (topic, message) => {
      if (topic === mqttTopic) {
        try {
          const messageData = JSON.parse(message.toString());
          const currentDateTime = getFormattedDateTime();
          const currentMinute = currentDateTime.split(' ')[1].slice(0, 5); // HH:MM

          // Check if it's the beginning of a new minute
          if (currentMinute !== lastStoredMinute) {
            lastStoredMinute = currentMinute;

            // Store data and broadcast to WebSocket clients
            (async () => {
              try {
                const result = await collection.insertOne({
                  ...messageData,
                  dateTime: currentDateTime // Store full datetime in IST
                });

                if (result.insertedCount > 0) {
                  console.log('Data inserted:', result.insertedCount);
                  // Broadcast the data to WebSocket clients
                  wss.clients.forEach(client => {
                    if (client.readyState === WebSocket.OPEN) {
                      client.send(JSON.stringify(messageData));
                    }
                  });
                }
              } catch (err) {
                console.error('Failed to insert data into MongoDB:', err.message);
              }
            })();
          }
        } catch (err) {
          console.error('Failed to process message:', err.message);
        }
      } else {
        console.warn('Received message on unexpected topic:', topic);
      }
    });

    process.on('SIGINT', async () => {
      console.log('Gracefully shutting down...');
      await mongoClient.close();
      mqttClient.end();
      wss.close();
      process.exit();
    });

  } catch (err) {
    console.error('Failed to connect to MongoDB or MQTT broker:', err.message);
  }

  mongoClient.on('error', (err) => {
    console.error('MongoDB Client Error:', err.message);
  });

  mqttClient.on('error', (err) => {
    console.error('MQTT Client Error:', err.stack || err.message || err);
  });
}

module.exports = main;
