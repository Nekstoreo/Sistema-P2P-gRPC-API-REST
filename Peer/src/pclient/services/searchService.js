const axios = require('axios');
const dotenv = require('dotenv');

// Load the environment variables
dotenv.config();

const directory_server_ip = process.env.DIRECTORY_SERVER_IP || 'localhost';
const directory_server_port = process.env.DIRECTORY_SERVER_PORT || 5000;

// Search for a file across peers on directory server
async function searchFile(filename) {
  try {
    const response = await axios.get(`http://${directory_server_ip}:${directory_server_port}/api/search`, {
      params: { filename }
    });
    console.log('Search results:', response.data);
    return response.data.peers;  // Return peers that have the file
  } catch (err) {
    console.error('Search failed:', err.response?.data || err.message);
    throw err;
  }
}

async function getPeerFiles(peerIp) {
  if (!peerIp) {
    throw new Error('Peer IP is required');
  }
  try {
    const response = await axios.get(`http://${directory_server_ip}:${directory_server_port}/api/files`, {
      params: { peerIp }
    });
    console.log('Peer files:', response.data);
    return response.data.files;
  } catch (err) {
    console.error('Error fetching peer files:', err.response?.data || err.message);
    throw err;
  }
}



module.exports = { searchFile, getPeerFiles };
