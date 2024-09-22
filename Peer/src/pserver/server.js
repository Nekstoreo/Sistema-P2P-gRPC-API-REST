const grpcService = require('./services/grpcService');

class Server {
  
  constructor() {
    this.grpcService = grpcService;
  }

  start() {
    this.grpcService.startGrpcServer();
    console.log('gRPC server started');
  }
}

module.exports = Server;