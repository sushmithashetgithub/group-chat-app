// chat.js
const socket = io('http://localhost:3000', {
  auth: { token: localStorage.getItem('token') }
});

const messagesEl = document.getElementById('messages');
const usersListEl = document.getElementById('usersList');
const messageForm = document.getElementById('messageForm');
const messageInput = document.getElementById('messageInput');

let username = localStorage.getItem('name');

if (!username) {
  username = prompt('Enter a display name for chat:') || 'Anonymous';
  localStorage.setItem('name', username);
}

socket.on('connect', () => {
  socket.emit('join');
  addSystemMessage('You joined');
});

function addSystemMessage(text) {
  const div = document.createElement('div');
  div.className = 'system';
  div.innerText = text;
  messagesEl.appendChild(div);
  messagesEl.scrollTop = messagesEl.scrollHeight;
}

function addChatMessage({ from, text, self, time }) {
  const wrapper = document.createElement('div');
  wrapper.className = 'message' + (self ? ' me' : '');
  
  const meta = document.createElement('div');
  meta.className = 'meta';
  meta.innerText = `${self ? 'You' : from} — ${new Date(time).toLocaleTimeString()}`;
  
  const body = document.createElement('div');
  body.className = 'body';
  body.innerText = text;
  
  wrapper.appendChild(meta);
  wrapper.appendChild(body);
  messagesEl.appendChild(wrapper);
  messagesEl.scrollTop = messagesEl.scrollHeight;
}

socket.on('chat-message', (payload) => {
  const self = payload.from === username;
  addChatMessage({
    from: payload.from,
    text: payload.text,
    self,
    time: payload.createdAt
  });
});

socket.on('user-joined', (payload) => {
  addSystemMessage(`${payload.name} joined`);
});

socket.on('users', (users) => {
  usersListEl.innerHTML = '';
  users.forEach(u => {
    const li = document.createElement('li');
    li.innerText = u.name + (u.name === username ? ' (You)' : '');
    usersListEl.appendChild(li);
  });
});

socket.on('user-left', (payload) => {
  addSystemMessage(`${payload.name} left`);
});

messageForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const text = messageInput.value.trim();
  if (!text) return;
  socket.emit('send-message', { text });
  messageInput.value = '';
});

// Load chat history
async function loadHistory() {
  try {
    const res = await fetch('http://localhost:3000/messages/recent', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    const history = await res.json();
    history.forEach(m => {
      addChatMessage({
        from: m.from,
        text: m.text,
        self: m.from === username,
        time: m.createdAt
      });
    });
  } catch (err) {
    console.error('Error loading history:', err);
  }
}

loadHistory();
