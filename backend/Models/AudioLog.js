const { DataTypes } = require('sequelize');
const sequelize = require('../Config/DBConfig');

const AudioLog = sequelize.define('AudioLog', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  message_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  audio_url: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  duration_seconds: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
}, {
  tableName: 'audio_logs',
  timestamps: false,
});

module.exports = AudioLog;
