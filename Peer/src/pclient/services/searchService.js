const axios = require('axios');
const config = require('../../config.json');

// Search for a file across peers on directory server
async function searchFile(filename, token) {
  try {
    const response = await axios.get(`http://${config.directory_server.ip}:${config.directory_server.port}/api/search`, {
      params: { filename }
    });
    console.log('Search results:', response.data);
    return response.data.peers;  // Return peers that have the file
  } catch (err) {
    console.error('Search failed:', err.response?.data || err.message);
    throw err;
  }
}

module.exports = { searchFile };
