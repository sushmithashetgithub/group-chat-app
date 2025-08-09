// chat.js
// Assumes Socket.IO server at http://localhost:3000
// If you use a different host/port, change the URL below.

const socket = io('http://localhost:3000'); // connect to socket server
const messagesEl = document.getElementById('messages');
const usersListEl = document.getElementById('usersList');
const messageForm = document.getElementById('messageForm');
const messageInput = document.getElementById('messageInput');

// Determine username: prefer value stored by your login flow (localStorage.username), otherwise ask
let username = localStorage.getItem('username');
if (!username) {
  username = prompt('Enter a display name for chat (will be used in this tab):');
  if (!username) username = 'Anonymous';
  localStorage.setItem('username', username);
}

// When connected, inform the server who joined
socket.on('connect', () => {
  socket.emit('join', { name: username });
  addSystemMessage('You joined');
});

// Helper: append system messages (join/leave)
function addSystemMessage(text) {
  const div = document.createElement('div');
  div.className = 'system';
  div.innerText = text;
  messagesEl.appendChild(div);
  messagesEl.scrollTop = messagesEl.scrollHeight;
}

// Helper: append normal chat message
function addChatMessage({ from, text, self }) {
  const wrapper = document.createElement('div');
  wrapper.className = 'message' + (self ? ' me' : '');
  const meta = document.createElement('div');
  meta.className = 'meta';
  meta.innerText = self ? `You` : `${from}`;
  const body = document.createElement('div');
  body.className = 'body';
  body.innerText = text;
  wrapper.appendChild(meta);
  wrapper.appendChild(body);
  messagesEl.appendChild(wrapper);
  messagesEl.scrollTop = messagesEl.scrollHeight;
}

// Receive message broadcast from server
socket.on('chat-message', (payload) => {
  // payload: { from, text, id }
  const self = payload.from === username;
  addChatMessage({ from: payload.from, text: payload.text, self });
});

// Receive system notifications from server
socket.on('user-joined', (payload) => {
  addSystemMessage(`${payload.name} joined`);
});

// Receive updated online-user list
socket.on('users', (users) => {
  usersListEl.innerHTML = '';
  // expect users = [{ id, name }, ...]
  users.forEach(u => {
    const li = document.createElement('li');
    li.innerText = u.name + (u.name === username ? ' (You)' : '');
    usersListEl.appendChild(li);
  });
});

// When a user leaves
socket.on('user-left', (payload) => {
  addSystemMessage(`${payload.name} left`);
});

// Send message handler
messageForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const text = messageInput.value.trim();
  if (!text) return;
  // Emit message to server
  socket.emit('send-message', { text });
  // Optionally add to UI immediately
  addChatMessage({ from: username, text, self: true });
  messageInput.value = '';
});
