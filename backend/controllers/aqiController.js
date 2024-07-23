const AQI = require('../models/AQI');
const dayjs = require('dayjs');

// Convert DD-MM-YYYY string to JavaScript Date object
const formatDate = (dateString) => dayjs(dateString, 'DD-MM-YYYY').toDate();

exports.addAQIData = async (req, res) => {
    const { date, parameter, value } = req.body;

    try {
        const formattedDate = formatDate(date);
        const newAQI = new AQI({ date: formattedDate, parameter, value });
        await newAQI.save();

        res.status(201).json(newAQI);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error adding AQI data', error });
    }
};

exports.getAQIData = async (req, res) => {
    const { startDate, endDate, parameter } = req.query;

    try {
        const start = formatDate(startDate);
        const end = formatDate(endDate);

        // Validate the dates
        if (isNaN(start.getTime()) || isNaN(end.getTime())) {
            return res.status(400).json({ message: 'Invalid date format' });
        }

        const query = {
            date: { $gte: start, $lte: end }
        };

        // Filter by parameter if provided
        if (parameter) {
            query.parameter = parameter;
        }

        const data = await AQI.find(query).sort({ date: 1 });

        res.status(200).json(data);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching AQI data', error });
    }
};
