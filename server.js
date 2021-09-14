const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const formatMessage = require('./utils/messages');

const {
  userJoin,
  getCurrentUser,
  userLeave,
  getRoomUsers
} = require('./utils/users');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

// connects to public folder
app.use(express.static('public'));

// runs when user enters room
io.on('connection', socket => {
  socket.on('joinRoom', ({ username, room }) => {

    const user = userJoin(socket.id, username, room);
    socket.join(user.room);

    // only seen by current user
    // socket.emit('message', formatMessage('', 'welcome ' + `${username}`));

    // seen by everyone expect current user
    // socket.broadcast.emit('message', formatMessage('', `${user.username}` + ' has joined the chat'));

    // seen by everyone
    socket.on('disconnect', () => {
      io.emit('message', formatMessage('', `${user.username}` + ' has left the chat'));
    });

    // gets users and room info
    io.to(user.room).emit('roomUsers', {room: user.room, users: getRoomUsers(user.room)});
  });

  // sends message to server
  socket.on('chatMessage', msg => {
    const user = getCurrentUser(socket.id);
    io.to(user.room).emit('message', formatMessage(user.username, msg));
  });
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => console.log('server running, port: ' + `${PORT}`));
