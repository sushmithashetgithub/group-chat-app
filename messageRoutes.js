// backend/routes/messageRoutes.js
const express = require('express');
const router = express.Router();
const Message = require('../models/messageModel');
const User = require('../models/userModel'); // for joining user name
const auth = require('../middleware/auth');

// Get recent messages with usernames
router.get('/recent', auth, async (req, res) => {
  try {
    const messages = await Message.findAll({
      order: [['createdAt', 'ASC']],
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name'] // only send needed fields
        }
      ]
    });

    // Transform into { id, text, from, createdAt }
    const formatted = messages.map(msg => ({
      id: msg.id,
      text: msg.text,
      from: msg.user?.name || 'Unknown',
      createdAt: msg.createdAt
    }));

    res.json(formatted);
  } catch (err) {
    console.error('Error fetching messages:', err);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

// Create a new message (also saves in DB)
router.post('/', auth, async (req, res) => {
  try {
    const { text } = req.body;
    if (!text || text.trim() === '') {
      return res.status(400).json({ error: 'Message cannot be empty' });
    }

    const saved = await Message.create({
      userId: req.user.id, // from auth middleware
      text
    });

    res.status(201).json(saved);
  } catch (err) {
    console.error('Error saving message:', err);
    res.status(500).json({ error: 'Failed to save message' });
  }
});

module.exports = router;
