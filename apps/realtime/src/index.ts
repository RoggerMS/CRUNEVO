import { createServer } from 'http';
import { Server } from 'socket.io';

const httpServer = createServer();
const io = new Server(httpServer, { cors: { origin: '*' } });

io.on('connection', (socket) => {
  socket.emit('hello', 'realtime');
});

httpServer.listen(4001, () => {
  console.log('Realtime server running on 4001');
});
