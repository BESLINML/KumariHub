const crypto = require('node:crypto');

const equal = (left, right) => {
  const a = Buffer.from(String(left));
  const b = Buffer.from(String(right));
  return a.length === b.length && crypto.timingSafeEqual(a, b);
};

const authenticateAdmin = (req, res, next) => {
  const expected = process.env.ADMIN_API_TOKEN;
  if (!expected) return res.status(503).json({ error: 'Admin API is not configured.' });
  const supplied = req.get('authorization')?.replace(/^Bearer\s+/i, '');
  if (!supplied || !equal(expected, supplied)) return res.status(401).json({ error: 'Admin authorization is required.' });
  return next();
};

module.exports = authenticateAdmin;
