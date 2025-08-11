const express = require('express');
const router = express.Router();
const { createGroup } = require('../controllers/groupController');
const authMiddleware = require('../middleware/authMiddleware'); // JWT auth
const { joinGroup } = require('../controllers/groupController');

router.post('/create', authMiddleware, createGroup);
router.post('/join', authMiddleware, joinGroup);
module.exports = router;
