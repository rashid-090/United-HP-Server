const jwt = require('jsonwebtoken');

const authenticateUser = (req, res, next) => {
    const token = req.cookies.user_token;

    if (!token) {
        return res.status(401).json({ message: 'No token provided. Please log in.' });
    }

    try {
        const decoded = jwt.verify(token, process.env.SECRET);
        req.user = decoded; // Attach decoded user info (id, role, permissions) to req.user
        next();
    } catch (error) {
        res.status(401).json({ message: 'Invalid or expired token.' });
    }
};

// const verifySuperAdmin = (req, res, next) => {
//     try {
//         // Check if req.user exists and role is SuperAdmin
//         if (!req.user || req.user.role !== 'SuperAdmin') {
//             return res.status(403).json({ message: 'Access denied. Only SuperAdmin can assign permissions.' });
//         }
//         next();
//     } catch (error) {
//         res.status(401).json({ message: 'Authentication error' });
//     }
// };

module.exports = { authenticateUser };
