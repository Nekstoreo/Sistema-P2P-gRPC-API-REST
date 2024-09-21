// src/Client.js
const express = require('express');
const bodyParser = require('body-parser');
const loginService = require('./services/loginService');
const searchService = require('./services/searchService');
const grpcService = require('./services/grpcService');
const axios = require('axios');
const config = require('../config.json');

class Client {
  constructor() {
    this.app = express();
    this.token = '';
    this.app.use(bodyParser.json());
    this.setupRoutes();
  }

  setupRoutes() {
    this.app.post('/api/login', this.login.bind(this));
    this.app.post('/api/logout', this.logout.bind(this));
    this.app.post('/api/search', this.search.bind(this));
    this.app.post('/api/download', this.download.bind(this));
    this.app.post('/api/upload', this.upload.bind(this));
  }

  async registerPeer() {
    try {
      const files = await this.getFilesInDirectory();
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

  async getFilesInDirectory() {
    const fs = require('fs').promises;
    try {
      const files = await fs.readdir(config.peer.directory);
      return files;
    } catch (err) {
      console.error('Error reading directory:', err.message);
      return [];
    }
  }

  async login(req, res) {
    const { username, password } = req.body;
    try {
      const loginResponse = await loginService.login(username, password);
      if (loginResponse.token) {
        this.token = loginResponse.token;
        res.json({ message: 'Login successful', token: this.token });
      } else {
        res.status(401).json({ message: 'Login failed' });
      }
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  async logout(req, res) {
    try {
      await loginService.logout(this.token);
      this.token = '';
      res.json({ message: 'Logout successful' });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  async search(req, res) {
    const { filename } = req.body;
    if (!this.token) {
      return res.status(401).json({ message: 'Unauthorized. Please log in first.' });
    }
    try {
      const peersWithFile = await searchService.searchFile(filename, this.token);
      if (peersWithFile.length > 0) {
        res.json({ message: 'File found on peers', peers: peersWithFile });
      } else {
        res.json({ message: 'File not found on any peer' });
      }
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  download(req, res) {
    const { filename, peerIp } = req.body;
    if (!this.token) {
      return res.status(401).json({ message: 'Unauthorized. Please log in first.' });
    }
    grpcService.downloadFile(filename, peerIp, (err, message) => {
      if (err) {
        res.status(500).json({ error: 'Download failed', details: err.message });
      } else {
        res.json({ message: message });
      }
    });
  }

  upload(req, res) {
    const { filename, peerIp } = req.body;
    if (!this.token) {
      return res.status(401).json({ message: 'Unauthorized. Please log in first.' });
    }
    grpcService.uploadFile(filename, peerIp, (err, message) => {
      if (err) {
        res.status(500).json({ error: 'Upload failed', details: err.message });
      } else {
        res.json({ message: message });
      }
    });
  }

  start() {
    this.app.listen(config.peer.client_port, async () => {
      await this.registerPeer();
      console.log(`PeerClient running on port ${config.peer.client_port}`);
    });
  }
}

module.exports = Client;