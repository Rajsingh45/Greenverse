const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        match: [/\S+@\S+\.\S+/, 'Please fill a valid email address']
    },
    password: {
        type: String,
        required: true
    },
    contactNumber: {
        type: String,
        required: true,
        unique: true,
        match: [/^\d{10}$/, 'Please fill a valid contact number']
    },
    role: {
        type: String,
        enum: ['user', 'admin'], // Added role field
        default: 'user' // Default role is 'user'
    },
    profilePicture: {
        type: String,
        default: ''
    },
    rememberMeToken: {
        type: String,
        select: false
    },
    rememberMeTokenExpiry: {
        type: Date,
        select: false
    }
});

UserSchema.pre('save', function (next) {
    if (!this.rememberMeToken) {
        this.rememberMeToken = undefined;
    }
    if (!this.rememberMeTokenExpiry) {
        this.rememberMeTokenExpiry = undefined;
    }
    next();
});

module.exports = mongoose.model('User', UserSchema);
