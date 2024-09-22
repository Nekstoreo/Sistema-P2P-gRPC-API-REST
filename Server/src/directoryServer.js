const express = require('express');
const app = express();
const dotenv = require('dotenv');

app.use(express.json());

const peers = {};  // Store peer info { peerId: { ip, port, files } }

// Register a peer
app.post('/api/register', (req, res) => {
  const { peerId, ip, port, files } = req.body;
  peers[peerId] = { ip, port, files, lastActive: Date.now() };
  console.log(`Peer registered: ${peerId} at ${ip}:${port}`);
  // Print files registered by the peer
  console.log(`Files registered by ${peerId}: ${files.join(', ')}`);
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

// Index files of a peer (with ip and port)
app.get('/api/files', (req, res) => {
  const { peerIp } = req.query;
  for (const peerId in peers) {
    if (peers[peerId].ip === peerIp) {
      res.json({ files: peers[peerId].files });
      return;
    }
  }
  res.status(404).json({ message: 'Peer not found' });
});


// Start the Directory Server
const PORT = process.env.PORT || 6000;
app.listen(PORT, () => {
  console.log(`Directory Server running on port ${PORT}`);
});
