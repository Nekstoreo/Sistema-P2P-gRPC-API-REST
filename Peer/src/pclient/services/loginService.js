const axios = require('axios');
const config = require('../../config.json');

// Login to the PeerServer using username and password
async function login(username, password) {
  try {
    const response = await axios.post(`http://${config.peer.ip}:${config.peer.server_port}/api/login`, {
      username,
      password
    });
    return response.data;  // Return the token
  } catch (err) {
    console.error('Login failed en loginservice:', err.response?.data || err.message);
    throw err;
  }
}

// Logout from the PeerServer using the token
async function logout(token) {
  try {
    const response = await axios.post(`http://${config.peer.ip}:${config.peer.server_port}/api/logout`, null, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    console.log('Logout successful:', response.data);
  } catch (err) {
    console.error('Logout failed:', err.response?.data || err.message);
  }
}

module.exports = { login, logout };
