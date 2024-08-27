const jwt = require('jsonwebtoken');
const User = require('../models/USER');
const Admin = require('../models/ADMIN');

const authMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(402).json({ message: 'Authorization header required' });
    }
    const token = authHeader.split(' ')[1];
    if (!token) {
        return res.status(403).json({ message: 'Authorization token required' });
    }
    try {
        const decoded = jwt.verify(token, 'your_jwt_secret');
        req.user = decoded;
        next();
    } catch (error) {
        res.status(405).json({ message: 'Invalid or expired token' });
    }
};

const adminMiddleware = async (req, res, next) => {
    if (!req.user || req.user.role !== 'admin') {
        return res.status(409).json({ message: 'Access denied' });
    }
    next();
};

module.exports = { authMiddleware, adminMiddleware };
