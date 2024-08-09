const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('cors');
const mqttMongoIntegration = require('./services/mqttMongoIntegration');
const dataRoutes = require('./routes/dataRoutes');
const moment = require('moment-timezone');
const { MongoClient } = require('mongodb');
const mongoURL = process.env.MONGODB_URL
const mongoClient = new MongoClient(mongoURL, { useNewUrlParser: true, useUnifiedTopology: true });
const dbName = 'Airbuddi';

require('dotenv').config();

const authRoutes = require('./routes/auth');
const aqiRoutes = require('./routes/aqi');
const adminRoutes = require('./routes/admin'); // Add this line
const contactRoutes = require('./routes/contact');


const app = express();

app.use(cors());
app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());


mongoose.connect(mongoURL,
)
.then(() => {
    console.log('Database connection successful');
    // mqttMongoIntegration();
    
  }).catch((err) => {
    console.error('Database connection error:', err);
  });


app.use('/auth', authRoutes);
app.use('/aqi', aqiRoutes);  
app.use('/admin',adminRoutes);
app.use('/', contactRoutes);

app.use('/api', dataRoutes); 

app.get('/api/device-data/:espTopic', async (req, res) => {
  const { espTopic } = req.params;
  const now = moment().tz('Asia/Kolkata').format('YYYY-MM-DD HH:mm:ss');
  mqttMongoIntegration();

  try {
      await mongoClient.connect();
      const db = mongoClient.db(dbName);
      const adminCollection = db.collection('admins');
      
      const adminDoc = await adminCollection.findOne({ espTopics: espTopic });
      console.log(adminDoc)
      if (!adminDoc) {
          return res.status(404).json({ error: 'ESP topic not found' });
      }

      const deviceCollection = db.collection(espTopic);
      const data = await deviceCollection.find({ dateTime: now }).toArray();
      res.json(data);
  } catch (err) {
      res.status(500).json({ error: 'Failed to fetch data' });
  }
});

app.get('/api/device-data-by-datetime/:espTopic/:datetime', async (req, res) => {
  const { espTopic, datetime } = req.params;

  try {
      await mongoClient.connect();
      const db = mongoClient.db(dbName);
      const deviceCollection = db.collection(espTopic);

      const data = await deviceCollection.find({ dateTime: datetime }).toArray();

      if (data.length > 0) {
          res.json(data);
      } else {
          res.status(404).json({ error: 'No data found for the specified datetime' });
      }
  } catch (err) {
      res.status(500).json({ error: 'Failed to fetch data' });
  }
});

app.get('/api/device-data-by-daterange/:espTopic', async (req, res) => {
  const { espTopic } = req.params;
  const { startDate, endDate, parameter } = req.query;

  try {
    await mongoClient.connect();
    const db = mongoClient.db(dbName);
    const deviceCollection = db.collection(espTopic);

    const start = startDate;
    const end = endDate;

    const data = await deviceCollection.find({
      dateTime: {
        $gte: start,
        $lte: end
      }
    }).toArray();

    if (data.length > 0) {
      const filteredData = data.map(entry => {
        if (entry.hasOwnProperty(parameter)) {
          return {
            dateTime: entry.dateTime,
            [parameter]: entry[parameter] 
          };
        } else {
          console.warn(`Parameter "${parameter}" not found in document.`);
          return null;
        }
      }).filter(entry => entry !== null);

      res.json(filteredData);
    } else {
      res.status(404).json({ error: 'No data found for the specified date range' });
    }
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch data' });
  }
});

app.get('/api/download-device-data/:espTopic', async (req, res) => {
  const { espTopic } = req.params;
  const { startDate, endDate } = req.query;

  try {
    await mongoClient.connect();
    const db = mongoClient.db(dbName);
    const deviceCollection = db.collection(espTopic);

    const data = await deviceCollection.find({
      dateTime: {
        $gte: startDate,
        $lte: endDate
      }
    }).toArray();

    if (data.length > 0) {
      res.json(data);
    } else {
      res.status(404).json({ error: 'No data found for the specified date range' });
    }
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch data' });
  }
});

app.get('/api/device-data-parameter/:espTopic', async (req, res) => {
  const { espTopic } = req.params;

  try {
    await mongoClient.connect();
    const db = mongoClient.db(dbName);
    const deviceCollection = db.collection(espTopic);

    const data = await deviceCollection.find({}, { projection: { 'Gas Resistance': 1, _id: 0 } }).toArray();

    if (data.length > 0) {
      res.json(data);
    } else {
      res.status(404).json({ error: 'No data found for the "gas resistance" parameter' });
    }
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch data' });
  }
});


const PORT = process.env.PORT;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
