const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const aqiRoutes = require('./routes/aqi');

const app = express();

app.use(cors());
app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

const mongoURL = process.env.MONGODB_URL

mongoose.connect(mongoURL,
)
.then(() => {
    console.log('Database connection successful');
  }).catch((err) => {
    console.error('Database connection error:', err);
  });


app.use('/auth', authRoutes);
app.use('/aqi', aqiRoutes);                         

const PORT = process.env.PORT;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
