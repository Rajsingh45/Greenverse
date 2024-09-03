const mongoose = require('mongoose');
const moment = require('moment-timezone');

// Function to get IST time as a string
const getCurrentISTTime = () => {
    return moment().tz('Asia/Kolkata').format('YYYY-MM-DD HH:mm:ss');
};

const AdminSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        validate: {
            validator: function (v) {
                return /^[A-Za-z\s]+$/.test(v);
            },
            message: props => `${props.value} is not a valid name! Only alphabets are allowed.`
        }
    },
    email: {
        type: String, 
        required: true, 
        unique: true,
        match: [/\S+@\S+\.\S+/, 'Please fill a valid email address'] 
    },
    noofdevices: {
        type: Number,
        required: true
    },
    espTopics: { 
        type: [String]
    },
    dateAdded: { 
        type: String, 
        default: getCurrentISTTime // Store date in IST as a string
    }
});

module.exports = mongoose.model('Admin', AdminSchema);
