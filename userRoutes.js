const express = require('express');
const router = express.Router();
const { loginUser, signup } = require('../controllers/userController');

router.post('/signup', signup);
router.post('/login', loginUser);
module.exports = router;
