const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
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
    password: { type: String, required: true },
    profilePicture: { type: String, default: '' },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    rememberMeToken: { type: String, select: false },
    rememberMeTokenExpiry: { type: Date, select: false }
});

// Middleware to remove null or undefined rememberMeToken and rememberMeTokenExpiry
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
