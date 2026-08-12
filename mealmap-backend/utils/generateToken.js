const jwt = require('jsonwebtoken');

// Signs a JWT and sets it as an httpOnly cookie — safer than localStorage
// since client-side JS can never read or leak it.
const generateToken = (res, userId) => {
  const token = jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d',
  });

  const isProd = process.env.NODE_ENV === 'production';

  res.cookie('token', token, {
    httpOnly: true,
    secure: isProd, // must be true whenever sameSite is 'none' (HTTPS only)
    // Your frontend and backend live on different domains in production
    // (e.g. Vercel + Railway), so the cookie must be sameSite:'none' or the
    // browser will silently refuse to send it back on cross-site requests.
    // Locally (http://localhost) that combination is blocked by browsers,
    // so we use 'lax' there instead.
    sameSite: isProd ? 'none' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  return token;
};

module.exports = generateToken;
