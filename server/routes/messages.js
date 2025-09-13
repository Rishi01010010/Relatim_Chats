const express = require('express');
const pool = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Get messages for a chat
router.get('/:chatId', authenticateToken, async (req, res) => {
  try {
    const { chatId } = req.params;
    const { page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;

    console.log('Get messages request:', { chatId, userId: req.user.id, page, limit });

    // Check if user is participant
    const participantCheck = await pool.query(
      'SELECT id FROM chat_participants WHERE chat_id = $1 AND user_id = $2',
      [chatId, req.user.id]
    );

    console.log('Participant check result:', participantCheck.rows);

    if (participantCheck.rows.length === 0) {
      console.log('Access denied: user is not a participant in chat', chatId);
      return res.status(403).json({ message: 'Access denied' });
    }

    // Get messages
    const result = await pool.query(`
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
      WHERE m.chat_id = $1
      ORDER BY m.created_at DESC
      LIMIT $2 OFFSET $3
    `, [chatId, limit, offset]);

    console.log('Messages query result:', result.rows.length, 'messages found');

    // Mark messages as read
    await pool.query(
      'UPDATE chat_participants SET last_read_at = CURRENT_TIMESTAMP WHERE chat_id = $1 AND user_id = $2',
      [chatId, req.user.id]
    );

    console.log('Messages fetched successfully for chat', chatId);

    res.json({
      messages: result.rows.reverse(),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        hasMore: result.rows.length === parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Get messages error:', error);
    console.error('Error details:', error.message);
    console.error('Stack trace:', error.stack);
    res.status(500).json({ message: 'Server error while fetching messages' });
  }
});

// Send a message
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { chatId, content, messageType = 'text' } = req.body;

    if (!chatId || !content) {
      return res.status(400).json({ message: 'Chat ID and content are required' });
    }

    // Check if user is participant
    const participantCheck = await pool.query(
      'SELECT id FROM chat_participants WHERE chat_id = $1 AND user_id = $2',
      [chatId, req.user.id]
    );

    if (participantCheck.rows.length === 0) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Insert message
    const result = await pool.query(`
      INSERT INTO messages (chat_id, sender_id, content, message_type)
      VALUES ($1, $2, $3, $4)
      RETURNING id, created_at, updated_at
    `, [chatId, req.user.id, content, messageType]);

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

    res.status(201).json({
      message: 'Message sent successfully',
      message: messageWithSender.rows[0]
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ message: 'Server error while sending message' });
  }
});

// Delete a message
router.delete('/:messageId', authenticateToken, async (req, res) => {
  try {
    const { messageId } = req.params;

    // Check if user is the sender
    const messageCheck = await pool.query(
      'SELECT id, chat_id FROM messages WHERE id = $1 AND sender_id = $2',
      [messageId, req.user.id]
    );

    if (messageCheck.rows.length === 0) {
      return res.status(404).json({ message: 'Message not found or access denied' });
    }

    // Delete message
    await pool.query('DELETE FROM messages WHERE id = $1', [messageId]);

    res.json({ message: 'Message deleted successfully' });
  } catch (error) {
    console.error('Delete message error:', error);
    res.status(500).json({ message: 'Server error while deleting message' });
  }
});

module.exports = router;
