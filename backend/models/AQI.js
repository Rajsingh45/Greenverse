const mongoose = require('mongoose');

const AQISchema = new mongoose.Schema({
    deviceId: String,
    pm25: Number,
    pm10: Number,
    temperature: Number,
    humidity: Number,
    pressure: Number,
    co2: Number,
    voc: Number,
    gasResistance: Number,
    iaq: Number,
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('AQI', AQISchema);
