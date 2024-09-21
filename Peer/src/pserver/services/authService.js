const jwt = require('jsonwebtoken');
const SECRET_KEY = 'supersecretkey';

// Mock users (In production, this would come from a database)
const users = {
  "user": "password"
};

// Active sessions (in-memory)
const sessions = {};

// Login endpoint (for PeerClient)
exports.login = (req, res) => {
  const { username, password } = req.body;
  if (users[username] && users[username] === password) {
    const token = jwt.sign({ peerId: username }, SECRET_KEY, { expiresIn: '1h' });
    sessions[username] = token;
    return res.json({ message: 'Login successful', peerId: username, token });
  } else {
    return res.status(401).json({ message: 'Invalid credentials' });
  }
};

// Logout endpoint (for PeerClient)
exports.logout = (req, res) => {
  const token = req.headers['authorization'].split(' ')[1];
  const decoded = jwt.verify(token, SECRET_KEY);
  delete sessions[decoded.peerId];
  return res.json({ message: 'Logout successful' });
};

// Middleware to verify JWT
exports.verifyToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.status(403).json({ message: 'Token is missing' });
  
  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    req.peerId = decoded.peerId;
    next();
  } catch (error) {
    return res.status(403).json({ message: 'Invalid token' });
  }
};
