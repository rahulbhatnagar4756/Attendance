const mongoose = require('mongoose');
const http = require('http');
const app = require('./app');
const config = require('./config/config');
const logger = require('./config/logger');
const { initializeSockets } = require('./sockets/sockets');

const server = http.createServer(app);

let newServer;
mongoose.connect(config.mongoose.url, config.mongoose.options).then(() => {
  logger.info('Connected to MongoDB');
  newServer = server.listen(config.port, () => {
    logger.info(`Listening to port ${config.port}`);
  });
});

//-----socket connection----------
initializeSockets(server);
//------------------------------

const exitHandler = () => {
  if (newServer) {
    newServer.close(() => {
      logger.info('Server closed');
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
};

const unexpectedErrorHandler = (error) => {
  logger.error(error);
  exitHandler();
};

process.on('uncaughtException', unexpectedErrorHandler);
process.on('unhandledRejection', unexpectedErrorHandler);

process.on('SIGTERM', () => {
  logger.info('SIGTERM received');
  if (newServer) {
    newServer.close();
  }
});
