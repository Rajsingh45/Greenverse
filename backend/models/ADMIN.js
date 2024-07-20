const mongoose = require('mongoose');

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
    noofdevices:{
        type: Number,
        required: true
    },
    deviceIPs: {
        type: [String],
        validate: {
            validator: function (v) {
                return v.every(ip => /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(ip));
            },
            message: props => `${props.value} contains an invalid IP address! Please provide valid IPv4 addresses.`
        },
        default: []
    },
    dateAdded: { type: String, default: () => formatDate(new Date()) } // Update this line

});

const formatDate = (date) => {
    const day = date.getDate();
    const month = date.toLocaleString('default', { month: 'short' });
    const year = date.getFullYear();
    return `${day} ${month} ${year}`;
};

module.exports = mongoose.model('Admin', AdminSchema);
