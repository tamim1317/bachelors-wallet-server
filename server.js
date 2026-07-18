const express  = require('express');
const mongoose = require('mongoose');
const cors     = require('cors');
const helmet   = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const xss      = require('xss-clean');
const http     = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

const app    = express();
const server = http.createServer(app);
const io     = new Server(server, {
  cors: {
    origin:  process.env.CLIENT_URL || '*',
    methods: ['GET', 'POST']
  }
});

// ── Security Middleware ──────────────────────────────────────
// 1. Helmet — HTTP security headers
app.use(helmet({
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: false,
}));

// 2. CORS — শুধু allowed origins থেকে request
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173',
  process.env.CLIENT_URL,
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('CORS policy violation'));
    }
  },
  credentials: true,
}));

// 3. Body parser
app.use(express.json({ limit: '10kb' })); // 10kb limit — large body attack থেকে রক্ষা

// 4. NoSQL injection protection
app.use(mongoSanitize());

// 5. XSS protection
app.use(xss());

// ── Rate Limiting ────────────────────────────────────────────
// General API rate limit
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max:      100,             // 100 requests per window
  message:  { success: false, message: 'অনেক বেশি request! ১৫ মিনিট পর আবার চেষ্টা করুন।' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Auth endpoints এ strict rate limit
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max:      10,              // শুধু 10 login attempt
  message:  { success: false, message: 'অনেক বেশি login attempt! ১৫ মিনিট পর আবার চেষ্টা করুন।' },
  skipSuccessfulRequests: true,
});

// Apply rate limits
app.use('/api/', apiLimiter);
app.use('/api/auth/login',    authLimiter);
app.use('/api/auth/register', authLimiter);

// ── Routes ──────────────────────────────────────────────────
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
app.use('/api/invite',     require('./routes/inviteRoutes'));
app.use('/api/insights',   require('./routes/insightsRoutes'));

// ── Health check ─────────────────────────────────────────────
app.get('/', (req, res) => res.json({
  message: '🎓 Bachelor Wallet API Running!',
  version: '2.0',
  status:  'healthy'
}));

// ── Global Error Handler ─────────────────────────────────────
app.use((err, req, res, next) => {
  // CORS error
  if (err.message === 'CORS policy violation') {
    return res.status(403).json({ success: false, message: 'Not allowed by CORS' });
  }
  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map(e => e.message);
    return res.status(400).json({ success: false, message: messages[0] });
  }
  // JWT error
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ success: false, message: 'Invalid token' });
  }
  // Default
  console.error('Server error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: process.env.NODE_ENV === 'production'
      ? 'Server error হয়েছে'
      : err.message
  });
});

// ── 404 Handler ──────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route পাওয়া যায়নি' });
});

// ── Socket.io ────────────────────────────────────────────────
global.io = io;
const onlineUsers = new Map();

io.on('connection', (socket) => {
  socket.on('user:join', (userData) => {
    onlineUsers.set(socket.id, userData);
    io.emit('users:online', Array.from(onlineUsers.values()));
    socket.broadcast.emit('chat:system', {
      content:   `${userData.name} online হয়েছে`,
      type:      'system',
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
        content:   `${user.name} offline হয়েছে`,
        type:      'system',
        createdAt: new Date()
      });
    }
  });
});

// ── MongoDB + Server Start ───────────────────────────────────
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('✅ MongoDB connected');
    server.listen(process.env.PORT || 5000, () => {
      console.log(`🚀 Server running on port ${process.env.PORT || 5000}`);
      console.log(`🛡️  Security: Helmet, CORS, Rate Limit, XSS, NoSQL Injection protection active`);
    });
  })
  .catch(err => console.error('❌ MongoDB error:', err));