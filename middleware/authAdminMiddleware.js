const jwt = require('jsonwebtoken');
const { secret } = require('../config');

const authAdminMiddleware = (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ message: 'Authorization required' });
        }

        const decoded = jwt.verify(token, secret);
        if (!decoded.roles.includes('ADMIN')) {
            return res.status(403).json({ message: 'Access denied. Admins only.' });
        }

        req.user = decoded; // Attach user data to request
        next();
    } catch (e) {
        console.error('Admin authentication error:', e);
        res.status(401).json({ message: 'Invalid token' });
    }
};

module.exports = authAdminMiddleware;
