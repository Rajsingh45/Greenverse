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
    }
});

module.exports = mongoose.model('Admin', AdminSchema);

