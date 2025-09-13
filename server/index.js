const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const path = require('path');
require('dotenv').config({ path: './config.env' });

const pool = require('./config/database');

// Import routes
const authRoutes = require('./routes/auth');
const contactsRoutes = require('./routes/contacts');
const chatsRoutes = require('./routes/chats');
const messagesRoutes = require('./routes/messages');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors({
  origin: "http://localhost:3000",
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/contacts', contactsRoutes);
app.use('/api/chats', chatsRoutes);
app.use('/api/messages', messagesRoutes);

// Socket.io connection handling
io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error('Authentication error'));
    }

    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    const result = await pool.query(
      'SELECT id, username, email, avatar_url, status FROM users WHERE id = $1',
      [decoded.userId]
    );

    if (result.rows.length === 0) {
      return next(new Error('User not found'));
    }

    socket.userId = decoded.userId;
    socket.user = result.rows[0];
    next();
  } catch (error) {
    next(new Error('Authentication error'));
  }
});

io.on('connection', async (socket) => {
  console.log(`User ${socket.user.username} connected`);

  // Update user status to online
  await pool.query(
    'UPDATE users SET status = $1 WHERE id = $2',
    ['online', socket.userId]
  );

  // Join user to their personal room
  socket.join(`user_${socket.userId}`);

  // Join all user's chats
  const userChats = await pool.query(
    'SELECT chat_id FROM chat_participants WHERE user_id = $1',
    [socket.userId]
  );

  userChats.rows.forEach(chat => {
    socket.join(`chat_${chat.chat_id}`);
  });

  // Handle sending messages
  socket.on('send_message', async (data) => {
    try {
      const { chatId, content, messageType = 'text' } = data;
      console.log(`User ${socket.user.username} sending message to chat ${chatId}:`, content);

      // Insert message into database
      const result = await pool.query(`
        INSERT INTO messages (chat_id, sender_id, content, message_type)
        VALUES ($1, $2, $3, $4)
        RETURNING id, created_at, updated_at
      `, [chatId, socket.userId, content, messageType]);

      const message = result.rows[0];

      // Update chat's updated_at timestamp
      await pool.query(
        'UPDATE chats SET updated_at = CURRENT_TIMESTAMP WHERE id = $1',
        [chatId]
      );

      // Get message with sender details
      const messageWithSender = await pool.query(`
        SELECT 
          m.id,
          m.content,
          m.message_type,
          m.file_url,
          m.created_at,
          m.updated_at,
          u.id as sender_id,
          u.username as sender_username,
          u.avatar_url as sender_avatar
        FROM messages m
        JOIN users u ON m.sender_id = u.id
        WHERE m.id = $1
      `, [message.id]);

      // Emit message to all participants in the chat
      console.log(`Emitting message to chat_${chatId} for participants`);
      io.to(`chat_${chatId}`).emit('new_message', {
        chatId,
        message: messageWithSender.rows[0]
      });

      // Emit message to sender for confirmation
      socket.emit('message_sent', {
        messageId: message.id,
        chatId,
        message: messageWithSender.rows[0]
      });

    } catch (error) {
      console.error('Socket send message error:', error);
      socket.emit('message_error', { error: 'Failed to send message' });
    }
  });

  // Handle typing indicators
  socket.on('typing_start', (data) => {
    socket.to(`chat_${data.chatId}`).emit('user_typing', {
      userId: socket.userId,
      username: socket.user.username,
      chatId: data.chatId
    });
  });

  socket.on('typing_stop', (data) => {
    socket.to(`chat_${data.chatId}`).emit('user_stopped_typing', {
      userId: socket.userId,
      username: socket.user.username,
      chatId: data.chatId
    });
  });

  // Handle disconnect
  socket.on('disconnect', async () => {
    console.log(`User ${socket.user.username} disconnected`);
    
    // Update user status to offline
    await pool.query(
      'UPDATE users SET status = $1, last_seen = CURRENT_TIMESTAMP WHERE id = $2',
      ['offline', socket.userId]
    );

    // Notify all user's chats that they went offline
    const userChats = await pool.query(
      'SELECT chat_id FROM chat_participants WHERE user_id = $1',
      [socket.userId]
    );

    userChats.rows.forEach(chat => {
      socket.to(`chat_${chat.chat_id}`).emit('user_status_changed', {
        userId: socket.userId,
        status: 'offline',
        lastSeen: new Date().toISOString()
      });
    });
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Socket.io server running`);
});
