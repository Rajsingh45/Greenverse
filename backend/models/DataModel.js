const mongoose = require('mongoose');

const DataSchema = new mongoose.Schema({
    dateTime: { type: Date, required: true },
    
    // other fields
});

const DataModel = mongoose.model('Data', DataSchema);

module.exports = DataModel;
