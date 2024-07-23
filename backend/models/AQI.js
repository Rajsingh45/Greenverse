const mongoose = require('mongoose');

const aqiSchema = new mongoose.Schema({
    date: { type: Date, required: true },
    parameter: { type: String, required: true },
    value: { type: Number, required: true }
});

module.exports = mongoose.model('AQI', aqiSchema);