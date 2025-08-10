// backend/models/messageModel.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./userModel'); // adjust path if your user model name differs

const Message = sequelize.define('Message', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  text: {
    type: DataTypes.TEXT,
    allowNull: false
  }
}, {
  tableName: 'Messages',
  timestamps: true
});

// Optional association (so you can do Message.belongsTo(User))
Message.belongsTo(User, { foreignKey: 'userId', as: 'user' });

module.exports = Message;
