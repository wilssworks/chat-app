const chatForm = document.getElementById('chat-form');
const chatMsgs = document.querySelector('.chat-msgs');
const roomName = document.getElementById('room-name');
const userList = document.getElementById('users-list');
const userView = document.getElementById('view-users-group');

// get username and room from URL
const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true
});

const socket = io();

// join chatroom
socket.emit('joinRoom', { username, room });

// get room and users
socket.on('roomUsers', ({ room, users }) => {
  outputRoomName(room);
  outputUsers(users);
});

// message from server
socket.on('message', (message) => {
  outputMessage(message);
  chatMsgs.scrollTop = chatMsgs.scrollHeight; // scroll to bottom message
});

// message submit
chatForm.addEventListener('submit', (e) => {
  e.preventDefault(); // stops from creating submit as a file

  // get message text
  let msg = e.target.elements.msg.value;

  msg = msg.trim();

  if (!msg) {
    return false;
  }

  // emit the message
  socket.emit('chatMessage', msg);
  // clear and focus back on input
  e.target.elements.msg.value = '';
  e.target.elements.msg.focus();
});

// output message
function outputMessage(message) {
  const div = document.createElement('div');
  const p = document.createElement('p');
  p.classList.add('meta');
  p.innerText = message.username;
  div.appendChild(p);
  div.classList.add('message');
  const para = document.createElement('p');
  para.classList.add('text');
  para.innerText = message.text;
  div.appendChild(para);
  document.querySelector('.chat-msgs').appendChild(div);
}

// add room name
function outputRoomName(room) {
  roomName.innerText = room;
}

// add users
function outputUsers(users) {
  userList.innerHTML = '';
  users.forEach((user) => {
    const li = document.createElement('li');
    li.innerText = user.username;
    userList.appendChild(li);
  });
}

// user drop down
userView.addEventListener("click", function(){ 
  userView.classList.toggle("show");
});

// leave chat room
document.getElementById('leave-btn').addEventListener('click', () => {
  window.location = '../index.html';
});