const AQI = require('../models/AQI');

const getAQIData = async (req, res) => {
    const { deviceId } = req.params;
    try {
        const aqiData = await AQI.find({ deviceId }).sort({ createdAt: -1 }).limit(1);
        res.json(aqiData[0]);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching AQI data', error });
    }
};

const postAQIData = async (req, res) => {
    const { deviceId } = req.params;
    const { pm25, pm10, temperature, humidity, pressure, co2, voc, gasResistance, iaq } = req.body;
    try {
        const newAQIData = new AQI({ deviceId, pm25, pm10, temperature, humidity, pressure, co2, voc, gasResistance, iaq });
        await newAQIData.save();
        res.status(201).json(newAQIData);
    } catch (error) {
        res.status(500).json({ message: 'Error saving AQI data', error });
    }
};

module.exports = { getAQIData, postAQIData };
