const express  = require('express');
const mongoose = require('mongoose');
const cors     = require('cors');
const http     = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

const app    = express();
const server = http.createServer(app);
const io     = new Server(server, {
  cors: { origin: '*', methods: ['GET', 'POST'] }
});

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth',       require('./routes/authRoutes'));
app.use('/api/members',    require('./routes/memberRoutes'));
app.use('/api/meals',      require('./routes/mealRoutes'));
app.use('/api/expenses',   require('./routes/expenseRoutes'));
app.use('/api/bills',      require('./routes/billRoutes'));
app.use('/api/income',     require('./routes/incomeRoutes'));
app.use('/api/settlement', require('./routes/settlementRoutes'));
app.use('/api/budget',     require('./routes/budgetRoutes'));
app.use('/api/notices',    require('./routes/noticeRoutes'));
app.use('/api/rooms',      require('./routes/roomRoutes'));
app.use('/api/mess',       require('./routes/messRoutes'));
app.use('/api/prediction', require('./routes/predictionRoutes'));
app.use('/api/settings',   require('./routes/settingsRoutes'));
app.use('/api/chat',       require('./routes/chatRoutes'));

app.get('/', (req, res) => res.json({ message: '🎓 Bachelor Wallet API Running!' }));

// Socket.io — Real-time Chat
const onlineUsers = new Map();

io.on('connection', (socket) => {
  console.log('🔌 User connected:', socket.id);

  // User online হলে
  socket.on('user:join', (userData) => {
    onlineUsers.set(socket.id, userData);
    io.emit('users:online', Array.from(onlineUsers.values()));
    socket.broadcast.emit('chat:system', {
      content: `${userData.name} online হয়েছে`,
      type: 'system',
      createdAt: new Date()
    });
  });

  // New message
  socket.on('chat:message', (message) => {
    io.emit('chat:message', message);
  });

  // Typing indicator
  socket.on('chat:typing', (data) => {
    socket.broadcast.emit('chat:typing', data);
  });

  // Disconnect
  socket.on('disconnect', () => {
    const user = onlineUsers.get(socket.id);
    if (user) {
      onlineUsers.delete(socket.id);
      io.emit('users:online', Array.from(onlineUsers.values()));
      socket.broadcast.emit('chat:system', {
        content: `${user.name} offline হয়েছে`,
        type: 'system',
        createdAt: new Date()
      });
    }
  });
});

// MongoDB connect
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('✅ MongoDB connected');
    server.listen(process.env.PORT || 5000, () => {
      console.log(`🚀 Server running on port ${process.env.PORT || 5000}`);
    });
  })
  .catch(err => console.error('❌ MongoDB error:', err));

  // Global io access
global.io = io;

io.on('connection', (socket) => {
  console.log('🔌 Connected:', socket.id);

  socket.on('user:join', (userData) => {
    onlineUsers.set(socket.id, userData);
    io.emit('users:online', Array.from(onlineUsers.values()));
    socket.broadcast.emit('chat:system', {
      content: `${userData.name} online হয়েছে`,
      type: 'system',
      createdAt: new Date()
    });
  });

  socket.on('chat:message', (message) => {
    io.emit('chat:message', message);
  });

  socket.on('chat:typing', (data) => {
    socket.broadcast.emit('chat:typing', data);
  });

  socket.on('disconnect', () => {
    const user = onlineUsers.get(socket.id);
    if (user) {
      onlineUsers.delete(socket.id);
      io.emit('users:online', Array.from(onlineUsers.values()));
      socket.broadcast.emit('chat:system', {
        content: `${user.name} offline হয়েছে`,
        type: 'system',
        createdAt: new Date()
      });
    }
  });
});