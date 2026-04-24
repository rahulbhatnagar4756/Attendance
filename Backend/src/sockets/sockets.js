const { Server } = require('socket.io');
const logger = require('../config/logger');

exports.initializeSockets = (server) => {
  const io = new Server(server, { cors: '*' });
  const { handleTimeActions } = require('./socket.action')(io);
  logger.info('Sockets are Connected');


  const onConnection = (socket) => {
    socket.on('checkIn', handleTimeActions);
    // socket.on("order:read", readOrder);

    // socket.on("user:update-password", updatePassword);
  };

  io.on('connection', onConnection);
};
