const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const contactRoutes = require('./routes/contact');
const dataRoutes = require('./routes/dataRoutes');
// const mqttMongoIntegration = require('./services/mqttMongoIntegration');
// const moment = require('moment-timezone');

const app = express();

const mongoURL = process.env.MONGODB_URL;

mongoose.connect(mongoURL, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log('Database connection successful');
        // mqttMongoIntegration(); // Uncomment if needed
    })
    .catch(err => {
        console.error('Database connection error:', err);
    });


// app.use(cors({
//     origin: ["https://airbuddi.vercel.app"], // Your frontend URL
//     methods: ["POST", "GET", "PUT", "DELETE"], // Allow necessary methods
//     credentials: true // Allow cookies if needed
// }));

const allowedOrigins = process.env.FRONTEND_URLS.split(',');

app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin like mobile apps or curl
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    methods: ["POST", "GET", "PUT", "DELETE"], // Allow necessary methods
    credentials: true // Allow cookies if needed
}));

app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Routes
app.use('/auth', authRoutes);
app.use('/admin', adminRoutes);
app.use('/', contactRoutes);
app.use('/api', dataRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
