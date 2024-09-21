const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const fs = require('fs');
const path = require('path');
const config = require('../../config.json');

// Load the gRPC protocol
const PROTO_PATH = path.join(__dirname, '../../proto/file.proto');
const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true
});
const fileProto = grpc.loadPackageDefinition(packageDefinition).fileServicePackage;

// Debugging: Log the fileProto to check if it's properly loaded
//console.log('fileProto:', fileProto);  // Should log the fileServicePackage object

if (!fileProto || !fileProto.FileService) {
  console.error('Failed to load gRPC service from proto file');
  process.exit(1);
}

// Upload a file to another peer
function uploadFile(filename, targetPeerIp, callback) {
  const client = new fileProto.FileService(`${targetPeerIp}:${config.peer.grpc_port}`, grpc.credentials.createInsecure());

  client.UploadFile({ filename }, (err, response) => {
    if (err) return callback(err);
    console.log('File upload response:', response.message);
    callback(null, response.message);
  });
}

// Download a file from another peer
function downloadFile(filename, targetPeerIp, callback) {
  const client = new fileProto.FileService(`${targetPeerIp}:${config.peer.grpc_port}`, grpc.credentials.createInsecure());

  client.DownloadFile({ filename }, (err, response) => {
    if (err) return callback(err);

    const filePath = path.join(config.peer.directory, filename);
    fs.writeFile(filePath, response.data, (writeErr) => {
      if (writeErr) return callback(writeErr);
      console.log(`File ${filename} downloaded successfully to ${filePath}`);
      callback(null, `File ${filename} downloaded successfully`);
    });
  });
}

module.exports = { uploadFile, downloadFile };
