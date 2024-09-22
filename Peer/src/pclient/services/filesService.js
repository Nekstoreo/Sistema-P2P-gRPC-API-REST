const fs = require('fs').promises; // Promisified fs for async/await
const dotenv = require('dotenv');

// Load the environment variables
dotenv.config();

const peer_directory = process.env.PEER_DIRECTORY || 'shared';

// List files in the peer's directory (asynchronously)
exports.listFiles = async () => {
  try {
    const files = await fs.readdir(peer_directory);
    return { files };
  } catch (err) {
    console.error('Error reading directory:', err);
    return { files: [] };
  }
};

