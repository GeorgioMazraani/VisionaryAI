const { DataTypes } = require('sequelize');
const sequelize = require('../Config/DBConfig');

const ImageCapture = sequelize.define('ImageCapture', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  conversation_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  image_url: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  captured_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  }
}, {
  tableName: 'image_captures',
  timestamps: false,
});

module.exports = ImageCapture;
