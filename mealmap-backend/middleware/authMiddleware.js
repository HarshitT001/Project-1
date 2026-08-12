const jwt = require('jsonwebtoken');
const prisma = require('../config/prisma');

const protect = async (req, res, next) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      return res.status(401).json({ message: 'Not authorized, please log in' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await prisma.user.findUnique({ where: { id: Number(decoded.id) } });

    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    // Belt-and-braces: even if a token exists, every feature requires a
    // verified phone number.
    if (!user.phoneVerified) {
      return res.status(403).json({
        message: 'Please verify your phone number to use this feature',
        needsVerification: true,
        email: user.email,
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Session expired, please log in again' });
  }
};

module.exports = { protect };
