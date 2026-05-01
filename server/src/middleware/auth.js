const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'sight_and_sign_dev_secret';

const auth = async (req, res, next) => {
  try {
    const header = req.headers.authorization;
    if (!header || !header.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No token provided. Please log in.' });
    }
    const token = header.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);

    // Look up user from the persistent file store
    const { memUsers } = require('../routes/auth');
    const user = [...memUsers.values()].find(u => u._id === decoded.id);
    if (!user) return res.status(401).json({ message: 'User not found.' });
    if (!user.isActive) return res.status(403).json({ message: 'Account is disabled.' });

    // Attach a copy without passwordHash
    req.user = { ...user };
    delete req.user.passwordHash;
    return next();

  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired token.' });
  }
};

module.exports = auth;
