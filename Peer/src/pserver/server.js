const express = require('express');
const bodyParser = require('body-parser');
const auth = require('./services/authService');
const files = require('./services/filesService');
const grpcService = require('./services/grpcService');
const app = express();
const config = require('../config.json');

app.use(bodyParser.json());

// Expose file listing via REST API (local to PeerServer)
app.get('/api/files', auth.verifyToken, files.listFiles);

// Login API for PeerServer, using Endpoi
app.post('/api/login', (req, res) => {
  auth.login(req, res);
});

// Logout API for PeerServer
app.post('/api/logout', auth.verifyToken, (req, res) => {
  auth.logout(req, res);
});


// Start the gRPC server for file transfers
grpcService.startGrpcServer();

// Start the REST API for PeerServer
const PORT = config.peer.server_port;
app.listen(PORT, () => {
  console.log(`PeerServer running on port ${PORT}`);
});
