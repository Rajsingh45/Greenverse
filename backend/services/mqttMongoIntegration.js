const mqtt = require('mqtt');
const { MongoClient } = require('mongodb');
require('dotenv').config(); // Load environment variables

const mongoURL = process.env.MONGODB_URL;
const mqttUrl = 'mqtts://a1qe87k6xy75k4-ats.iot.eu-north-1.amazonaws.com'; // MQTT broker URL with SSL/TLS
const mqttTopic = 'esp32/pub';
const dbName = 'Airbuddi'; // Specify your database name
const collectionName = 'sensors'; // Collection name

const mongoClient = new MongoClient(mongoURL, { useNewUrlParser: true, useUnifiedTopology: true });

function getFormattedTime() {
  const now = new Date();
  const hours = now.getHours().toString().padStart(2, '0');
  const minutes = now.getMinutes().toString().padStart(2, '0');
  const seconds = now.getSeconds().toString().padStart(2, '0');
  return `${hours}:${minutes}:${seconds}`;
}

async function main() {
  let mqttClient;
  try {
    // Connect to MongoDB
    await mongoClient.connect();
    console.log('Connected to MongoDB');
    const db = mongoClient.db(dbName); // Use the specified database

    // List collections
    const collections = await db.listCollections().toArray();
    console.log('Collections in database:', collections.map(coll => coll.name));

    const collection = db.collection(collectionName); // Use the collection

    // Connect to MQTT broker
    mqttClient = mqtt.connect(mqttUrl, {
      key: require('fs').readFileSync(process.env.MQTT_KEY_PATH),      // Path to private key file
      cert: require('fs').readFileSync(process.env.MQTT_CERT_PATH),    // Path to certificate file
      ca: require('fs').readFileSync(process.env.MQTT_CA_PATH),        // Path to CA certificate file
      connectTimeout: 10000,              // Adjust if necessary
      protocol: 'mqtts',
      clean: true,                        // Matches "Clean Start"
      reconnectPeriod: 10000,             // Reconnect every 10 seconds if disconnected
      will: {                             // Configure Last Will and Testament if needed
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

    mqttClient.on('message', async (topic, message) => {
      console.log('Received message on topic:', topic);
      console.log('Message content:', message.toString()); // Log the raw message content
      if (topic === mqttTopic) {
        try {
          const messageData = JSON.parse(message.toString());
          console.log('Parsed data:', messageData);

          // Add the formatted time to the message data
          messageData.timestamp = getFormattedTime();

          const result = await collection.insertOne(messageData);
          
          // Check if the result is valid
          if (result.insertedCount > 0) {
            console.log('Data inserted with custom ID:', messageData.id);
          } 
        } catch (err) {
          console.error('Failed to process message or insert data into MongoDB:', err.message);
        }
      } else {
        console.warn('Received message on unexpected topic:', topic);
      }
    });

    process.on('SIGINT', async () => {
      console.log('Gracefully shutting down...');
      await mongoClient.close();
      mqttClient.end();
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
