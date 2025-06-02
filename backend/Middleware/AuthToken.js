/*******************************************************
 * JWT middleware  +  helper
 * -----------------------------------------------------
 *   • authenticateToken → classic Express middleware
 *   • verifyToken       → plain helper you can `import`
 *                         from anywhere (sockets, tests…)
 ******************************************************/
const jwt = require('jsonwebtoken');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET;

/* -------- simple helper, no Express objects -------- */
function verifyToken(token = '') {
  if (!token) throw new Error('No token provided');
  return jwt.verify(token, JWT_SECRET); // throws if invalid / expired
}

/* -------------- Express/Router middleware ---------- */
function authenticateToken(req, res, next) {
  const authHeader = req.headers.authorization || ''; // "Bearer …"
  const token = authHeader.split(' ')[1];             // grab 2nd part

  try {
    const payload = verifyToken(token); // reuse helper
    req.user = payload;                 // attach to request
    return next();
  } catch (err) {
    console.error('JWT verification failed:', err.message);
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
}

module.exports = authenticateToken;
/* optional named export so `require(...).verifyToken` works */
module.exports.verifyToken = verifyToken;
