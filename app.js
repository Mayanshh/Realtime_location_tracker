const express = require('express');
const http = require('http');
const path = require('path');
const socketIO = require('socket.io');
const app = express();

const server = http.createServer(app);
const io = socketIO(server);

app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');

io.on('connection', (socket) => {
  console.log('A user connected',socket.id);
  
  socket.on('location', ({lat,lon}) => {
    io.emit('recieve-location', {id:socket.id,lat,lon})
  });

  socket.on(('user-disconnect'), () => {
    console.log('A user disconnected',socket.id);
  });
});

app.get('/', (req, res) => {
  res.render('index');
});

server.listen(3000, () => {
  console.log('listening on port:3000');
})