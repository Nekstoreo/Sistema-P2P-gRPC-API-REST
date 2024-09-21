const fs = require('fs').promises; // Promisified fs for async/await
const path = require('path');
const config = require('../../config.json');

// List files in the peer's directory (asynchronously)
exports.listFiles = async (req, res) => {
  try {
    const directory = config.peer.directory;
    const files = await fs.readdir(directory);  // Non-blocking file reading
    const fileList = files.map(file => ({
      filename: file,
      uri: `http://${config.peer.ip}:${config.peer.port}/files/${file}`
    }));
    res.json({ files: fileList });
  } catch (err) {
    res.status(500).json({ message: 'Error reading directory', error: err.message });
  }
};

