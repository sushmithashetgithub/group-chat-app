const express = require('express');
require('dotenv').config();
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

const auth = require('./middleware/auth');
const userRoutes = require('./routes/userRoutes');
const messageRoutes = require('./routes/messageRoutes');

const sequelize = require('./config/database');
const Message = require('./models/messageModel');
const User = require('./models/userModel');
const jwt = require('jsonwebtoken');

const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);

// ====== MIDDLEWARE ======
app.use(bodyParser.json());
app.use(cors({
  origin: 'http://localhost:5500',
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.static(path.join(__dirname, '../frontend')));
app.use(express.json());

// ====== ROUTES ======
app.use('/user', userRoutes);
app.use('/messages', messageRoutes);

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/signup.html'));
});

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/login.html'));
});

// ====== SOCKET.IO ======
const io = new Server(server, { cors: { origin: '*' } });
const online = new Map();

io.on('connection', async (socket) => {
  try {
    // Token validation
    const token = socket.handshake.auth?.token;
    if (!token) {
      console.log('No token provided');
      socket.disconnect();
      return;
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const dbUser = await User.findByPk(decoded.id);

    if (!dbUser) {
      console.log('User not found');
      socket.disconnect();
      return;
    }

    // Store user
    online.set(socket.id, {
      socketId: socket.id,
      userId: dbUser.id,
      name: dbUser.name
    });

    io.emit('users', Array.from(online.values()));
    socket.broadcast.emit('user-joined', { name: dbUser.name });
    console.log(`${dbUser.name} connected`);

    // Handle message sending
    socket.on('send-message', async ({ text }) => {
      try {
        if (!text || !text.trim()) return;

        const current = online.get(socket.id);
        if (!current) return;

        const saved = await Message.create({
          userId: current.userId,
          text
        });

        io.emit('chat-message', {
          id: saved.id,
          from: current.name, // FIXED: Correct variable
          text: saved.text,
          createdAt: saved.createdAt
        });
      } catch (err) {
        console.error('Error saving message:', err);
      }
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      const user = online.get(socket.id);
      if (user) {
        online.delete(socket.id);
        io.emit('users', Array.from(online.values()));
        socket.broadcast.emit('user-left', { name: user.name });
      }
    });

  } catch (err) {
    console.error('Socket connection error:', err);
    socket.disconnect();
  }
});

// ====== START SERVER ======
sequelize.sync()
  .then(() => {
    console.log('Database connected');
    server.listen(3000, () => console.log('Server running on http://localhost:3000'));
  })
  .catch((err) => console.error('Database connection failed:', err));
