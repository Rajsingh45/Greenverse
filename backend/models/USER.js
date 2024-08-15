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

module.exports = mongoose.model('User', UserSchema);



// Middleware to remove null or undefined rememberMeToken and rememberMeTokenExpiry
UserSchema.pre('save', function (next) {
    if (!this.rememberMeToken) {
        this.rememberMeToken = undefined;
    }
    if (!this.rememberMeTokenExpiry) {
        this.rememberMeTokenExpiry = undefined;
    }

    // role ka issue aaya toh next two lines delete
    if (this.role === 'user') {
        this.role = undefined;
    }

    next();
});

// role ka issue aaya toh next lines delete
UserSchema.post('init', function (doc) {
    if (!doc.role) {
        doc.role = 'user';
    }
});

function transform(doc, ret) {
    if (ret.role === 'user') {
        delete ret.role;
    }
    return ret;
}

UserSchema.set('toJSON', { transform });
UserSchema.set('toObject', { transform });

//yaha tak sab delete

module.exports = mongoose.model('User', UserSchema);
