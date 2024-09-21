// src/peer.js
const Client = require('./client/client.js');
const Server = require('./server/server.js');

const client = new Client();
const server = new Server();

client.start();
server.start();