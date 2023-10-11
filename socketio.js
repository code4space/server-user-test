const Server = require('socket.io').Server;

function initializeSocketIO(httpServer) {
  const io = new Server(httpServer, {
    cors: {
      origin: '*',
    },
  });

  io.on('connection', (socket) => {
    socket.on('notification', (data) => {
      io.emit('notification', { message: data.message });
    });
  });

  return io
}


module.exports = initializeSocketIO