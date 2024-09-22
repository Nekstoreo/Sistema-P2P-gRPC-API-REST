const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const loginService = require('./services/loginService');
const searchService = require('./services/searchService');
const grpcService = require('./services/grpcService');
const filesService = require('./services/filesService');
const dotenv = require('dotenv');

dotenv.config();

const peer_id = process.env.PEER_ID || 'peer1';
const peer_ip = process.env.PEER_IP || 'localhost';
const peer_directory = process.env.PEER_DIRECTORY || '/files';
const peer_port = process.env.PEER_PORT || 3000;
const directory_server_ip = process.env.DIRECTORY_SERVER_IP || 'localhost';
const directory_server_port = process.env.DIRECTORY_SERVER_PORT || 5000;

class Client {
  constructor() {
    this.app = express();
    this.app.use(bodyParser.json());
    this.setupRoutes();
  }

  setupRoutes() {
    this.app.post('/api/login', this.login.bind(this));
    this.app.post('/api/logout', this.logout.bind(this));
    this.app.post('/api/search', this.search.bind(this));
    this.app.post('/api/download', this.download.bind(this));
    this.app.post('/api/upload', this.upload.bind(this));
    this.app.post('/api/index', this.index.bind(this));
  }

  async registerPeer() {
    try {
      const files = await this.getFilesInDirectory();
      const response = await axios.post(`http://${directory_server_ip}:${directory_server_port}/api/register`, {
        peerId: peer_id,
        ip: peer_ip,
        port: peer_port,
        directory: peer_directory,
        files
      });
      console.log('Peer registered:', response.data);
    } catch (err) {
      console.error('Peer registration failed:', err.message);
    }
  }

  async getFilesInDirectory() {
    try {
      const response = await filesService.listFiles();
      return response.files;
    } catch (err) {
      console.error('Error fetching files from peer:', err.message);
      return [];
    }
  }

  async login(req, res) {
    const { username, password } = req.body;
    try {
      const token = await loginService.login(username, password);
      if (token) {
        res.json({ message: 'Login successful', token });
      } else {
        res.status(401).json({ message: 'Login failed' });
      }
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  async logout(req, res) {
    const token = req.headers.authorization?.split(' ')[1];
    if (token) {
      try {
        await loginService.logout(token);
        res.json({ message: 'Logout successful' });
      } catch (err) {
        res.status(500).json({ error: err.message });
      }
    } else {
      res.status(401).json({ message: 'Not logged in' });
    }
  }

  async search(req, res) {
    const token = req.headers.authorization?.split(' ')[1];
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
  }

  async index(req, res) {
    const token = req.headers.authorization?.split(' ')[1];
    const { peerIp } = req.body;
    if (!token) {
      return res.status(401).json({ message: 'Unauthorized. Please log in first.' });
    }
    if (!peerIp) {
      return res.status(400).json({ message: 'peerIp is required' });
    }
    try {
      const files = await searchService.getPeerFiles(peerIp, token);
      if (files) {
        res.json({ message: 'Files found on peer', files });
      } else {
        res.json({ message: 'No files found on peer' });
      }
    } catch (err) {
      res.status(500).json({ message: 'Error fetching files from peer: ', error: err.message });
    }
  }

  download(req, res) {
    const token = req.headers.authorization?.split(' ')[1];
    const { filename, peerIp } = req.body;
    if (!token) {
      return res.status(401).json({ message: 'Unauthorized. Please log in first.' });
    }
    grpcService.downloadFile(filename, peerIp, token, (err, message) => {
      if (err) {
        res.status(500).json({ error: 'Download failed', details: err.message });
      } else {
        res.json({ message: message });
      }
    });
  }

  upload(req, res) {
    const token = req.headers.authorization?.split(' ')[1];
    const { filename, peerIp } = req.body;
    if (!token) {
      return res.status(401).json({ message: 'Unauthorized. Please log in first.' });
    }
    grpcService.uploadFile(filename, peerIp, token, (err, message) => {
      if (err) {
        res.status(500).json({ error: 'Upload failed', details: err.message });
      } else {
        res.json({ message: message });
      }
    });
  }

  start() {
    this.app.listen(peer_port, async () => {
      await this.registerPeer();
      console.log(`PeerClient running on port ${peer_port}`);
    });
  }
}

module.exports = Client;