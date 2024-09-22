const authService = require('./authService');

// Login to the PeerServer using username and password
async function login(username, password) {
  if (!username || !password) {
    throw new Error('Username and password are required');
  }
  try {
    const token = await authService.login(username, password);
    return token;  // Return the token
  } catch (err) {
    console.error('Login failed in loginService:', err.message);
    throw err;
  }
}

// Logout from the PeerServer using the token
async function logout(token) {
  if (!token) {
    throw new Error('Token is required');
  }
  try {
    await authService.logout({ headers: { 'Authorization': `Bearer ${token}` } });
  } catch (err) {
    console.error('Logout failed:', err.message);
  }
}

module.exports = { login, logout };