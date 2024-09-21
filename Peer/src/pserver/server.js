// src/Server.js
const express = require('express');
const bodyParser = require('body-parser');
const auth = require('./services/authService');
const files = require('./services/filesService');
const grpcService = require('./services/grpcService');
const config = require('../config.json');

class Server {
  constructor() {
    this.app = express();
    this.app.use(bodyParser.json());
    this.setupRoutes();
  }

  setupRoutes() {
    this.app.get('/api/files', auth.verifyToken, files.listFiles);
    this.app.post('/api/login', (req, res) => auth.login(req, res));
    this.app.post('/api/logout', auth.verifyToken, (req, res) => auth.logout(req, res));
  }

  start() {
    grpcService.startGrpcServer();
    this.app.listen(config.peer.server_port, () => {
      console.log(`PeerServer running on port ${config.peer.server_port}`);
    });
  }
}

module.exports = Server;