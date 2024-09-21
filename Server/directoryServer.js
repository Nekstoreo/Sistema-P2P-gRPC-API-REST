const express = require('express');
const app = express();
app.use(express.json());

const peers = {};  // Store peer info { peerId: { ip, port, files } }

// Register a peer
app.post('/api/register', (req, res) => {
  const { peerId, ip, port, files } = req.body;
  peers[peerId] = { ip, port, files, lastActive: Date.now() };
  console.log(`Peer registered: ${peerId} at ${ip}:${port}`);
  res.json({ message: `Peer ${peerId} registered successfully.` });
});

// Search for a file across peers
app.get('/api/search', (req, res) => {
  const { filename } = req.query;
  const foundPeers = [];
  for (const peerId in peers) {
    if (peers[peerId].files.includes(filename)) {
      foundPeers.push({
        peerId,
        ip: peers[peerId].ip,
        port: peers[peerId].port
      });
    }
  }
  res.json({ peers: foundPeers });
});

// Start the Directory Server
const config = require('./config.json');
const PORT = config.port || 6000;
app.listen(PORT, () => {
  console.log(`Directory Server running on port ${PORT}`);
});
