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


// Upload a file to another peer
function uploadFile(call, callback) {
  const filename = call.request.filename;
  callback(null, { message: `File ${filename} uploaded successfully!`, data: Buffer.from('') });
}

// Download a file from another peer
function downloadFile(call, callback) {
  const filename = call.request.filename;
  const filePath = path.join(config.peer.directory, filename);
  fs.readFile(filePath, (err, data) => {
    if (err) {
      return callback(err, null);
    }
    callback(null, { message: `File ${filename} downloaded successfully!`, data: data });
  });
}

// Start the gRPC server
function startGrpcServer() {
  const server = new grpc.Server();
  server.addService(fileProto.FileService.service, { uploadFile, downloadFile });
  const port = `${config.peer.ip}:${config.peer.grpc_port}`;
  server.bindAsync(port, grpc.ServerCredentials.createInsecure(), () => {
    console.log(`gRPC server running on ${port}`);
  });
}

module.exports = { startGrpcServer };
