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

    // const allowedOrigins = process.env.FRONTEND_URLS.split(',').map(url => url.trim());

    // app.use(cors({
    //     origin: function (origin, callback) {
    //         // Allow requests with no origin (like mobile apps or curl) or from allowed origins
    //         if (!origin || allowedOrigins.some(allowedOrigin => origin.startsWith(allowedOrigin))) {
    //             callback(null, true);
    //         } else {
    //             callback(new Error('Not allowed by CORS'));
    //         }
    //     },
    //     methods: ["POST", "GET", "PUT", "DELETE"],
    //     credentials: true // Allow credentials (cookies)
    // }));

app.use(cors());
app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Routes
app.use('/auth', authRoutes);
app.use('/admin', adminRoutes);
app.use('/', contactRoutes);
app.use('/api', dataRoutes);
app.get("/", (req, res) => {
    res.json("Hello");
})

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
