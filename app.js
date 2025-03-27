require('dotenv').config();
const express = require('express');
const http = require('http');
const path = require('path');
const socketIO = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIO(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  },
  pingTimeout: 60000,
  pingInterval: 25000
});

app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');


const connectedUsers = new Map();

io.on('connection', (socket) => {
  
  connectedUsers.set(socket.id, Date.now());
  
  socket.on('location', ({lat, lon}) => {
    if (typeof lat === 'number' && typeof lon === 'number') {
      io.emit('recieve-location', {id: socket.id, lat, lon});
    }
  });

  socket.on('disconnect', () => {
    console.log('A user disconnected', socket.id);
    connectedUsers.delete(socket.id);
    io.emit('user-disconnect', socket.id);
  });
});

app.get('/', (req, res) => {
  res.render('index');
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port: ${PORT}`);
});


process.on('SIGTERM', () => {
  server.close(() => {
    console.log('Server terminated');
    process.exit(0);
  });
});
