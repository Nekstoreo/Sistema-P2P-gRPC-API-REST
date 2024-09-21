const express = require('express');
const bodyParser = require('body-parser');
const loginService = require('./services/loginService');
const searchService = require('./services/searchService');
const grpcService = require('./services/grpcService');
const axios = require('axios');
const config = require('../config.json');

const app = express();
app.use(bodyParser.json());

let token = '';  // Store the JWT token after login

// Register the peer with the Directory Server
async function registerPeer() {
  try {
    const files = await getFilesInDirectory();  // Get files in the local directory
    const response = await axios.post(`http://${config.directory_server.ip}:${config.directory_server.port}/api/register`, {
      peerId: config.peer.client_id,
      ip: config.peer.ip,
      port: config.peer.client_port,
      files
    });
    console.log('Peer registered:', response.data);
  } catch (err) {
    console.error('Peer registration failed:', err.message);
  }
}

// Get files in the local directory
async function getFilesInDirectory() {
  const fs = require('fs').promises;
  try {
    const files = await fs.readdir(config.peer.directory);
    return files;
  } catch (err) {
    console.error('Error reading directory:', err.message);
    return [];
  }
}

// API for user login (User-facing)
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const loginResponse = await loginService.login(username, password);
    if (loginResponse.token) {
      token = loginResponse.token;
      res.json({ message: 'Login successful', token });
    } else {
      res.status(401).json({ message: 'Login failed' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// API for user logout (User-facing)
app.post('/api/logout', async (req, res) => {
  try {
    await loginService.logout(token);
    token = '';
    res.json({ message: 'Logout successful' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// API for searching files (User-facing)
app.post('/api/search', async (req, res) => {
  const { filename } = req.body;
  if (!token) {
    return res.status(401).json({ message: 'Unauthorized. Please log in first.' });
  }
  try {
    const peersWithFile = await searchService.searchFile(filename, token);
    if (peersWithFile.length > 0) {
      res.json({ message: 'File found on peers', peers: peersWithFile });
    } else {
      res.json({ message: 'File not found on any peer' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// API to download a file from another peer (User-facing)
app.post('/api/download', async (req, res) => {
  const { filename, peerIp } = req.body;
  if (!token) {
    return res.status(401).json({ message: 'Unauthorized. Please log in first.' });
  }
  grpcService.downloadFile(filename, peerIp, (err, message) => {
    if (err) {
      res.status(500).json({ error: 'Download failed', details: err.message });
    } else {
      res.json({ message: message });
    }
  });
});

// API to upload a file to another peer (User-facing)
app.post('/api/upload', async (req, res) => {
  const { filename, peerIp } = req.body;
  if (!token) {
    return res.status(401).json({ message: 'Unauthorized. Please log in first.' });
  }
  grpcService.uploadFile(filename, peerIp, (err, message) => {
    if (err) {
      res.status(500).json({ error: 'Upload failed', details: err.message });
    } else {
      res.json({ message: message });
    }
  });
});

// Start the PeerClient and Express API
app.listen(config.peer.client_port, async () => {
  await registerPeer();  // Register this peer with the Directory Server
  console.log(`PeerClient running on port ${config.peer.client_port}`);
});
