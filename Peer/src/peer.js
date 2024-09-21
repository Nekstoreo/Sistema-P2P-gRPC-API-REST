// src/peer.js
const Client = require('./pclient/client')
const Server = require('./pserver/server')

const client = new Client();
const server = new Server();

client.start();
server.start();