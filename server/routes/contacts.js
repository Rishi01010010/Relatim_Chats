const express = require('express');
const pool = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Get all contacts for a user
router.get('/', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        u.id,
        u.username,
        u.email,
        u.avatar_url,
        u.status,
        u.last_seen,
        c.created_at as contact_added_at
      FROM contacts c
      JOIN users u ON c.contact_id = u.id
      WHERE c.user_id = $1
      ORDER BY u.username
    `, [req.user.id]);

    res.json({ contacts: result.rows });
  } catch (error) {
    console.error('Get contacts error:', error);
    res.status(500).json({ message: 'Server error while fetching contacts' });
  }
});

// Add a contact
router.post('/', authenticateToken, async (req, res) => {
  try {
    let { contactId } = req.body;

    if (!contactId) {
      return res.status(400).json({ message: 'Contact ID or username/email is required' });
    }

    if (contactId === req.user.id) {
      return res.status(400).json({ message: 'Cannot add yourself as a contact' });
    }

    // If contactId is not a number, treat it as username or email and find user id
    if (isNaN(contactId)) {
      const userResult = await pool.query(
        'SELECT id FROM users WHERE username = $1 OR email = $1',
        [contactId]
      );

      if (userResult.rows.length === 0) {
        return res.status(404).json({ message: 'Contact not found' });
      }

      contactId = userResult.rows[0].id;
    } else {
      contactId = parseInt(contactId, 10);
    }

    // Check if already a contact
    const existingContact = await pool.query(
      'SELECT id FROM contacts WHERE user_id = $1 AND contact_id = $2',
      [req.user.id, contactId]
    );

    if (existingContact.rows.length > 0) {
      return res.status(400).json({ message: 'Contact already added' });
    }

    // Add contact (bidirectional)
    await pool.query(
      'INSERT INTO contacts (user_id, contact_id) VALUES ($1, $2), ($2, $1)',
      [req.user.id, contactId]
    );

    // Get the added contact details
    const result = await pool.query(`
      SELECT 
        u.id,
        u.username,
        u.email,
        u.avatar_url,
        u.status,
        u.last_seen
      FROM users u
      WHERE u.id = $1
    `, [contactId]);

    res.status(201).json({
      message: 'Contact added successfully',
      contact: result.rows[0]
    });
  } catch (error) {
    console.error('Add contact error:', error);
    res.status(500).json({ message: 'Server error while adding contact' });
  }
});

// Remove a contact
router.delete('/:contactId', authenticateToken, async (req, res) => {
  try {
    const { contactId } = req.params;

    const result = await pool.query(
      'DELETE FROM contacts WHERE (user_id = $1 AND contact_id = $2) OR (user_id = $2 AND contact_id = $1)',
      [req.user.id, contactId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Contact not found' });
    }

    res.json({ message: 'Contact removed successfully' });
  } catch (error) {
    console.error('Remove contact error:', error);
    res.status(500).json({ message: 'Server error while removing contact' });
  }
});

// Search users (for adding contacts)
router.get('/search', authenticateToken, async (req, res) => {
  try {
    const { query } = req.query;

    if (!query || query.length < 2) {
      return res.status(400).json({ message: 'Search query must be at least 2 characters' });
    }

    const result = await pool.query(`
      SELECT 
        u.id,
        u.username,
        u.email,
        u.avatar_url,
        u.status
      FROM users u
      WHERE (u.username ILIKE $1 OR u.email ILIKE $1)
      AND u.id != $2
      AND u.id NOT IN (
        SELECT contact_id FROM contacts WHERE user_id = $2
      )
      ORDER BY u.username
      LIMIT 10
    `, [`%${query}%`, req.user.id]);

    res.json({ users: result.rows });
  } catch (error) {
    console.error('Search users error:', error);
    res.status(500).json({ message: 'Server error while searching users' });
  }
});

module.exports = router;
