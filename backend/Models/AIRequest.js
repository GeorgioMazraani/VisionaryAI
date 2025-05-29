const { DataTypes } = require('sequelize');
const sequelize = require('../Config/DBConfig');

const AIRequest = sequelize.define('AIRequest', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  conversation_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  prompt: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  response: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  success: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  latency_ms: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: 'ai_requests',
  timestamps: false,
});

module.exports = AIRequest;
