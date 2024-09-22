const jwt = require('jsonwebtoken');
const SECRET_KEY = 'supersecretkey';

// Mock users (In production, this would come from a database)
const users = {
  "user": "password"
};

// Active sessions (in-memory)
const sessions = {};

// Login endpoint (for PeerClient)
exports.login = (username, password) => {
  if (users[username] && users[username] === password) {
    const token = jwt.sign({ peerId: username }, SECRET_KEY, { expiresIn: '1h' });
    sessions[username] = token;
    return token;
  } else {
    throw new Error('Invalid username or password');
  }
};

// Logout endpoint (for PeerClient)
exports.logout = (token) => {
  const decoded = jwt.decode(token);
  delete sessions[decoded.peerId];
};

// Middleware to verify JWT
exports.verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  jwt.verify(token, SECRET_KEY, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    req.peerId = decoded.peerId;
    next();
  });
};
