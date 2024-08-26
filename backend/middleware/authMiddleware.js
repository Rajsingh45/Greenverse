const jwt = require('jsonwebtoken');

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
module.exports = { authMiddleware };
