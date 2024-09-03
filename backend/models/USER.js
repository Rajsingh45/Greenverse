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
        enum: ['user', 'admin'],
        default: 'user'
    },
    profilePicture: {
        data: Buffer, // Use Buffer to store the binary data of the image
        contentType: String, // Store the MIME type (e.g., 'image/png')
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
