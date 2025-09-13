const express = require('express');
const pool = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Get all chats for a user
router.get('/', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        c.id,
        COALESCE(
          CASE
            WHEN c.type = 'direct' THEN (
              SELECT u.username
              FROM users u
              JOIN chat_participants cp2 ON u.id = cp2.user_id
              WHERE cp2.chat_id = c.id AND cp2.user_id != $1
            )
            ELSE c.name
          END,
          'Direct Chat'
        ) as name,

        COALESCE(
          CASE
            WHEN c.type = 'direct' THEN (
              SELECT json_build_object('id', u.id, 'username', u.username)
              FROM users u
              JOIN chat_participants cp2 ON u.id = cp2.user_id
              WHERE cp2.chat_id = c.id AND cp2.user_id != $1
            )
            ELSE NULL
          END,
          json_build_object('id', 0, 'username', 'Unknown User')
        ) as other_user,

        c.type,
        c.created_at,
        c.updated_at,
        (
          SELECT content
          FROM messages m
          WHERE m.chat_id = c.id
          ORDER BY m.created_at DESC
          LIMIT 1
        ) as last_message,
        (
          SELECT created_at
          FROM messages m
          WHERE m.chat_id = c.id
          ORDER BY m.created_at DESC
          LIMIT 1
        ) as last_message_time,
        (
          SELECT COUNT(*)
          FROM messages m
          WHERE m.chat_id = c.id
          AND m.sender_id != $1
          AND m.created_at > COALESCE(
            (SELECT last_read_at FROM chat_participants cp
             WHERE cp.chat_id = c.id AND cp.user_id = $1),
            '1970-01-01'::timestamp
          )
        ) as unread_count,
        (
          SELECT json_agg(
            json_build_object('id', u.id, 'username', u.username)
          )
          FROM users u
          JOIN chat_participants cp3 ON u.id = cp3.user_id
          WHERE cp3.chat_id = c.id
        ) as participants
      FROM chats c
      JOIN chat_participants cp ON c.id = cp.chat_id
      WHERE cp.user_id = $1
      ORDER BY c.updated_at DESC



    `, [req.user.id]);

    res.json({ chats: result.rows });
  } catch (error) {
    console.error('Get chats error:', error);
    res.status(500).json({ message: 'Server error while fetching chats' });
  }
});

// Create a new chat (direct message)
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { contactId } = req.body;

    if (!contactId) {
      return res.status(400).json({ message: 'Contact ID is required' });
    }

    if (contactId === req.user.id) {
      return res.status(400).json({ message: 'Cannot create chat with yourself' });
    }

    // Check if contact exists
    const contactExists = await pool.query(
      'SELECT id, username, email FROM users WHERE id = $1',
      [contactId]
    );

    if (contactExists.rows.length === 0) {
      return res.status(404).json({ message: 'Contact not found' });
    }

    // Check if direct chat already exists
    const existingChat = await pool.query(`
      SELECT c.id
      FROM chats c
      JOIN chat_participants cp1 ON c.id = cp1.chat_id
      JOIN chat_participants cp2 ON c.id = cp2.chat_id
      WHERE c.type = 'direct'
      AND cp1.user_id = $1 AND cp2.user_id = $2
      AND cp1.user_id != cp2.user_id
    `, [req.user.id, contactId]);

    if (existingChat.rows.length > 0) {
      return res.status(400).json({ 
        message: 'Direct chat already exists',
        chatId: existingChat.rows[0].id
      });
    }

    // Create new chat
    const chatResult = await pool.query(
      'INSERT INTO chats (type, created_by) VALUES ($1, $2) RETURNING id',
      ['direct', req.user.id]
    );

    const chatId = chatResult.rows[0].id;

    // Add participants
    await pool.query(
      'INSERT INTO chat_participants (chat_id, user_id) VALUES ($1, $2), ($1, $3)',
      [chatId, req.user.id, contactId]
    );

    // Get contact details
    const contact = contactExists.rows[0];
    const displayName = contact.username || contact.email;

    res.status(201).json({
      message: 'Chat created successfully',
      chat: {
        id: chatId,
        name: displayName,
        other_user: { id: contact.id, username: displayName },
        type: 'direct',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        last_message: null,
        last_message_time: null,
        unread_count: 0
      }
    });
  } catch (error) {
    console.error('Create chat error:', error);
    res.status(500).json({ message: 'Server error while creating chat' });
  }
});


// Get chat details
router.get('/:chatId', authenticateToken, async (req, res) => {
  try {
    const { chatId } = req.params;

    // Check if user is participant
    const participantCheck = await pool.query(
      'SELECT id FROM chat_participants WHERE chat_id = $1 AND user_id = $2',
      [chatId, req.user.id]
    );

    if (participantCheck.rows.length === 0) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Get chat details
    const chatResult = await pool.query(`
      SELECT 
        c.id,
        c.name,
        c.type,
        c.created_at,
        c.updated_at
      FROM chats c
      WHERE c.id = $1
    `, [chatId]);

    if (chatResult.rows.length === 0) {
      return res.status(404).json({ message: 'Chat not found' });
    }

    // Get participants
    const participantsResult = await pool.query(`
      SELECT 
        u.id,
        u.username,
        u.email,
        u.avatar_url,
        u.status,
        cp.joined_at
      FROM chat_participants cp
      JOIN users u ON cp.user_id = u.id
      WHERE cp.chat_id = $1
    `, [chatId]);

    res.json({
      chat: {
        ...chatResult.rows[0],
        participants: participantsResult.rows
      }
    });
  } catch (error) {
    console.error('Get chat error:', error);
    res.status(500).json({ message: 'Server error while fetching chat' });
  }
});

module.exports = router;
