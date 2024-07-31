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
    noofdevices: {
        type: Number,
        required: true
    },
    espTopics: { 
        type: [String],
        // validate: {
            // validator: function (v) {
            //     // const espTopicRegex = /^esp32\/pub\d+$/;
            //     return v.every(topic => espTopicRegex.test(topic));
            // },
            // message: props => `${props.value} contains an invalid topic! Please provide valid esp/pub{number} topics.`
        // },
        // default: []
    },
    dateAdded: { 
        type: String, 
        default: () => formatDate(new Date()) 
    }
});


const formatDate = (date) => {
    const day = date.getDate();
    const month = date.toLocaleString('default', { month: 'short' });
    const year = date.getFullYear();
    return `${day} ${month} ${year}`;
};

module.exports = mongoose.model('Admin', AdminSchema);
