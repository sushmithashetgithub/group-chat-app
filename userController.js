const bcrypt = require('bcrypt');
const User = require('../models/user');

exports.signupUser = async (req, res) => {
  const { name, email, phone, password } = req.body;

  try {
    const userExists = await User.findOne({ where: { email } });

    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await User.create({
      name,
      email,
      phone,
      password: hashedPassword
    });

    res.status(201).json({ message: 'Signup successful' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
