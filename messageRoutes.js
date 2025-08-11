const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const Message = require('../models/messageModel');
const User = require('../models/userModel');
const auth = require('../middleware/auth');

// Get recent messages with optional "after" filter
router.get('/recent', auth, async (req, res) => {
  try {
    const after = req.query.after;
    const whereClause = {};

    if (after && after !== '0') {
      whereClause.createdAt = { [Op.gt]: new Date(after) };
    }

    const messages = await Message.findAll({
      where: whereClause,
      order: [['createdAt', 'ASC']],
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name']
        }
      ]
    });

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

// Create a new message
router.post('/', auth, async (req, res) => {
  try {
    const { text } = req.body;
    if (!text || text.trim() === '') {
      return res.status(400).json({ error: 'Message cannot be empty' });
    }

    const saved = await Message.create({
      userId: req.user.id,
      text
    });

    res.status(201).json(saved);
  } catch (err) {
    console.error('Error saving message:', err);
    res.status(500).json({ error: 'Failed to save message' });
  }
});

module.exports = router;
