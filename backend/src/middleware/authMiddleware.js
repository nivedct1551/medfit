const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret';

const authMiddleware = (req, res, next) => {
    const token = req.header('Authorization')?.split(' ')[1]; // Expecting "Bearer <token>"

    if (!token) {
        return res.status(401).json({ error: 'No token, authorization denied' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded; // Contains { userId }
        next();
    } catch (err) {
        res.status(401).json({ error: 'Token is not valid' });
    }
};

module.exports = authMiddleware;
