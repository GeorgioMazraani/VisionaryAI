const { DataTypes } = require('sequelize');
const sequelize = require('../Config/DBConfig');

const Detection = sequelize.define('Detection', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  image_capture_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  label: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  confidence: {
    type: DataTypes.FLOAT,
    allowNull: true,
  },
  bounding_box: {
    type: DataTypes.TEXT, // Optional format: "x:10,y:20,w:100,h:120"
    allowNull: true,
  },
}, {
  tableName: 'detections',
  timestamps: false,
});

module.exports = Detection;
